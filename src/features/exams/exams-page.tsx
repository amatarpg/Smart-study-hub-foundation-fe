import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/page-header";
import { DataTable, type Column } from "../../components/data-table";
import { ErrorBanner } from "../../components/error-banner";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { t } from "../../i18n";
import { api } from "../../lib/api/client";
import type { ClassExamRead, ExamModuleRead, QuestionRead } from "../../lib/api/types";

function statusVariant(status: string): "success" | "warning" | "secondary" | "default" {
  if (status === "published" || status === "approved" || status === "completed") return "success";
  if (status === "draft" || status === "in_review" || status === "pending_review" || status === "scheduled") return "warning";
  return "secondary";
}

export function ExamsPage(): JSX.Element {
  const modulesQuery = useQuery({ queryKey: ["exam-modules"], queryFn: () => api.get<ExamModuleRead[]>("/api/v1/exam-modules") });
  const questionsQuery = useQuery({ queryKey: ["questions"], queryFn: () => api.get<QuestionRead[]>("/api/v1/questions") });
  const classExamsQuery = useQuery({ queryKey: ["class-exams"], queryFn: () => api.get<ClassExamRead[]>("/api/v1/class-exams") });

  const error = modulesQuery.error ?? questionsQuery.error ?? classExamsQuery.error;
  const refetchAll = () => {
    void modulesQuery.refetch();
    void questionsQuery.refetch();
    void classExamsQuery.refetch();
  };

  const moduleColumns: Column<ExamModuleRead>[] = [
    { key: "title", header: t("common.name"), render: (m) => <span className="font-medium">{m.title}</span> },
    {
      key: "status",
      header: t("common.status"),
      render: (m) => <Badge variant={statusVariant(m.status)}>{t(`status.${m.status}` as never) === `status.${m.status}` ? m.status : t(`status.${m.status}` as never)}</Badge>,
    },
  ];

  const questionColumns: Column<QuestionRead>[] = [
    { key: "id", header: t("common.id"), render: (q) => <span className="font-mono text-xs">{q.id.slice(0, 8)}</span> },
    { key: "kind", header: "Tipe", render: (q) => <Badge variant="outline">{q.kind}</Badge> },
    {
      key: "status",
      header: t("common.status"),
      render: (q) => <Badge variant={statusVariant(q.status)}>{t(`status.${q.status}` as never)}</Badge>,
    },
  ];

  const examColumns: Column<ClassExamRead>[] = [
    { key: "title", header: t("common.name"), render: (e) => <span className="font-medium">{e.title}</span> },
    {
      key: "status",
      header: t("common.status"),
      render: (e) => <Badge variant={statusVariant(e.status)}>{t(`status.${e.status}` as never)}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader title={t("exams.title")} subtitle={t("exams.subtitle")} />
      {error ? <ErrorBanner error={error} onRetry={refetchAll} /> : null}
      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">{t("exams.modules")}</TabsTrigger>
          <TabsTrigger value="questions">{t("exams.questions")}</TabsTrigger>
          <TabsTrigger value="class-exams">{t("exams.classExams")}</TabsTrigger>
        </TabsList>
        <TabsContent value="modules">
          <DataTable columns={moduleColumns} rows={modulesQuery.data ?? []} loading={modulesQuery.isLoading} getRowKey={(m) => m.id} />
        </TabsContent>
        <TabsContent value="questions">
          <DataTable columns={questionColumns} rows={questionsQuery.data ?? []} loading={questionsQuery.isLoading} getRowKey={(q) => q.id} />
        </TabsContent>
        <TabsContent value="class-exams">
          <DataTable columns={examColumns} rows={classExamsQuery.data ?? []} loading={classExamsQuery.isLoading} getRowKey={(e) => e.id} />
        </TabsContent>
      </Tabs>
    </>
  );
}
