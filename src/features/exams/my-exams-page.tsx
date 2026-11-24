import { useQuery } from "@tanstack/react-query";
import { Clock, ClipboardList } from "lucide-react";
import { PageHeader } from "../../components/page-header";
import { DataTable, type Column } from "../../components/data-table";
import { ErrorBanner } from "../../components/error-banner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { t } from "../../i18n";
import { api } from "../../lib/api/client";
import { formatDateTime } from "../../lib/utils";
import type { StudentExamRead } from "../../lib/api/types";

export function MyExamsPage(): JSX.Element {
  const examsQuery = useQuery({
    queryKey: ["student", "exams"],
    queryFn: () => api.get<StudentExamRead[]>("/api/v1/student/exams"),
  });

  const columns: Column<StudentExamRead>[] = [
    { key: "title", header: t("common.name"), render: (e) => <span className="font-medium">{e.title}</span> },
    { key: "subject", header: t("exams.subject"), render: (e) => <Badge variant="outline">{e.subject}</Badge> },
    { key: "start", header: t("exams.start"), render: (e) => <span className="text-xs">{formatDateTime(e.scheduled_start)}</span> },
    { key: "deadline", header: t("exams.deadline"), render: (e) => <span className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />{formatDateTime(e.deadline)}</span> },
    {
      key: "status",
      header: t("common.status"),
      render: (e) => <Badge variant={e.status === "available" ? "success" : "warning"}>{t(`status.${e.status}` as never)}</Badge>,
    },
    {
      key: "action",
      header: t("common.actions"),
      render: (e) => (
        <Button size="sm" variant={e.status === "available" ? "default" : "outline"} disabled={e.status !== "available"}>
          <ClipboardList className="h-3.5 w-3.5" />
          {t("exams.attempt")}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={t("exams.myExams")} subtitle={t("exams.subtitle")} />
      {examsQuery.error ? <ErrorBanner error={examsQuery.error} onRetry={() => void examsQuery.refetch()} /> : null}
      <DataTable
        columns={columns}
        rows={examsQuery.data ?? []}
        loading={examsQuery.isLoading}
        getRowKey={(e) => e.exam_id}
        emptyMessage={t("common.noData")}
      />
    </>
  );
}
