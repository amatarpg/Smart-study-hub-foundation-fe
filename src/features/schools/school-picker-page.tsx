import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, School } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { t } from "../../i18n";
import type { SchoolWithRole } from "../../lib/api/types";
import { useAuthStore } from "../../store/auth";
import { useSchoolStore } from "../../store/school";

export function SchoolPickerPage(): JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const schools = useSchoolStore((s) => s.schools);
  const loadSchools = useSchoolStore((s) => s.loadSchools);
  const selectSchool = useSchoolStore((s) => s.selectSchool);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadSchools().catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, [loadSchools]);

  const onPick = async (school: SchoolWithRole) => {
    setBusy(true);
    try {
      await selectSchool(school);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{t("school.selectTitle")}</CardTitle>
          <CardDescription>
            {t("school.selectSubtitle")} {user ? `(${user.full_name})` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          {schools.length === 0 && !error ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : null}
          {schools.map((school) => (
            <button
              key={school.id}
              type="button"
              disabled={busy}
              onClick={() => void onPick(school)}
              className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <School className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{school.name}</p>
                <p className="text-xs text-muted-foreground">
                  {school.code} · {school.level}
                </p>
              </div>
              <Badge variant="secondary">{t(`roles.${school.role}`)}</Badge>
            </button>
          ))}
          <Button variant="ghost" className="w-full" onClick={() => navigate("/", { replace: true })}>
            {t("common.cancel")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
