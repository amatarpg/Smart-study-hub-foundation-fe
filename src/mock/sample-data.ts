import type {
  AcademicPeriodRead,
  AcademicYearRead,
  ClassExamRead,
  ClassRead,
  CurrentSchool,
  ExamModuleRead,
  JobRead,
  PersonRead,
  ProgramRead,
  QuestionRead,
  SchoolWithRole,
  StudentExamRead,
  SubjectRead,
  UserRead,
} from "../lib/api/types";

export const mockUser: UserRead = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@sekolah.sch.id",
  full_name: "Admin Demo",
  is_platform_admin: true,
  is_active: true,
};

export const mockSchools: SchoolWithRole[] = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    code: "SMPN1BDG",
    name: "SMP Negeri 1 Bandung",
    level: "SMP",
    is_active: true,
    role: "admin",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    code: "SMKN2JKT",
    name: "SMK Negeri 2 Jakarta",
    level: "SMK",
    is_active: true,
    role: "teacher",
  },
];

export const mockCurrentSchool: CurrentSchool = {
  ...mockSchools[0],
  capabilities: { expertise_programs: false, grade_levels: [7, 8, 9] },
};

export const mockSubjects: SubjectRead[] = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    school_id: mockSchools[0].id,
    code: "MTK",
    name: "Matematika",
    description: "Matematika wajib",
    created_at: "2026-01-05T08:00:00Z",
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    school_id: mockSchools[0].id,
    code: "BIN",
    name: "Bahasa Indonesia",
    description: "Bahasa Indonesia wajib",
    created_at: "2026-01-05T08:00:00Z",
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    school_id: mockSchools[0].id,
    code: "IPA",
    name: "Ilmu Pengetahuan Alam",
    description: null,
    created_at: "2026-01-06T08:00:00Z",
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    school_id: mockSchools[0].id,
    code: "BIG",
    name: "Bahasa Inggris",
    description: null,
    created_at: "2026-01-06T08:00:00Z",
  },
];

export const mockStudents: PersonRead[] = [
  { id: "s1", user_id: "u-s1", full_name: "Aisyah Putri Ramadhani", is_active: true, nisn: "0098765432", class_name: "8A" },
  { id: "s2", user_id: "u-s2", full_name: "Bima Arya Saputra", is_active: true, nisn: "0098765433", class_name: "8A" },
  { id: "s3", user_id: "u-s3", full_name: "Citra Lestari", is_active: true, nisn: "0098765434", class_name: "9B" },
  { id: "s4", user_id: "u-s4", full_name: "Dimas Prasetyo", is_active: false, nisn: "0098765435", class_name: "9B" },
  { id: "s5", user_id: "u-s5", full_name: "Eka Wijaya", is_active: true, nisn: "0098765436", class_name: "7C" },
];

export const mockTeachers: PersonRead[] = [
  { id: "t1", user_id: "u-t1", full_name: "Dr. Hendra Wijaya, M.Pd", is_active: true, nip: "197605122005011001" },
  { id: "t2", user_id: "u-t2", full_name: "Siti Nurhaliza, S.Pd", is_active: true, nip: "198203152010012002" },
  { id: "t3", user_id: "u-t3", full_name: "Rudi Hartono, S.Kom", is_active: true, nip: "198811302012011003" },
];

export const mockSchoolAdmins: PersonRead[] = [
  { id: mockUser.id, user_id: mockUser.id, full_name: mockUser.full_name, email: mockUser.email, is_active: true },
];

export const mockAcademicYears: AcademicYearRead[] = [
  {
    id: "y1",
    school_id: mockSchools[0].id,
    label: "2025/2026",
    start_date: "2025-07-14",
    end_date: "2026-06-30",
    is_active: true,
  },
  {
    id: "y0",
    school_id: mockSchools[0].id,
    label: "2024/2025",
    start_date: "2024-07-15",
    end_date: "2025-06-30",
    is_active: false,
  },
];

export const mockAcademicPeriods: AcademicPeriodRead[] = [
  {
    id: "p1",
    school_id: mockSchools[0].id,
    year_id: "y1",
    name: "Semester Ganjil",
    start_date: "2025-07-14",
    end_date: "2025-12-20",
    is_active: true,
  },
  {
    id: "p2",
    school_id: mockSchools[0].id,
    year_id: "y1",
    name: "Semester Genap",
    start_date: "2026-01-05",
    end_date: "2026-06-30",
    is_active: false,
  },
];

export const mockClasses: ClassRead[] = [
  { id: "c1", school_id: mockSchools[0].id, name: "7A", grade_level: 7, program_id: null },
  { id: "c2", school_id: mockSchools[0].id, name: "8A", grade_level: 8, program_id: null },
  { id: "c3", school_id: mockSchools[0].id, name: "9B", grade_level: 9, program_id: null },
];

export const mockPrograms: ProgramRead[] = [
  {
    id: "pr1",
    school_id: mockSchools[1].id,
    code: "TKJ",
    name: "Teknik Komputer dan Jaringan",
    description: "Program keahlian SMK",
    revision: 1,
  },
  {
    id: "pr2",
    school_id: mockSchools[1].id,
    code: "AKL",
    name: "Akuntansi dan Keuangan Lembaga",
    description: null,
    revision: 2,
  },
];

export const mockExamModules: ExamModuleRead[] = [
  { id: "m1", school_id: mockSchools[0].id, subject_id: mockSubjects[0].id, title: "PAS Matematika Kelas 8", status: "published" },
  { id: "m2", school_id: mockSchools[0].id, subject_id: mockSubjects[1].id, title: "UAS Bahasa Indonesia", status: "draft" },
  { id: "m3", school_id: mockSchools[0].id, subject_id: mockSubjects[2].id, title: "UTS IPA Semester Genap", status: "in_review" },
];

export const mockQuestions: QuestionRead[] = [
  { id: "q1", school_id: mockSchools[0].id, module_id: "m2", status: "pending_review", kind: "multiple_choice" },
  { id: "q2", school_id: mockSchools[0].id, module_id: "m2", status: "approved", kind: "essay" },
  { id: "q3", school_id: mockSchools[0].id, module_id: null, status: "submitted", kind: "multiple_choice" },
];

export const mockClassExams: ClassExamRead[] = [
  { id: "e1", school_id: mockSchools[0].id, module_version_id: "mv1", class_offering_id: "c2", title: "PAS Matematika 8A", status: "published" },
  { id: "e2", school_id: mockSchools[0].id, module_version_id: "mv2", class_offering_id: "c3", title: "UAS B.Indo 9B", status: "scheduled" },
];

export const mockStudentExams: StudentExamRead[] = [
  {
    exam_id: "e1",
    title: "PAS Matematika 8A",
    subject: "Matematika",
    scheduled_start: "2026-12-01T07:30:00Z",
    deadline: "2026-12-01T09:30:00Z",
    status: "available",
    attempt_id: null,
  },
  {
    exam_id: "e2",
    title: "UAS Bahasa Indonesia 9B",
    subject: "Bahasa Indonesia",
    scheduled_start: "2026-12-05T07:30:00Z",
    deadline: "2026-12-05T09:00:00Z",
    status: "scheduled",
    attempt_id: null,
  },
];

export function mockJob(id: string, status = "pending"): JobRead {
  return {
    id,
    school_id: mockSchools[0].id,
    status,
    result: status === "completed" ? { subject_count: mockSubjects.length, generated_at: new Date().toISOString() } : null,
    created_at: new Date().toISOString(),
    completed_at: status === "completed" ? new Date().toISOString() : null,
  };
}
