import { AlertTriangle } from "lucide-react";
import { ApiError, ConflictError, UnauthorizedError } from "../lib/api/errors";
import { t } from "../i18n";

interface ErrorBannerProps {
  error: unknown;
  onRetry?: () => void;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ConflictError) return t("errors.conflict");
  if (error instanceof UnauthorizedError) return t("errors.unauthorized");
  if (error instanceof ApiError) {
    if (error.status === 403) return t("errors.forbidden");
    if (error.status === 404) return t("errors.notFound");
    if (error.status === 0) return t("errors.network");
    if (error.status >= 500) return t("errors.server");
    return error.detail;
  }
  return t("errors.server");
}

export function ErrorBanner({ error, onRetry }: ErrorBannerProps): JSX.Element {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{t("common.error")}</p>
        <p>{errorMessage(error)}</p>
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">
          {t("common.retry")}
        </button>
      ) : null}
    </div>
  );
}
