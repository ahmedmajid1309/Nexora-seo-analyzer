import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { RenderRequestSchema } from "./contracts.js";
import { getMetrics, recordRender } from "./metrics.js";
import { renderPage } from "./render.js";
import { verifySignature } from "./security.js";

const PORT = Number(process.env.PORT ?? 3001);
const SECRET = process.env.RENDER_WORKER_SECRET;
export const MAX_BODY_BYTES = 8_192;
export const MAX_RESPONSE_BYTES = 128_000;

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  if (body.length > MAX_RESPONSE_BYTES) {
    response.writeHead(502, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(
      JSON.stringify({
        success: false,
        error: { code: "RESPONSE_TOO_LARGE", message: "Rendered snapshot exceeded response limit" },
      }),
    );
    return;
  }
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(body);
}

export async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error("Request body too large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      status: SECRET ? "ok" : "misconfigured",
      timestamp: new Date().toISOString(),
      ...getMetrics(),
    });
    return;
  }

  if (request.method !== "POST" || request.url !== "/render") {
    sendJson(response, 404, { success: false, error: { code: "NOT_FOUND", message: "Not found" } });
    return;
  }

  if (!SECRET) {
    sendJson(response, 503, {
      success: false,
      error: { code: "MISCONFIGURED", message: "Render worker secret is not configured" },
    });
    return;
  }

  let body = "";
  try {
    body = await readBody(request);
    const timestamp = request.headers["x-render-worker-timestamp"];
    const signature = request.headers["x-render-worker-signature"];
    if (
      !verifySignature({
        body,
        timestamp: Array.isArray(timestamp) ? timestamp[0] : timestamp,
        signature: Array.isArray(signature) ? signature[0] : signature,
        secret: SECRET,
      })
    ) {
      sendJson(response, 401, {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid render worker signature" },
      });
      return;
    }

    const parsed = RenderRequestSchema.safeParse(JSON.parse(body));
    if (!parsed.success) {
      sendJson(response, 400, {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        },
      });
      return;
    }

    const snapshot = await renderPage(parsed.data);
    recordRender(true);
    sendJson(response, 200, { success: true, requestId: parsed.data.requestId, snapshot });
  } catch (err) {
    recordRender(false);
    if (err instanceof Error && err.message === "Request body too large") {
      sendJson(response, 413, {
        success: false,
        error: { code: "REQUEST_TOO_LARGE", message: "Request body too large" },
      });
      return;
    }
    sendJson(response, 502, {
      success: false,
      error: {
        code: "RENDER_FAILED",
        message: err instanceof Error ? err.message : "Rendered DOM capture failed",
      },
    });
  }
});

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Render worker listening on ${PORT}`);
  });
}
