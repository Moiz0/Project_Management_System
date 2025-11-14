import type {
  User,
  Project,
  Task,
  SystemAnalytics,
  ProjectAnalytics,
  UserPerformance,
  ModeratorPerformance,
  AuthResponse,
  ApiError,
} from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "An error occurred");
  }
  return data;
}

export const api = {
  auth: {
    login: async (
      email: string,
      password: string
    ): Promise<AuthResponse | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        return handleResponse<AuthResponse>(res);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
    register: async (data: {
      name: string;
      email: string;
      password: string;
      role?: string;
    }): Promise<AuthResponse | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return handleResponse<AuthResponse>(res);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Registration failed",
        };
      }
    },
    getMe: async (token: string): Promise<{ user: User } | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<{ user: User }>(res);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Failed to get user",
        };
      }
    },
  },
  users: {
    getAll: async (token: string): Promise<User[] | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<User[]>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to fetch users",
        };
      }
    },
    create: async (
      token: string,
      data: { name: string; email: string; password: string; role: string }
    ): Promise<User | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return handleResponse<User>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to create user",
        };
      }
    },
    update: async (
      token: string,
      id: string,
      data: { name: string; email: string; role: string }
    ): Promise<User | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/users/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return handleResponse<User>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to update user",
        };
      }
    },
    delete: async (
      token: string,
      id: string
    ): Promise<{ message: string } | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<{ message: string }>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to delete user",
        };
      }
    },
  },
  projects: {
    getAll: async (token: string): Promise<Project[] | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<Project[]>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to fetch projects",
        };
      }
    },
    getById: async (token: string, id: string): Promise<Project | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<Project>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to fetch project",
        };
      }
    },
    create: async (token: string, data: any): Promise<Project | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/projects`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return handleResponse<Project>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to create project",
        };
      }
    },
    update: async (
      token: string,
      id: string,
      data: any
    ): Promise<Project | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/projects/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return handleResponse<Project>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to update project",
        };
      }
    },
    delete: async (
      token: string,
      id: string
    ): Promise<{ message: string } | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/projects/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<{ message: string }>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to delete project",
        };
      }
    },
  },
  tasks: {
    getAll: async (token: string): Promise<Task[] | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<Task[]>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to fetch tasks",
        };
      }
    },
    getById: async (token: string, id: string): Promise<Task | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<Task>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to fetch task",
        };
      }
    },
    create: async (token: string, data: any): Promise<Task | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/tasks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return handleResponse<Task>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to create task",
        };
      }
    },
    update: async (
      token: string,
      id: string,
      data: any
    ): Promise<Task | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return handleResponse<Task>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to update task",
        };
      }
    },
    verify: async (
      token: string,
      id: string,
      approve: boolean
    ): Promise<Task | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/tasks/${id}/verify`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approve }),
        });
        return handleResponse<Task>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to verify task",
        };
      }
    },
    delete: async (
      token: string,
      id: string
    ): Promise<{ message: string } | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<{ message: string }>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to delete task",
        };
      }
    },
  },
  analytics: {
    getSystem: async (token: string): Promise<SystemAnalytics | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/analytics/system`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<SystemAnalytics>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch system analytics",
        };
      }
    },
    getProject: async (
      token: string,
      projectId: string
    ): Promise<ProjectAnalytics | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/analytics/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<ProjectAnalytics>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch project analytics",
        };
      }
    },
    getUserPerformance: async (
      token: string
    ): Promise<UserPerformance[] | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/analytics/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<UserPerformance[]>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch user performance",
        };
      }
    },
    getModeratorPerformance: async (
      token: string
    ): Promise<ModeratorPerformance[] | ApiError> => {
      try {
        const res = await fetch(`${API_URL}/analytics/moderators`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse<ModeratorPerformance[]>(res);
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch moderator performance",
        };
      }
    },
  },
};
