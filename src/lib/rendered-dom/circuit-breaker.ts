const FAILURE_THRESHOLD = 3;
const OPEN_MS = 60_000;

let consecutiveFailures = 0;
let openedUntil = 0;
let halfOpenProbeInFlight = false;

export type RenderCircuitState = "closed" | "open" | "half-open";

export function getRenderCircuitMode(nowMs = Date.now()): RenderCircuitState {
  if (!openedUntil) return "closed";
  return openedUntil > nowMs ? "open" : "half-open";
}

export function shouldSkipRenderWorkerCall(nowMs = Date.now()): boolean {
  const mode = getRenderCircuitMode(nowMs);
  if (mode === "open") return true;
  if (mode === "half-open") {
    if (halfOpenProbeInFlight) return true;
    halfOpenProbeInFlight = true;
  }
  return false;
}

export function isRenderCircuitOpen(nowMs = Date.now()): boolean {
  return shouldSkipRenderWorkerCall(nowMs);
}

export function recordRenderWorkerSuccess(): void {
  consecutiveFailures = 0;
  openedUntil = 0;
  halfOpenProbeInFlight = false;
}

export function recordRenderWorkerFailure(nowMs = Date.now()): void {
  consecutiveFailures += 1;
  halfOpenProbeInFlight = false;
  if (consecutiveFailures >= FAILURE_THRESHOLD) openedUntil = nowMs + OPEN_MS;
}

export function getRenderCircuitState(nowMs = Date.now()): {
  state: RenderCircuitState;
  consecutiveFailures: number;
  openedUntil: number | null;
  halfOpenProbeInFlight: boolean;
} {
  return {
    state: getRenderCircuitMode(nowMs),
    consecutiveFailures,
    openedUntil: openedUntil || null,
    halfOpenProbeInFlight,
  };
}

export function resetRenderCircuitForTests(): void {
  consecutiveFailures = 0;
  openedUntil = 0;
  halfOpenProbeInFlight = false;
}
