export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "admin" | "moderator" | "user";
  createdAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  moderator: User | string;
  teamMembers: (User | string)[];
  status: "active" | "completed";
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: Project | string;
  assignedTo: User | string;
  status: "open" | "in-progress" | "resolved" | "verified";
  resolutionNote?: string;
  attachments?: string[];
  createdBy: User | string;
  createdAt: string;
  resolvedAt?: string;
  verifiedAt?: string;
}

export interface SystemAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  taskDistribution: {
    open: number;
    "in-progress": number;
    resolved: number;
    verified: number;
  };
}

export interface ProjectAnalytics {
  totalTasks: number;
  taskDistribution: {
    open: number;
    "in-progress": number;
    resolved: number;
    verified: number;
  };
  userPerformance: UserPerformance[];
}

export interface UserPerformance {
  _id: string;
  name: string;
  email: string;
  resolvedTasks: number;
}

export interface ModeratorPerformance {
  moderator: {
    id: string;
    name: string;
    email: string;
  };
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
}
