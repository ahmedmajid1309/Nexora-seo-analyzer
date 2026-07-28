let startedAt = Date.now();
let renderCount = 0;
let renderErrorCount = 0;

export function recordRender(success: boolean): void {
  renderCount += 1;
  if (!success) renderErrorCount += 1;
}

export function getMetrics(): {
  uptimeSeconds: number;
  renderCount: number;
  renderErrorCount: number;
} {
  return {
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    renderCount,
    renderErrorCount,
  };
}

export function resetMetricsForTests(): void {
  startedAt = Date.now();
  renderCount = 0;
  renderErrorCount = 0;
}
