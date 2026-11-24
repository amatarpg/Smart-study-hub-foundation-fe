import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "../../components/page-header";
import { ErrorBanner } from "../../components/error-banner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { t } from "../../i18n";
import { api } from "../../lib/api/client";
import type { JobRead } from "../../lib/api/types";
import { formatDateTime } from "../../lib/utils";
import { useRealtimeStore } from "../../store/realtime";

export function JobsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const wsStatus = useRealtimeStore((s) => s.status);
  const events = useRealtimeStore((s) => s.events);

  const jobQuery = useQuery({
    queryKey: ["jobs", lastJobId],
    queryFn: () => api.get<JobRead>(`/api/v1/jobs/${lastJobId}`),
    enabled: !!lastJobId,
    refetchInterval: (query) => {
      const status = (query.state.data as JobRead | undefined)?.status;
      return status === "pending" || status === "running" ? 2000 : false;
    },
  });

  const createJob = useMutation({
    mutationFn: () =>
      api.post<JobRead>("/api/v1/jobs/subject-report", undefined, {
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: (job) => {
      setLastJobId(job.id);
      toast.success("Pekerjaan dibuat");
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal membuat pekerjaan"),
  });

  const job = jobQuery.data;

  return (
    <>
      <PageHeader
        title={t("jobs.title")}
        subtitle={t("jobs.subtitle")}
        actions={
          <Button onClick={() => createJob.mutate()} disabled={createJob.isPending}>
            {createJob.isPending ? t("jobs.creating") : t("jobs.createReport")}
          </Button>
        }
      />
      {jobQuery.error ? <ErrorBanner error={jobQuery.error} onRetry={() => void jobQuery.refetch()} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>{t("jobs.status")}</span>
              <Badge variant={wsStatus === "connected" ? "success" : "secondary"}>{t(`ws.${wsStatus}`)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!lastJobId ? (
              <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("common.id")}</dt>
                  <dd className="truncate font-mono text-xs">{job?.id ?? lastJobId}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("common.status")}</dt>
                  <dd>
                    <Badge variant={job?.status === "completed" ? "success" : job?.status === "failed" ? "destructive" : "warning"}>
                      {job ? t(`status.${job.status}` as never) : t("status.pending")}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("common.createdAt")}</dt>
                  <dd className="text-xs">{formatDateTime(job?.created_at)}</dd>
                </div>
                {job?.result ? (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{t("jobs.result")}</p>
                    <pre className="overflow-auto text-xs">{JSON.stringify(job.result, null, 2)}</pre>
                  </div>
                ) : null}
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("jobs.events")}</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("jobs.noEvents")}</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-auto">
                {events.map((event) => (
                  <li key={event.event_id} className="rounded-lg border px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono">{event.type}</span>
                      <Badge variant="outline">{String(event.event_id).slice(0, 8)}</Badge>
                    </div>
                    <pre className="mt-1 overflow-auto text-muted-foreground">{JSON.stringify(event, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
