export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UserRead {
  id: string;
  email: string;
  full_name: string;
  is_platform_admin: boolean;
  is_active: boolean;
}

export type SchoolLevel = "SMP" | "SMA" | "SMK";

export interface SchoolRead {
  id: string;
  code: string;
  name: string;
  level: SchoolLevel;
  is_active: boolean;
}

export type MembershipRole = "admin" | "teacher" | "student";

export interface SchoolWithRole extends SchoolRead {
  role: MembershipRole;
}

export interface SchoolCapabilities {
  expertise_programs: boolean;
  grade_levels: number[];
}

export interface CurrentSchool extends SchoolRead {
  role: MembershipRole;
  capabilities: SchoolCapabilities;
}

export interface SchoolCreate {
  code: string;
  name: string;
  level: SchoolLevel;
}

export interface JobRead {
  id: string;
  school_id: string;
  status: string;
  result: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export interface WsTicket {
  ticket: string;
  expires_in: number;
}

export interface SubjectRead {
  id: string;
  school_id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface SubjectStatistics {
  [key: string]: unknown;
}

export interface PersonRead {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface AcademicYearRead {
  id: string;
  school_id: string;
  label: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  [key: string]: unknown;
}

export interface AcademicPeriodRead {
  id: string;
  school_id: string;
  year_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  [key: string]: unknown;
}

export interface ClassRead {
  id: string;
  school_id: string;
  name: string;
  grade_level: number;
  program_id: string | null;
  [key: string]: unknown;
}

export interface ProgramRead {
  id: string;
  school_id: string;
  code: string;
  name: string;
  description: string | null;
  revision: number;
}

export interface ExamModuleRead {
  id: string;
  school_id: string;
  subject_id: string;
  title: string;
  status: string;
  [key: string]: unknown;
}

export interface QuestionRead {
  id: string;
  school_id: string;
  module_id: string | null;
  status: string;
  kind: string;
  [key: string]: unknown;
}

export interface ClassExamRead {
  id: string;
  school_id: string;
  module_version_id: string;
  class_offering_id: string;
  title: string;
  status: string;
  [key: string]: unknown;
}

export interface StudentExamRead {
  exam_id: string;
  title: string;
  subject: string;
  scheduled_start: string | null;
  deadline: string | null;
  status: string;
  attempt_id: string | null;
  [key: string]: unknown;
}

export interface WsEvent {
  event_id: string;
  type: string;
  [key: string]: unknown;
}
