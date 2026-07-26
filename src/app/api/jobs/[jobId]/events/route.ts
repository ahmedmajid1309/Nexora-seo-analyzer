import { getAuditJobStatus } from "@/lib/jobs/queue";
import { readJobAccessToken } from "@/lib/jobs/access";

export const runtime = "nodejs";

interface Params {
  params: Promise<{ jobId: string }>;
}

export async function GET(request: Request, { params }: Params): Promise<Response> {
  const { jobId } = await params;
  const accessToken = readJobAccessToken(request);
  const initial = await getAuditJobStatus(jobId, accessToken).catch(() => null);
  if (!initial)
    return Response.json(
      { success: false, error: "Job not found or access denied" },
      { status: 404 },
    );
  const lastEventId = Number(request.headers.get("last-event-id") ?? "0") || 0;
  const encoder = new TextEncoder();
  let closed = false;
  let eventId = lastEventId;
  const stream = new ReadableStream({
    async start(controller) {
      const deadline = Date.now() + 5 * 60_000;
      while (!closed) {
        const status = await getAuditJobStatus(jobId, accessToken).catch(() => null);
        eventId += 1;
        if (status) {
          controller.enqueue(
            encoder.encode(`id: ${eventId}\nevent: progress\ndata: ${JSON.stringify(status)}\n\n`),
          );
        } else {
          controller.enqueue(encoder.encode(`id: ${eventId}\nevent: closed\ndata: null\n\n`));
        }
        const state = status?.state;
        if (state === "completed" || state === "failed" || state === null || Date.now() >= deadline)
          break;
        eventId += 1;
        controller.enqueue(encoder.encode(`id: ${eventId}\nevent: heartbeat\ndata: {}\n\n`));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    },
    cancel() {
      closed = true;
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
