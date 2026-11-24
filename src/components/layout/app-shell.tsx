import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { queryClient } from "../../lib/query";
import { useAuthStore } from "../../store/auth";
import { useRealtimeStore } from "../../store/realtime";
import { useSchoolStore } from "../../store/school";
import { cn } from "../../lib/utils";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const activeSchool = useSchoolStore((s) => s.activeSchool);
  const startRealtime = useRealtimeStore((s) => s.start);
  const stopRealtime = useRealtimeStore((s) => s.stop);

  useEffect(() => {
    if (activeSchool) {
      startRealtime(
        (event) => {
          if (event.type === "job.completed") {
            void queryClient.invalidateQueries({ queryKey: ["jobs"] });
          }
        },
        () => {
          void queryClient.invalidateQueries();
        },
      );
      return () => stopRealtime();
    }
    return undefined;
  }, [activeSchool, startRealtime, stopRealtime]);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-background lg:block">
        <Sidebar role={activeSchool?.role ?? null} isPlatformAdmin={user?.is_platform_admin ?? false} />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-background shadow-xl">
            <Sidebar
              role={activeSchool?.role ?? null}
              isPlatformAdmin={user?.is_platform_admin ?? false}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Topbar onMenuClick={() => setMenuOpen(true)} />
        <main className={cn("mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-6")}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
