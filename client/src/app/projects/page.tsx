"use client";
import { useEffect, useState } from "react";
import { api } from "@/libs/api";
import { getToken } from "@/libs/auth";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Project, User } from "@/types";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    moderator: "",
    teamMembers: [] as string[],
    status: "active" as "active" | "completed",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    const token = getToken();
    if (!token) return;

    const data = await api.projects.getAll(token);
    if (!("error" in data)) {
      setProjects(data);
    } else {
      setError(data.error);
    }
  };

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) return;

    const data = await api.users.getAll(token);
    if (!("error" in data)) {
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = getToken();
    if (!token) return;
    const payload = {
      ...formData,
      moderator:
        user?.role === "moderator" && !editProject
          ? user._id
          : formData.moderator,
    };

    try {
      if (editProject) {
        const result = await api.projects.update(
          token,
          editProject._id,
          formData
        );
        if ("error" in result) {
          setError(result.error);
          return;
        }
      } else {
        const result = await api.projects.create(token, payload);
        if ("error" in result) {
          setError(result.error);
          return;
        }
      }
      setShowModal(false);
      setEditProject(null);
      setFormData({
        name: "",
        description: "",
        moderator: "",
        teamMembers: [],
        status: "active",
      });
      fetchProjects();
    } catch (err) {
      setError("Failed to save project");
    }
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      moderator:
        typeof project.moderator === "string"
          ? project.moderator
          : project.moderator._id,
      teamMembers: project.teamMembers.map((m) =>
        typeof m === "string" ? m : m._id
      ),
      status: project.status,
    });
    if (user?.role === "admin" && users.length === 0) {
      fetchUsers();
    }
    setShowModal(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete all tasks in this project.")) {
      const token = getToken();
      if (!token) return;

      await api.projects.delete(token, id);
      fetchProjects();
    }
  };

  const getModeratorName = (moderator: User | string): string => {
    if (typeof moderator === "string") return "Unknown";
    return moderator.name;
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "moderator"]}>
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <button
            onClick={() => {
              setEditProject(null);
              setFormData({
                name: "",
                description: "",
                moderator: "",
                teamMembers: [],
                status: "active",
              });
              setShowModal(true);
              setError(null);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Project
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{project.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    project.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="text-sm text-gray-500 mb-2">
                <strong>Moderator:</strong>{" "}
                {getModeratorName(project.moderator)}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <strong>Team member:</strong>{" "}
                {project.teamMembers && project.teamMembers.length > 0
                  ? typeof project.teamMembers[0] === "string"
                    ? "Unknown"
                    : project.teamMembers[0].name
                  : "No members"}
              </div>
              {(user?.role === "admin" ||
                (user?.role === "moderator" &&
                  (project.moderator as User)?._id === user._id)) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-50">
            <div className="bg-white p-8 rounded shadow-lg w-96 my-8">
              <h2 className="text-2xl font-bold mb-4">
                {editProject ? "Edit Project" : "Create Project"}
              </h2>
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                {user?.role === "admin" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Moderator
                    </label>
                    <select
                      value={formData.moderator}
                      onChange={(e) =>
                        setFormData({ ...formData, moderator: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Select Moderator</option>
                      {users
                        .filter((u) => u.role === "moderator")
                        .map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Team Members
                  </label>
                  <select
                    multiple
                    value={formData.teamMembers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teamMembers: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        ),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    size={5}
                  >
                    {users
                      .filter((u) => u.role === "user")
                      .map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    {editProject ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setError(null);
                    }}
                    className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
