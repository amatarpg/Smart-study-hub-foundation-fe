import { create } from "zustand";
import { api } from "../lib/api/client";
import type { CurrentSchool, SchoolWithRole } from "../lib/api/types";

interface SchoolState {
  schools: SchoolWithRole[];
  activeSchool: CurrentSchool | null;
  loading: boolean;
  loadSchools: () => Promise<SchoolWithRole[]>;
  selectSchool: (school: SchoolWithRole) => Promise<CurrentSchool>;
  clearSchool: () => void;
}

export const useSchoolStore = create<SchoolState>((set) => ({
  schools: [],
  activeSchool: null,
  loading: false,

  loadSchools: async () => {
    set({ loading: true });
    try {
      const schools = await api.get<SchoolWithRole[]>("/api/v1/schools");
      set({ schools, loading: false });
      return schools;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  selectSchool: async (school) => {
    const current = await api.get<CurrentSchool>("/api/v1/schools/current", {
      schoolId: school.id,
    });
    api.setSchoolId(current.id);
    set({ activeSchool: current });
    return current;
  },

  clearSchool: () => {
    api.setSchoolId(null);
    set({ activeSchool: null });
  },
}));

export function hasRole(roles: string[]): boolean {
  const active = useSchoolStore.getState().activeSchool;
  return !!active && roles.includes(active.role);
}

export function useActiveSchool(): CurrentSchool | null {
  return useSchoolStore((s) => s.activeSchool);
}
