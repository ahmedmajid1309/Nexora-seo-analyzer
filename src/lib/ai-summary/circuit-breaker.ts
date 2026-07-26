import type { AiSummaryProvider } from "./types";

interface CircuitState {
  failures: number;
  openedUntil: number;
}

const states = new Map<AiSummaryProvider, CircuitState>();
const FAILURE_THRESHOLD = 3;
const OPEN_MS = 60_000;

export function isAiSummaryCircuitOpen(provider: AiSummaryProvider): boolean {
  const state = states.get(provider);
  return Boolean(state && state.openedUntil > Date.now());
}

export function recordAiSummaryProviderSuccess(provider: AiSummaryProvider): void {
  states.delete(provider);
}

export function recordAiSummaryProviderFailure(provider: AiSummaryProvider): void {
  const state = states.get(provider) ?? { failures: 0, openedUntil: 0 };
  const failures = state.failures + 1;
  states.set(provider, {
    failures,
    openedUntil: failures >= FAILURE_THRESHOLD ? Date.now() + OPEN_MS : 0,
  });
}

export function getAiSummaryCircuitState(): Record<string, { failures: number; open: boolean }> {
  return Object.fromEntries(
    [...states.entries()].map(([provider, state]) => [
      provider,
      { failures: state.failures, open: state.openedUntil > Date.now() },
    ]),
  );
}
