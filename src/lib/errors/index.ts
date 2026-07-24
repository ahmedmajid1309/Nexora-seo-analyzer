const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_URL: "INVALID_URL",
  RATE_LIMITED: "RATE_LIMITED",
  AUDIT_FAILED: "AUDIT_FAILED",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

interface FieldValidationError {
  path: string;
  message: string;
}

interface InternalDiagnosticData {
  [key: string]: string | number | boolean | null | undefined;
}

export class NexoraError extends Error {
  public readonly code: ErrorCode | (string & {});
  public readonly userMessage: string;
  public readonly validationErrors?: FieldValidationError[];
  public readonly requestId?: string;
  public readonly httpStatus: number;
  private readonly diagnosticData: InternalDiagnosticData;

  constructor(params: {
    code: ErrorCode | (string & {});
    userMessage: string;
    httpStatus?: number;
    validationErrors?: FieldValidationError[];
    requestId?: string;
    diagnosticData?: InternalDiagnosticData;
  }) {
    super(params.code);
    this.name = "NexoraError";
    this.code = params.code;
    this.userMessage = params.userMessage;
    this.httpStatus = params.httpStatus ?? 500;
    this.validationErrors = params.validationErrors;
    this.requestId = params.requestId;
    this.diagnosticData = params.diagnosticData ?? {};
  }

  toPublicResponse() {
    return {
      success: false as const,
      error: {
        code: this.code,
        message: this.userMessage,
        requestId: this.requestId,
        ...(this.validationErrors ? { validationErrors: this.validationErrors } : {}),
      },
    };
  }

  getDiagnosticData(): InternalDiagnosticData {
    return { ...this.diagnosticData };
  }
}

export function isNexoraError(error: unknown): error is NexoraError {
  return error instanceof NexoraError;
}

export function validationError(message: string, validationErrors?: FieldValidationError[]) {
  return new NexoraError({
    code: ERROR_CODES.VALIDATION_ERROR,
    userMessage: message,
    httpStatus: 400,
    validationErrors,
  });
}

export function invalidUrlError(message?: string) {
  return new NexoraError({
    code: ERROR_CODES.INVALID_URL,
    userMessage:
      message ?? "The provided URL is not valid. Please enter a complete website address.",
    httpStatus: 400,
  });
}

export function rateLimitedError() {
  return new NexoraError({
    code: ERROR_CODES.RATE_LIMITED,
    userMessage: "Too many requests. Please wait a moment before trying again.",
    httpStatus: 429,
  });
}

export function notFoundError(message?: string) {
  return new NexoraError({
    code: ERROR_CODES.NOT_FOUND,
    userMessage: message ?? "The page you are looking for does not exist.",
    httpStatus: 404,
  });
}

export function internalError() {
  return new NexoraError({
    code: ERROR_CODES.INTERNAL_ERROR,
    userMessage: "Something went wrong. Please try again later.",
    httpStatus: 500,
  });
}
