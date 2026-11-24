export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;
  readonly fieldErrors: FieldError[];

  constructor(status: number, detail: string, fieldErrors: FieldError[] = []) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(detail = "Sesi tidak valid atau sudah kedaluwarsa") {
    super(401, detail);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends ApiError {
  constructor(detail = "Data berubah sejak dibaca (409)") {
    super(409, detail);
    this.name = "ConflictError";
  }
}

interface FastApiValidationIssue {
  loc?: (string | number)[];
  msg?: string;
}

export function parseErrorBody(status: number, body: unknown): ApiError {
  if (status === 409) {
    return new ConflictError(extractDetail(body) ?? undefined);
  }
  if (status === 401) {
    return new UnauthorizedError(extractDetail(body) ?? undefined);
  }
  const detail = extractDetail(body);
  const fieldErrors: FieldError[] = [];
  if (body && typeof body === "object" && Array.isArray((body as { detail?: unknown }).detail)) {
    for (const issue of (body as { detail: FastApiValidationIssue[] }).detail) {
      const loc = Array.isArray(issue.loc) ? issue.loc : [];
      const field = loc.filter((p) => p !== "body" && p !== "query").join(".") || "body";
      fieldErrors.push({ field, message: issue.msg ?? "Tidak valid" });
    }
  }
  return new ApiError(status, detail ?? `Permintaan gagal (HTTP ${status})`, fieldErrors);
}

function extractDetail(body: unknown): string | null {
  if (body && typeof body === "object") {
    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as FastApiValidationIssue;
      return first.msg ?? null;
    }
  }
  return null;
}
