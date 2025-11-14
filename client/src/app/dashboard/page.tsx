"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/libs/api";
import { getToken } from "@/libs/auth";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { SystemAnalytics, Project, Task } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemAnalytics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        if (!token || !user) return;

        if (user.role === "admin") {
          const data = await api.analytics.getSystem(token);
          if ("error" in data) {
            setError(data.error);
          } else {
            setStats(data);
          }
        } else {
          const [projectsData, tasksData] = await Promise.all([
            api.projects.getAll(token),
            api.tasks.getAll(token),
          ]);

          if (!("error" in projectsData)) {
            setProjects(projectsData);
          }
          if (!("error" in tasksData)) {
            setTasks(tasksData);
          }
        }
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="flex justify-center items-center h-screen text-red-600">
          {error}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {user?.role === "admin" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-6 rounded shadow">
              <h3 className="text-lg font-semibold">Total Projects</h3>
              <p className="text-3xl font-bold">{stats.totalProjects}</p>
            </div>
            <div className="bg-green-100 p-6 rounded shadow">
              <h3 className="text-lg font-semibold">Active Projects</h3>
              <p className="text-3xl font-bold">{stats.activeProjects}</p>
            </div>
            <div className="bg-purple-100 p-6 rounded shadow">
              <h3 className="text-lg font-semibold">Total Tasks</h3>
              <p className="text-3xl font-bold">{stats.totalTasks}</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded shadow">
              <h3 className="text-lg font-semibold">Completed Projects</h3>
              <p className="text-3xl font-bold">{stats.completedProjects}</p>
            </div>
          </div>
        )}

        {(user?.role === "moderator" || user?.role === "user") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-100 p-6 rounded shadow">
              <h3 className="text-lg font-semibold">My Projects</h3>
              <p className="text-3xl font-bold">{projects.length}</p>
            </div>
            <div className="bg-green-100 p-6 rounded shadow">
              <h3 className="text-lg font-semibold">My Tasks</h3>
              <p className="text-3xl font-bold">{tasks.length}</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            {(user?.role === "admin" || user?.role === "moderator") && (
              <>
                <a
                  href="/projects"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Manage Projects
                </a>
                <a
                  href="/tasks"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Manage Tasks
                </a>
              </>
            )}
            {user?.role === "user" && (
              <a
                href="/tasks"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View My Tasks
              </a>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
