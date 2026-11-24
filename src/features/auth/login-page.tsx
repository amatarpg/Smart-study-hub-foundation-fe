import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { t } from "../../i18n";
import { ApiError } from "../../lib/api/errors";
import { mockEnabled } from "../../lib/api/mock";
import { useAuthStore } from "../../store/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const storeError = useAuthStore((s) => s.error);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== "/login" ? from : "/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.length > 0) {
        for (const fieldError of err.fieldErrors) {
          if (fieldError.field === "email" || fieldError.field === "password") {
            setError(fieldError.field, { message: fieldError.message });
          }
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                {...register("email")}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={t("auth.passwordPlaceholder")}
                {...register("password")}
              />
              {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
            </div>
            {storeError ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{storeError}</p> : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.submitting") : t("auth.submit")}
            </Button>
            {mockEnabled() ? (
              <p className="text-center text-xs text-muted-foreground">{t("auth.demoHint")}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
