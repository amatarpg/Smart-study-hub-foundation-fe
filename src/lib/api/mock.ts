import { ApiError } from "./errors";
import type { JobRead, WsTicket } from "./types";
import {
  mockAcademicPeriods,
  mockAcademicYears,
  mockClassExams,
  mockClasses,
  mockCurrentSchool,
  mockExamModules,
  mockJob,
  mockPrograms,
  mockQuestions,
  mockSchoolAdmins,
  mockSchools,
  mockStudents,
  mockStudentExams,
  mockSubjects,
  mockTeachers,
  mockUser,
} from "../../mock/sample-data";

export function mockEnabled(): boolean {
  return import.meta.env.VITE_APP_MOCK === "1";
}

const mockTokens = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token-0123456789abcdef",
  token_type: "bearer",
  expires_in: 900,
};

export function mockDispatch(method: string, path: string, body?: unknown): unknown {
  const p = path.replace(/^\/api\/v1/, "");
  if (p === "/auth/login") {
    const payload = body as { email?: string; password?: string } | undefined;
    if (!payload?.email || !payload.password) {
      throw new ApiError(422, "Validasi gagal", [{ field: "email", message: "Email dan kata sandi wajib diisi" }]);
    }
    if (payload.password === "salah") {
      throw new ApiError(401, "Email atau kata sandi salah");
    }
    return { ...mockTokens };
  }
  if (p === "/auth/refresh") return { ...mockTokens };
  if (p === "/auth/logout") return null;
  if (p === "/auth/ws-ticket") {
    const ticket: WsTicket = { ticket: "mock-ticket", expires_in: 30 };
    return ticket;
  }
  if (p === "/users/me") return mockUser;
  if (p === "/schools") return mockSchools;
  if (p === "/schools/current") return mockCurrentSchool;
  if (p === "/subjects") return mockSubjects;
  if (p === "/subjects/statistics") {
    return { total: mockSubjects.length, by_code: mockSubjects.map((s) => s.code), cached: true };
  }
  if (p === "/students") return mockStudents;
  if (p === "/teachers") return mockTeachers;
  if (p === "/school-admins") return mockSchoolAdmins;
  if (p === "/academic-years") return mockAcademicYears;
  if (p === "/academic-periods") return mockAcademicPeriods;
  if (p === "/classes") return mockClasses;
  if (p === "/expertise-programs") return mockPrograms;
  if (p === "/exam-modules") return mockExamModules;
  if (p === "/questions") return mockQuestions;
  if (p === "/class-exams") return mockClassExams;
  if (p === "/student/exams") return mockStudentExams;
  if (p === "/jobs/subject-report" && method === "POST") {
    return mockJob(crypto.randomUUID(), "pending");
  }
  const jobMatch = p.match(/^\/jobs\/(.+)$/);
  if (jobMatch && method === "GET") {
    const job: JobRead = mockJob(jobMatch[1], "completed");
    return job;
  }
  throw new ApiError(404, `Mock tidak tersedia untuk ${method} ${p}`);
}
