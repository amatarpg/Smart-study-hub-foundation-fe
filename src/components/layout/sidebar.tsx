import { BookOpen, GraduationCap, LayoutDashboard, Library, School, Briefcase, ClipboardList } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { t } from "../../i18n";
import type { MembershipRole } from "../../lib/api/types";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  roles: MembershipRole[];
  platformOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: t("nav.dashboard"), icon: <LayoutDashboard />, roles: ["admin", "teacher", "student"] },
  { to: "/directory", label: t("nav.directory"), icon: <Library />, roles: ["admin"] },
  { to: "/academics", label: t("nav.academics"), icon: <BookOpen />, roles: ["admin"] },
  { to: "/exams", label: t("nav.exams"), icon: <ClipboardList />, roles: ["admin", "teacher"] },
  { to: "/my-exams", label: t("nav.myExams"), icon: <GraduationCap />, roles: ["student"] },
  { to: "/jobs", label: t("nav.jobs"), icon: <Briefcase />, roles: ["admin", "teacher", "student"] },
  { to: "/schools", label: t("nav.schools"), icon: <School />, roles: ["admin", "teacher", "student"], platformOnly: true },
];

interface SidebarProps {
  role: MembershipRole | null;
  isPlatformAdmin: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ role, isPlatformAdmin, onNavigate }: SidebarProps): JSX.Element {
  const items = NAV_ITEMS.filter(
    (item) => (role && item.roles.includes(role)) && (!item.platformOnly || isPlatformAdmin),
  );
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{t("app.name")}</p>
          <p className="text-xs text-muted-foreground">{t("app.tagline")}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
