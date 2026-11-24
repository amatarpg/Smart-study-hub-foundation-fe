import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import type { MembershipRole } from "../lib/api/types";
import { useSchoolStore } from "../store/school";
import { Skeleton } from "../components/ui/skeleton";

export function RequireAuth(): JSX.Element {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  if (status === "unknown") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireSchool(): JSX.Element {
  const activeSchool = useSchoolStore((s) => s.activeSchool);
  const schools = useSchoolStore((s) => s.schools);
  if (!activeSchool) {
    if (schools.length > 1) return <Navigate to="/select-school" replace />;
    return <Navigate to="/select-school" replace />;
  }
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: MembershipRole[] }): JSX.Element {
  const activeSchool = useSchoolStore((s) => s.activeSchool);
  const location = useLocation();
  if (!activeSchool) return <Navigate to="/select-school" replace />;
  if (!roles.includes(activeSchool.role)) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function PublicOnly({ children }: { children: ReactNode }): JSX.Element {
  const status = useAuthStore((s) => s.status);
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <>{children}</>;
}
