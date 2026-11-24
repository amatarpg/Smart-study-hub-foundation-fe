import { Bell, ChevronDown, LogOut, Menu, School } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { t } from "../../i18n";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuthStore } from "../../store/auth";
import { useSchoolStore } from "../../store/school";
import { useRealtimeStore } from "../../store/realtime";
import type { SchoolWithRole } from "../../lib/api/types";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps): JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const schools = useSchoolStore((s) => s.schools);
  const activeSchool = useSchoolStore((s) => s.activeSchool);
  const selectSchool = useSchoolStore((s) => s.selectSchool);
  const wsStatus = useRealtimeStore((s) => s.status);
  const events = useRealtimeStore((s) => s.events);

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const onSelectSchool = async (school: SchoolWithRole) => {
    await selectSchool(school);
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Buka menu">
        <Menu className="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <School className="h-4 w-4" />
            <span className="max-w-40 truncate sm:max-w-56">{activeSchool ? activeSchool.name : t("school.selectTitle")}</span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>{t("school.current")}</DropdownMenuLabel>
          {schools.map((school) => (
            <DropdownMenuItem key={school.id} onClick={() => void onSelectSchool(school)}>
              <span className="flex-1 truncate">{school.name}</span>
              <Badge variant="secondary">{t(`roles.${school.role}`)}</Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={t("nav.jobs")}>
              <Bell className="h-5 w-5" />
              {events.length > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {events.length}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>{t("dashboard.recentEvents")}</span>
              <Badge variant={wsStatus === "connected" ? "success" : "secondary"}>{t(`ws.${wsStatus}`)}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {events.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">{t("jobs.noEvents")}</div>
            ) : (
              events.slice(0, 8).map((event) => (
                <DropdownMenuItem key={event.event_id} onClick={() => navigate("/jobs")}>
                  <span className="truncate text-xs">{event.type}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <span className="hidden max-w-40 truncate sm:block">{user?.full_name ?? ""}</span>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="truncate">{user?.full_name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
                {activeSchool ? (
                  <Badge variant="secondary" className="mt-1 w-fit">
                    {t(`roles.${activeSchool.role}`)}
                  </Badge>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void onLogout()}>
              <LogOut className="h-4 w-4" />
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
