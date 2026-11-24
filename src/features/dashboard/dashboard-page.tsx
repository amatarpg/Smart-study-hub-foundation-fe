import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Library, ClipboardList, Briefcase } from "lucide-react";
import { PageHeader } from "../../components/page-header";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { t } from "../../i18n";
import { api } from "../../lib/api/client";
import { formatDateTime } from "../../lib/utils";
import { useAuthStore } from "../../store/auth";
import { useSchoolStore } from "../../store/school";
import { useRealtimeStore } from "../../store/realtime";
import type { PersonRead, SubjectRead, SubjectStatistics, StudentExamRead } from "../../lib/api/types";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: JSX.Element;
  hint?: string;
}

function StatCard({ label, value, icon, hint }: StatCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function DashboardPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const activeSchool = useSchoolStore((s) => s.activeSchool);
  const events = useRealtimeStore((s) => s.events);
  const role = activeSchool?.role ?? "student";

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => api.get<SubjectRead[]>("/api/v1/subjects"),
  });
  const subjectsStatsQuery = useQuery({
    queryKey: ["subjects", "statistics"],
    queryFn: () => api.get<SubjectStatistics>("/api/v1/subjects/statistics"),
  });
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get<PersonRead[]>("/api/v1/students"),
    enabled: role === "admin",
  });
  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => api.get<PersonRead[]>("/api/v1/teachers"),
    enabled: role === "admin",
  });
  const studentExamsQuery = useQuery({
    queryKey: ["student", "exams"],
    queryFn: () => api.get<StudentExamRead[]>("/api/v1/student/exams"),
    enabled: role === "student",
  });

  const loading =
    subjectsQuery.isLoading ||
    (role === "admin" && (studentsQuery.isLoading || teachersQuery.isLoading)) ||
    (role === "student" && studentExamsQuery.isLoading);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const subjects = subjectsQuery.data ?? [];
  const statsTotal = subjectsStatsQuery.data?.total;
  const students = studentsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const myExams = studentExamsQuery.data ?? [];
  const activeExams = myExams.filter((e) => e.status === "available").length;

  return (
    <>
      <PageHeader
        title={t("dashboard.welcome", { name: user?.full_name ?? "" })}
        subtitle={`${activeSchool?.name ?? ""} · ${t("dashboard.subtitle")}`}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.subjects")}
          value={typeof statsTotal === "number" ? statsTotal : subjects.length}
          icon={<BookOpen className="h-5 w-5" />}
        />
        {role === "admin" ? (
          <>
            <StatCard label={t("dashboard.students")} value={students.length} icon={<GraduationCap className="h-5 w-5" />} />
            <StatCard label={t("dashboard.teachers")} value={teachers.length} icon={<Library className="h-5 w-5" />} />
          </>
        ) : null}
        {role === "student" ? (
          <StatCard label={t("dashboard.exams")} value={activeExams} icon={<ClipboardList className="h-5 w-5" />} />
        ) : null}
        <StatCard label={t("dashboard.recentEvents")} value={events.length} icon={<Briefcase className="h-5 w-5" />} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{t("dashboard.recentEvents")}</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("jobs.noEvents")}</p>
          ) : (
            <ul className="space-y-2">
              {events.slice(0, 10).map((event) => (
                <li key={event.event_id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
                  <span className="truncate font-mono text-xs">{event.type}</span>
                  <Badge variant="outline">{String(event.event_id).slice(0, 8)}</Badge>
                </li>
              ))}
            </ul>
          )}
          {events.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {formatDateTime(new Date().toISOString())}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
