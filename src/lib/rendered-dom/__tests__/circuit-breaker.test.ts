import { beforeEach, describe, expect, it } from "vitest";
import {
  getRenderCircuitState,
  recordRenderWorkerFailure,
  recordRenderWorkerSuccess,
  resetRenderCircuitForTests,
  shouldSkipRenderWorkerCall,
} from "../circuit-breaker";

describe("render worker circuit breaker", () => {
  beforeEach(() => resetRenderCircuitForTests());

  it("starts closed", () => {
    expect(getRenderCircuitState(1_000).state).toBe("closed");
    expect(shouldSkipRenderWorkerCall(1_000)).toBe(false);
  });

  it("opens after the failure threshold", () => {
    recordRenderWorkerFailure(1_000);
    recordRenderWorkerFailure(1_001);
    expect(getRenderCircuitState(1_002).state).toBe("closed");
    recordRenderWorkerFailure(1_003);
    expect(getRenderCircuitState(1_004).state).toBe("open");
    expect(shouldSkipRenderWorkerCall(1_004)).toBe(true);
  });

  it("moves to half-open after cooldown and allows one bounded probe", () => {
    recordRenderWorkerFailure(1_000);
    recordRenderWorkerFailure(1_001);
    recordRenderWorkerFailure(1_002);

    expect(getRenderCircuitState(61_003).state).toBe("half-open");
    expect(shouldSkipRenderWorkerCall(61_003)).toBe(false);
    expect(shouldSkipRenderWorkerCall(61_004)).toBe(true);
  });

  it("successful half-open probe closes the circuit", () => {
    recordRenderWorkerFailure(1_000);
    recordRenderWorkerFailure(1_001);
    recordRenderWorkerFailure(1_002);
    expect(shouldSkipRenderWorkerCall(61_003)).toBe(false);

    recordRenderWorkerSuccess();

    expect(getRenderCircuitState(61_004).state).toBe("closed");
    expect(getRenderCircuitState(61_004).consecutiveFailures).toBe(0);
  });

  it("failed half-open probe reopens the circuit", () => {
    recordRenderWorkerFailure(1_000);
    recordRenderWorkerFailure(1_001);
    recordRenderWorkerFailure(1_002);
    expect(shouldSkipRenderWorkerCall(61_003)).toBe(false);

    recordRenderWorkerFailure(61_004);

    expect(getRenderCircuitState(61_005).state).toBe("open");
  });

  it("health-safe state contains no internal URL, secret, or stack", () => {
    const state = getRenderCircuitState(1_000);
    const json = JSON.stringify(state);

    expect(json).not.toContain("http");
    expect(json).not.toContain("secret");
    expect(json).not.toContain("stack");
  });
});
