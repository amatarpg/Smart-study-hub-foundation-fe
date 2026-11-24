import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/page-header";
import { DataTable, type Column } from "../../components/data-table";
import { ErrorBanner } from "../../components/error-banner";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { t } from "../../i18n";
import { api } from "../../lib/api/client";
import type { PersonRead } from "../../lib/api/types";

function personColumns(kind: "students" | "teachers" | "admins"): Column<PersonRead>[] {
  const columns: Column<PersonRead>[] = [
    { key: "name", header: t("common.fullName"), render: (p) => <span className="font-medium">{p.full_name}</span> },
  ];
  if (kind === "students") {
    columns.push({ key: "nisn", header: t("directory.nisn"), render: (p) => <span className="font-mono text-xs">{String(p.nisn ?? "—")}</span> });
    columns.push({ key: "class", header: t("directory.className"), render: (p) => <Badge variant="outline">{String(p.class_name ?? "—")}</Badge> });
  }
  if (kind === "teachers") {
    columns.push({ key: "nip", header: t("directory.nip"), render: (p) => <span className="font-mono text-xs">{String(p.nip ?? "—")}</span> });
  }
  if (kind === "admins") {
    columns.push({ key: "email", header: t("common.email"), render: (p) => <span className="text-xs">{p.email ?? "—"}</span> });
  }
  columns.push({
    key: "status",
    header: t("common.status"),
    render: (p) => (
      <Badge variant={p.is_active === false ? "warning" : "success"}>
        {p.is_active === false ? t("common.inactive") : t("common.active")}
      </Badge>
    ),
  });
  return columns;
}

export function DirectoryPage(): JSX.Element {
  const studentsQuery = useQuery({ queryKey: ["students"], queryFn: () => api.get<PersonRead[]>("/api/v1/students") });
  const teachersQuery = useQuery({ queryKey: ["teachers"], queryFn: () => api.get<PersonRead[]>("/api/v1/teachers") });
  const adminsQuery = useQuery({ queryKey: ["school-admins"], queryFn: () => api.get<PersonRead[]>("/api/v1/school-admins") });

  const error = studentsQuery.error ?? teachersQuery.error ?? adminsQuery.error;
  const refetch = () => {
    void studentsQuery.refetch();
    void teachersQuery.refetch();
    void adminsQuery.refetch();
  };

  return (
    <>
      <PageHeader title={t("directory.title")} subtitle={t("directory.subtitle")} />
      {error ? <ErrorBanner error={error} onRetry={refetch} /> : null}
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">{t("directory.students")}</TabsTrigger>
          <TabsTrigger value="teachers">{t("directory.teachers")}</TabsTrigger>
          <TabsTrigger value="admins">{t("directory.admins")}</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <DataTable
            columns={personColumns("students")}
            rows={studentsQuery.data ?? []}
            loading={studentsQuery.isLoading}
            getRowKey={(p) => p.id}
          />
        </TabsContent>
        <TabsContent value="teachers">
          <DataTable
            columns={personColumns("teachers")}
            rows={teachersQuery.data ?? []}
            loading={teachersQuery.isLoading}
            getRowKey={(p) => p.id}
          />
        </TabsContent>
        <TabsContent value="admins">
          <DataTable
            columns={personColumns("admins")}
            rows={adminsQuery.data ?? []}
            loading={adminsQuery.isLoading}
            getRowKey={(p) => p.id}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
