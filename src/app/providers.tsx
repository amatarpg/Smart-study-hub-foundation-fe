import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "../lib/query";
import { router } from "./router";
import { useAuthStore } from "../store/auth";
import { useSchoolStore } from "../store/school";

function useBootstrap(): void {
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);
  useEffect(() => {
    setUnauthenticated();
  }, [setUnauthenticated]);
}

export function Providers(): JSX.Element {
  useBootstrap();
  const loadSchools = useSchoolStore((s) => s.loadSchools);
  const selectSchool = useSchoolStore((s) => s.selectSchool);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    void (async () => {
      try {
        const schools = await loadSchools();
        if (cancelled || schools.length === 0) return;
        const current = useSchoolStore.getState().activeSchool;
        if (!current) {
          await selectSchool(schools[0]);
        }
      } catch {
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, loadSchools, selectSchool]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" closeButton />
    </QueryClientProvider>
  );
}
