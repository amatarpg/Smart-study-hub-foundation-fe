import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/app-shell";
import { PublicOnly, RequireAuth, RequireRole, RequireSchool } from "./guards";
import { LoginPage } from "../features/auth/login-page";
import { SchoolPickerPage } from "../features/schools/school-picker-page";
import { SchoolsAdminPage } from "../features/schools/schools-admin-page";
import { DashboardPage } from "../features/dashboard/dashboard-page";
import { DirectoryPage } from "../features/directory/directory-page";
import { AcademicsPage } from "../features/academics/academics-page";
import { ExamsPage } from "../features/exams/exams-page";
import { MyExamsPage } from "../features/exams/my-exams-page";
import { JobsPage } from "../features/jobs/jobs-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnly>
        <LoginPage />
      </PublicOnly>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      { path: "/select-school", element: <SchoolPickerPage /> },
      {
        element: <AppShell />,
        children: [
          {
            element: <RequireSchool />,
            children: [
              { path: "/", element: <DashboardPage /> },
              {
                element: <RequireRole roles={["admin"]} />,
                children: [
                  { path: "/directory", element: <DirectoryPage /> },
                  { path: "/academics", element: <AcademicsPage /> },
                ],
              },
              {
                element: <RequireRole roles={["admin", "teacher"]} />,
                children: [{ path: "/exams", element: <ExamsPage /> }],
              },
              {
                element: <RequireRole roles={["student"]} />,
                children: [{ path: "/my-exams", element: <MyExamsPage /> }],
              },
              { path: "/jobs", element: <JobsPage /> },
              { path: "/schools", element: <SchoolsAdminPage /> },
              { path: "*", element: <Navigate to="/" replace /> },
            ],
          },
        ],
      },
    ],
  },
]);
