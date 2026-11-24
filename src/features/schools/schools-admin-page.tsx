import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "../../components/page-header";
import { DataTable, type Column } from "../../components/data-table";
import { ErrorBanner } from "../../components/error-banner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { t } from "../../i18n";
import { api } from "../../lib/api/client";
import type { SchoolRead, SchoolWithRole, SchoolLevel } from "../../lib/api/types";
import { useAuthStore } from "../../store/auth";

const schoolSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi").regex(/^[A-Z0-9_-]+$/, "Hanya huruf kapital, angka, - dan _"),
  name: z.string().min(1, "Nama wajib diisi"),
  level: z.enum(["SMP", "SMA", "SMK"]),
});

type SchoolForm = z.infer<typeof schoolSchema>;

export function SchoolsAdminPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const schoolsQuery = useQuery({
    queryKey: ["schools"],
    queryFn: () => api.get<SchoolWithRole[]>("/api/v1/schools"),
    enabled: user?.is_platform_admin === true,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchoolForm>({ resolver: zodResolver(schoolSchema), defaultValues: { level: "SMP" } });

  const createMutation = useMutation({
    mutationFn: (payload: SchoolForm) =>
      api.post<SchoolRead>("/api/v1/schools", payload as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast.success("Sekolah berhasil dibuat");
      setOpen(false);
      reset();
      void queryClient.invalidateQueries({ queryKey: ["schools"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal membuat sekolah"),
  });

  const columns: Column<SchoolWithRole>[] = [
    { key: "code", header: t("common.code"), render: (s) => <span className="font-mono text-xs">{s.code}</span> },
    { key: "name", header: t("common.name"), render: (s) => s.name },
    { key: "level", header: t("school.level"), render: (s) => <Badge variant="outline">{s.level}</Badge> },
    {
      key: "role",
      header: t("school.role"),
      render: (s) => <Badge variant="secondary">{t(`roles.${s.role}`)}</Badge>,
    },
    {
      key: "active",
      header: t("common.status"),
      render: (s) => (
        <Badge variant={s.is_active ? "success" : "warning"}>{s.is_active ? t("common.active") : t("common.inactive")}</Badge>
      ),
    },
  ];

  if (!user?.is_platform_admin) {
    return (
      <>
        <PageHeader title={t("nav.schools")} />
        <p className="text-sm text-muted-foreground">Halaman ini hanya untuk admin platform.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("nav.schools")}
        subtitle="Daftar sekolah yang Anda kelola sebagai admin platform."
        actions={
          <Button onClick={() => setOpen(true)}>{t("common.create")}</Button>
        }
      />
      {schoolsQuery.error ? <ErrorBanner error={schoolsQuery.error} onRetry={() => void schoolsQuery.refetch()} /> : null}
      <DataTable
        columns={columns}
        rows={schoolsQuery.data ?? []}
        loading={schoolsQuery.isLoading}
        getRowKey={(s) => s.id}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.create")} — {t("nav.schools")}</DialogTitle>
            <DialogDescription>Admin platform membuat sekolah baru; Anda otomatis menjadi admin sekolah tersebut.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((values) => createMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="code">{t("common.code")}</Label>
              <Input id="code" placeholder="SMPN1BDG" {...register("code")} />
              {errors.code ? <p className="text-xs text-destructive">{errors.code.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input id="name" placeholder="SMP Negeri 1 Bandung" {...register("name")} />
              {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="level">{t("school.level")}</Label>
              <select
                id="level"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("level")}
              >
                {(["SMP", "SMA", "SMK"] as SchoolLevel[]).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
