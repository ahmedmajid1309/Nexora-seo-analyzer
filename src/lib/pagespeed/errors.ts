export class PageSpeedError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "PageSpeedError";
  }
}

export class PageSpeedQuotaError extends PageSpeedError {
  constructor(message = "PageSpeed Insights API quota exceeded") {
    super(message, "QUOTA_EXCEEDED", 429);
    this.name = "PageSpeedQuotaError";
  }
}

export class PageSpeedAuthError extends PageSpeedError {
  constructor(message = "PageSpeed Insights API key is invalid or missing") {
    super(message, "AUTH_ERROR", 403);
    this.name = "PageSpeedAuthError";
  }
}

export class PageSpeedApiError extends PageSpeedError {
  constructor(message: string, statusCode?: number) {
    super(message, "API_ERROR", statusCode);
    this.name = "PageSpeedApiError";
  }
}

export class PageSpeedNetworkError extends PageSpeedError {
  constructor(message = "Failed to reach PageSpeed Insights API") {
    super(message, "NETWORK_ERROR", 502);
    this.name = "PageSpeedNetworkError";
  }
}

export class PageSpeedParseError extends PageSpeedError {
  constructor(message = "Failed to parse PageSpeed Insights response") {
    super(message, "PARSE_ERROR");
    this.name = "PageSpeedParseError";
  }
}

export function classifyPageSpeedError(err: unknown): PageSpeedError {
  if (err instanceof PageSpeedError) return err;

  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("quota") || msg.includes("QUOTA")) {
      return new PageSpeedQuotaError();
    }
    if (msg.includes("API key not valid") || msg.includes("403") || msg.includes("FORBIDDEN")) {
      return new PageSpeedAuthError();
    }
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("ENOTFOUND")) {
      return new PageSpeedNetworkError();
    }
    return new PageSpeedApiError(msg);
  }

  return new PageSpeedApiError("Unknown PageSpeed error");
}
