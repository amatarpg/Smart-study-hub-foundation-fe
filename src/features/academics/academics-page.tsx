import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/page-header";
import { DataTable, type Column } from "../../components/data-table";
import { ErrorBanner } from "../../components/error-banner";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { t } from "../../i18n";
import { api } from "../../lib/api/client";
import { formatDate } from "../../lib/utils";
import type {
  AcademicPeriodRead,
  AcademicYearRead,
  ClassRead,
  ProgramRead,
  SubjectRead,
} from "../../lib/api/types";

export function AcademicsPage(): JSX.Element {
  const yearsQuery = useQuery({ queryKey: ["academic-years"], queryFn: () => api.get<AcademicYearRead[]>("/api/v1/academic-years") });
  const periodsQuery = useQuery({ queryKey: ["academic-periods"], queryFn: () => api.get<AcademicPeriodRead[]>("/api/v1/academic-periods") });
  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: () => api.get<ClassRead[]>("/api/v1/classes") });
  const programsQuery = useQuery({ queryKey: ["expertise-programs"], queryFn: () => api.get<ProgramRead[]>("/api/v1/expertise-programs") });
  const subjectsQuery = useQuery({ queryKey: ["subjects"], queryFn: () => api.get<SubjectRead[]>("/api/v1/subjects") });

  const error = yearsQuery.error ?? periodsQuery.error ?? classesQuery.error ?? programsQuery.error ?? subjectsQuery.error;
  const refetchAll = () => {
    void yearsQuery.refetch();
    void periodsQuery.refetch();
    void classesQuery.refetch();
    void programsQuery.refetch();
    void subjectsQuery.refetch();
  };

  const yearColumns: Column<AcademicYearRead>[] = [
    { key: "label", header: t("academics.label"), render: (y) => <span className="font-medium">{y.label}</span> },
    { key: "start", header: t("academics.startDate"), render: (y) => formatDate(y.start_date) },
    { key: "end", header: t("academics.endDate"), render: (y) => formatDate(y.end_date) },
    { key: "status", header: t("common.status"), render: (y) => <Badge variant={y.is_active ? "success" : "secondary"}>{y.is_active ? t("common.active") : t("common.inactive")}</Badge> },
  ];

  const periodColumns: Column<AcademicPeriodRead>[] = [
    { key: "name", header: t("common.name"), render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "start", header: t("academics.startDate"), render: (p) => formatDate(p.start_date) },
    { key: "end", header: t("academics.endDate"), render: (p) => formatDate(p.end_date) },
    { key: "status", header: t("common.status"), render: (p) => <Badge variant={p.is_active ? "success" : "secondary"}>{p.is_active ? t("common.active") : t("common.inactive")}</Badge> },
  ];

  const classColumns: Column<ClassRead>[] = [
    { key: "name", header: t("common.name"), render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "grade", header: t("academics.gradeLevel"), render: (c) => <Badge variant="outline">{c.grade_level}</Badge> },
  ];

  const programColumns: Column<ProgramRead>[] = [
    { key: "code", header: t("common.code"), render: (p) => <span className="font-mono text-xs">{p.code}</span> },
    { key: "name", header: t("common.name"), render: (p) => p.name },
    { key: "description", header: t("academics.description"), render: (p) => <span className="text-muted-foreground">{p.description ?? "—"}</span> },
  ];

  const subjectColumns: Column<SubjectRead>[] = [
    { key: "code", header: t("common.code"), render: (s) => <span className="font-mono text-xs">{s.code}</span> },
    { key: "name", header: t("common.name"), render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "description", header: t("academics.description"), render: (s) => <span className="text-muted-foreground">{s.description ?? "—"}</span> },
  ];

  return (
    <>
      <PageHeader title={t("academics.title")} subtitle={t("academics.subtitle")} />
      {error ? <ErrorBanner error={error} onRetry={refetchAll} /> : null}
      <Tabs defaultValue="years">
        <TabsList className="flex-wrap">
          <TabsTrigger value="years">{t("academics.years")}</TabsTrigger>
          <TabsTrigger value="periods">{t("academics.periods")}</TabsTrigger>
          <TabsTrigger value="classes">{t("academics.classes")}</TabsTrigger>
          <TabsTrigger value="programs">{t("academics.programs")}</TabsTrigger>
          <TabsTrigger value="subjects">{t("academics.subjects")}</TabsTrigger>
        </TabsList>
        <TabsContent value="years">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("academics.years")}</CardTitle></CardHeader>
            <CardContent>
              <DataTable columns={yearColumns} rows={yearsQuery.data ?? []} loading={yearsQuery.isLoading} getRowKey={(y) => y.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="periods">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("academics.periods")}</CardTitle></CardHeader>
            <CardContent>
              <DataTable columns={periodColumns} rows={periodsQuery.data ?? []} loading={periodsQuery.isLoading} getRowKey={(p) => p.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="classes">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("academics.classes")}</CardTitle></CardHeader>
            <CardContent>
              <DataTable columns={classColumns} rows={classesQuery.data ?? []} loading={classesQuery.isLoading} getRowKey={(c) => c.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="programs">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("academics.programs")}</CardTitle></CardHeader>
            <CardContent>
              <DataTable columns={programColumns} rows={programsQuery.data ?? []} loading={programsQuery.isLoading} getRowKey={(p) => p.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subjects">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("academics.subjects")}</CardTitle></CardHeader>
            <CardContent>
              <DataTable columns={subjectColumns} rows={subjectsQuery.data ?? []} loading={subjectsQuery.isLoading} getRowKey={(s) => s.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
