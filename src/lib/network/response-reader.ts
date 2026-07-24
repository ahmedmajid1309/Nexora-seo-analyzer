import * as http from "http";
import { MAX_FETCH_SIZE_BYTES, READ_TIMEOUT_MS, USER_AGENT, ACCEPT_HEADER } from "./constants";

export interface StreamResult {
  buffer: Buffer;
  headers: http.IncomingHttpHeaders;
  statusCode: number;
  statusMessage: string;
  byteLength: number;
}

export class ResponseReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResponseReadError";
  }
}

export function readResponseStream(
  res: http.IncomingMessage,
  options: {
    maxSize?: number;
    maxHeadersSize?: number;
    readTimeout?: number;
    signal?: AbortSignal;
  } = {},
): Promise<StreamResult> {
  return new Promise((resolve, reject) => {
    const maxSize = options.maxSize ?? MAX_FETCH_SIZE_BYTES;
    const readTimeout = options.readTimeout ?? READ_TIMEOUT_MS;

    const timer = setTimeout(() => {
      res.destroy();
      reject(new ResponseReadError("Read timeout"));
    }, readTimeout);

    const cleanup = () => {
      clearTimeout(timer);
    };

    if (options.signal?.aborted) {
      cleanup();
      reject(new ResponseReadError("Request was aborted"));
      return;
    }

    const onAbort = () => {
      cleanup();
      reject(new ResponseReadError("Request was aborted"));
    };
    options.signal?.addEventListener("abort", onAbort, { once: true });

    const chunks: Buffer[] = [];
    let totalBytes = 0;

    const statusCode = res.statusCode ?? 0;
    const statusMessage = res.statusMessage ?? "";

    res.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > maxSize) {
        cleanup();
        res.destroy();
        reject(
          new ResponseReadError("Response exceeded maximum size of " + String(maxSize) + " bytes"),
        );
        return;
      }
      chunks.push(chunk);
    });

    res.on("end", () => {
      cleanup();
      options.signal?.removeEventListener("abort", onAbort);
      const buffer = Buffer.concat(chunks);
      resolve({
        buffer,
        headers: res.headers,
        statusCode,
        statusMessage,
        byteLength: buffer.length,
      });
    });

    res.on("error", (err) => {
      cleanup();
      reject(new ResponseReadError("Stream error: " + err.message));
    });
  });
}

export function buildRequestOptions(url: URL, address: string): http.RequestOptions {
  const isHttps = url.protocol === "https:";
  const port = url.port ? parseInt(url.port, 10) : isHttps ? 443 : 80;

  const options: http.RequestOptions = {
    hostname: address,
    port,
    path: url.pathname + url.search,
    method: "GET",
    headers: {
      Host: url.hostname,
      "User-Agent": USER_AGENT,
      Accept: ACCEPT_HEADER,
    },
    timeout: READ_TIMEOUT_MS,
    setHost: false,
  };

  if (isHttps) {
    (options as Record<string, unknown>).rejectUnauthorized = true;
    (options as Record<string, unknown>).servername = url.hostname;
  }

  return options;
}
