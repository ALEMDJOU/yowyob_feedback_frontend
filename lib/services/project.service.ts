import { apiClient } from '../api-client';
import { supabase } from '@/lib/supabase';

export interface CreateProjectRequestDTO {
  project_name: string;
  description?: string;
  project_logo?: string;
}

export interface JoinProjectRequestDTO {
  projectName: string;
  creatorId: string;
  code: string;
  memberPseudo: string;
}

export interface ProjectResponseDTO {
  project_id: string;
  project_name: string;
  code: string;
  description?: string;
  project_logo?: string;
  creation_date_time: string;
  number_of_members: number;
  creator_id: string;
}

export interface MemberResponseDTO {
  member_id: string;
  member_pseudo: string;
  user_id: string;
  project_id: string;
  user_firstname?: string;
  user_lastname?: string;
  user_email?: string;
}

export interface ProjectDetailResponseDTO extends ProjectResponseDTO {
  creator_name?: string;
  members?: MemberResponseDTO[];
}

const CACHE_KEY = 'yy_projects_cache_v1';

function getCachedProjects(): ProjectResponseDTO[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ProjectResponseDTO[]) : [];
  } catch {
    return [];
  }
}

function setCachedProjects(projects: ProjectResponseDTO[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(projects));
}

function upsertCachedProject(project: ProjectResponseDTO) {
  const list = getCachedProjects();
  const idx = list.findIndex(p => p.project_id === project.project_id || p.project_name === project.project_name);
  if (idx >= 0) list[idx] = project; else list.unshift(project);
  setCachedProjects(list);
}

import { fileService } from './file.service';

export const projectService = {
  uploadLogo: async (file: File): Promise<string> => {
    return fileService.uploadFile(file, 'yowyob_feedback', 'projects');
  },

  createProject: async (payload: CreateProjectRequestDTO): Promise<ProjectResponseDTO> => {
    const created = await apiClient.post<ProjectResponseDTO>('/projects', payload);
    upsertCachedProject(created);
    return created;
  },

  getProjectDetailsByName: async (project_name: string): Promise<ProjectDetailResponseDTO> => {
    return apiClient.get<ProjectDetailResponseDTO>(`/projects/${encodeURIComponent(project_name)}`);
  },

  // Liste des projets de l'utilisateur (créés + rejoints)
  getUserProjects: async (): Promise<ProjectResponseDTO[]> => {
    try {
      // Corrected endpoint
      const list = await apiClient.get<ProjectResponseDTO[]>('/dashboard/projects');
      setCachedProjects(list);
      return list;
    } catch (err) {
      return getCachedProjects();
    }
  },

  // NOUVELLE MÉTHODE : Rejoindre un projet
  joinProject: async (payload: JoinProjectRequestDTO): Promise<MemberResponseDTO> => {
    const { projectName, creatorId, code, memberPseudo } = payload;
    const endpoint = `/projects/${encodeURIComponent(projectName)}/members/join?creatorId=${encodeURIComponent(creatorId)}&code=${encodeURIComponent(code)}&memberPseudo=${encodeURIComponent(memberPseudo)}`;
    return apiClient.post<MemberResponseDTO>(endpoint, {});
  },
};