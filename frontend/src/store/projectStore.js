import { create } from 'zustand';

import axiosInstance from '../api/axios.js';

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || error.message || fallbackMessage;

const createOptimisticProject = (projectData) => ({
  ...projectData,
  id: `temp-${crypto.randomUUID()}`,
  isOptimistic: true,
});

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isFetching: false,
  isCreating: false,
  isJoining: false,
  error: null,

  clearProjectError: () => set({ error: null }),

  setCurrentProject: (project) => set({ currentProject: project }),

  fetchProjects: async () => {
    set({ isFetching: true, error: null });

    try {
      const { data } = await axiosInstance.get('/projects');
      const projects = data.projects || data;

      set({
        projects: Array.isArray(projects) ? projects : [],
        isFetching: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, 'Unable to fetch projects.'),
        isFetching: false,
      });
    }
  },

  createProject: async (projectData) => {
    const optimisticProject = createOptimisticProject(projectData);
    const previousProjects = get().projects;

    set({
      projects: [optimisticProject, ...previousProjects],
      currentProject: optimisticProject,
      isCreating: true,
      error: null,
    });

    try {
      const { data } = await axiosInstance.post('/projects', projectData);
      const createdProject = data.project || data;

      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === optimisticProject.id ? createdProject : project,
        ),
        currentProject: createdProject,
        isCreating: false,
      }));

      return createdProject;
    } catch (error) {
      const currentProject = get().currentProject;

      set({
        projects: previousProjects,
        currentProject:
          currentProject?.id === optimisticProject.id ? null : currentProject,
        error: getErrorMessage(error, 'Unable to create project.'),
        isCreating: false,
      });

      throw error;
    }
  },

  joinProject: async (projectIdOrCode) => {
    const previousProjects = get().projects;
    const optimisticProject = {
      id: `temp-join-${crypto.randomUUID()}`,
      name: 'Joining project...',
      inviteCode: projectIdOrCode,
      isOptimistic: true,
    };

    set({
      projects: [optimisticProject, ...previousProjects],
      currentProject: optimisticProject,
      isJoining: true,
      error: null,
    });

    try {
      const { data } = await axiosInstance.post('/projects/join', {
        code: projectIdOrCode,
      });
      const joinedProject = data.project || data;

      set((state) => {
        const projectsWithoutOptimistic = state.projects.filter(
          (project) => project.id !== optimisticProject.id,
        );
        const projectExists = projectsWithoutOptimistic.some(
          (project) => project.id === joinedProject.id,
        );

        return {
          projects: projectExists
            ? projectsWithoutOptimistic.map((project) =>
                project.id === joinedProject.id ? joinedProject : project,
              )
            : [joinedProject, ...projectsWithoutOptimistic],
          currentProject: joinedProject,
          isJoining: false,
        };
      });

      return joinedProject;
    } catch (error) {
      const currentProject = get().currentProject;

      set({
        projects: previousProjects,
        currentProject:
          currentProject?.id === optimisticProject.id ? null : currentProject,
        error: getErrorMessage(error, 'Unable to join project.'),
        isJoining: false,
      });

      throw error;
    }
  },
}));
