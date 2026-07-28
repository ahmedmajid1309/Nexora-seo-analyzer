import { env } from "@/config/env";
import type { PageSnapshot } from "@/lib/extraction/types";
import { compareRenderedDom } from "./comparison";
import {
  RenderWorkerResponseSchema,
  unavailableRenderedAnalysis,
  type RenderedDomAnalysis,
} from "./contracts";
import {
  getRenderCircuitState,
  recordRenderWorkerFailure,
  recordRenderWorkerSuccess,
  shouldSkipRenderWorkerCall,
} from "./circuit-breaker";
import { signRenderWorkerPayload } from "./signing";

function isConfigured(): boolean {
  return Boolean(env.RENDER_WORKER_ENABLED && env.RENDER_WORKER_URL && env.RENDER_WORKER_SECRET);
}

export function getRenderedDomReadiness(): {
  enabled: boolean;
  configured: boolean;
  circuitState: ReturnType<typeof getRenderCircuitState>;
} {
  return {
    enabled: env.RENDER_WORKER_ENABLED,
    configured: isConfigured(),
    circuitState: getRenderCircuitState(),
  };
}

export async function analyzeRenderedDom(input: {
  requestId: string;
  snapshot: PageSnapshot;
  signal?: AbortSignal;
}): Promise<RenderedDomAnalysis> {
  if (!env.RENDER_WORKER_ENABLED) {
    return unavailableRenderedAnalysis("not-configured", "Rendered DOM analysis is disabled.");
  }
  if (!env.RENDER_WORKER_URL || !env.RENDER_WORKER_SECRET) {
    return unavailableRenderedAnalysis("not-configured", "Rendered DOM worker is not configured.");
  }
  if (shouldSkipRenderWorkerCall()) {
    return unavailableRenderedAnalysis(
      "circuit-open",
      "Rendered DOM worker circuit breaker is open.",
    );
  }

  const body = JSON.stringify({
    requestId: input.requestId,
    url: input.snapshot.finalUrl,
    timeoutMs: env.RENDER_WORKER_TIMEOUT_MS,
  });
  const timestamp = String(Date.now());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.RENDER_WORKER_TIMEOUT_MS + 1_000);
  input.signal?.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const response = await fetch(new URL("/render", env.RENDER_WORKER_URL), {
      method: "POST",
      body,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-render-worker-timestamp": timestamp,
        "x-render-worker-signature": signRenderWorkerPayload({
          body,
          timestamp,
          secret: env.RENDER_WORKER_SECRET,
        }),
      },
    });
    const payload = RenderWorkerResponseSchema.safeParse(await response.json());
    if (!response.ok || !payload.success || !payload.data.success || !payload.data.snapshot) {
      recordRenderWorkerFailure();
      return unavailableRenderedAnalysis(
        "error",
        "Rendered DOM worker returned no usable snapshot.",
      );
    }
    recordRenderWorkerSuccess();
    return compareRenderedDom({
      staticSnapshot: input.snapshot,
      renderedSnapshot: payload.data.snapshot,
    });
  } catch {
    recordRenderWorkerFailure();
    return unavailableRenderedAnalysis("unreachable", "Rendered DOM worker could not be reached.");
  } finally {
    clearTimeout(timeout);
  }
}
