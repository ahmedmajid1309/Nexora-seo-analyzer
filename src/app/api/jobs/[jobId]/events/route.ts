import { getAuditJobStatus } from "@/lib/jobs/queue";

export const runtime = "nodejs";

interface Params {
  params: Promise<{ jobId: string }>;
}

export async function GET(_: Request, { params }: Params): Promise<Response> {
  const { jobId } = await params;
  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      while (!closed) {
        const status = await getAuditJobStatus(jobId).catch(() => null);
        controller.enqueue(encoder.encode(`event: progress\ndata: ${JSON.stringify(status)}\n\n`));
        const state = status?.state;
        if (state === "completed" || state === "failed" || state === null) break;
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
    },
  });
}
