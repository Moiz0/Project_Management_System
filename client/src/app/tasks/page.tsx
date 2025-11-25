"use client";
import { useEffect, useState } from "react";
import { api } from "@/libs/api";
import { getToken } from "@/libs/auth";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Task, Project, User } from "@/types";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [resolveTask, setResolveTask] = useState<Task | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    status: "open" as Task["status"],
  });
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    const token = getToken();
    if (!token) return;

    const data = await api.tasks.getAll(token);
    if (!("error" in data)) {
      setTasks(data);
    } else {
      setError(data.error);
    }
  };

  const fetchProjects = async () => {
    const token = getToken();
    if (!token) return;

    const data = await api.projects.getAll(token);
    if (!("error" in data)) {
      setProjects(data);
    }
  };

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) return;

    const data = await api.users.getAll(token);
    if (!("error" in data)) {
      const assignableUsers = data.filter(
        (u) => u.role === "user" || u.role === "moderator"
      );
      if (user) {
        setUsers(assignableUsers.filter((u) => u._id !== user._id));
      } else {
        setUsers(assignableUsers);
      }
    } else {
      console.error("Failed to fetch users for assignment:", data.error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    if (user?.role === "admin" || user?.role === "moderator") {
      fetchUsers();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = getToken();
    if (!token) return;

    try {
      if (editTask) {
        const result = await api.tasks.update(token, editTask._id, formData);
        if ("error" in result) {
          setError(result.error);
          return;
        }
      } else {
        const result = await api.tasks.create(token, formData);
        if ("error" in result) {
          setError(result.error);
          return;
        }
      }
      setShowModal(false);
      setEditTask(null);
      setFormData({
        title: "",
        description: "",
        project: "",
        assignedTo: "",
        status: "open",
      });
      fetchTasks();
    } catch (err) {
      setError("Failed to save task");
    }
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      project:
        typeof task.project === "string" ? task.project : task.project._id,
      assignedTo:
        typeof task.assignedTo === "string"
          ? task.assignedTo
          : task.assignedTo._id,
      status: task.status,
    });
    if (
      (user?.role === "admin" || user?.role === "moderator") &&
      users.length === 0
    )
      fetchUsers();
    if (projects.length === 0) fetchProjects();
    setShowModal(true);
    setError(null);
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    const token = getToken();
    if (!token) return;

    await api.tasks.update(token, taskId, { status });
    fetchTasks();
  };

  const handleResolve = (task: Task) => {
    setResolveTask(task);
    setResolutionNote("");
    setShowResolveModal(true);
  };

  const submitResolution = async () => {
    if (!resolveTask) return;
    const token = getToken();
    if (!token) return;

    await api.tasks.update(token, resolveTask._id, {
      status: "resolved",
      resolutionNote,
    });
    setShowResolveModal(false);
    setResolveTask(null);
    setResolutionNote("");
    fetchTasks();
  };

  const handleVerify = async (taskId: string, approve: boolean) => {
    const token = getToken();
    if (!token) return;

    await api.tasks.verify(token, taskId, approve);
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      const token = getToken();
      if (!token) return;

      await api.tasks.delete(token, id);
      fetchTasks();
    }
  };

  const getStatusColor = (status: Task["status"]): string => {
    switch (status) {
      case "open":
        return "bg-gray-100 text-gray-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-yellow-100 text-yellow-700";
      case "verified":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getProjectName = (project: Project | string): string => {
    if (typeof project === "string") return "Unknown";
    return project.name;
  };

  const getUserName = (user: User | string): string => {
    if (typeof user === "string") return "Unknown";
    return user.name;
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tasks</h1>
          {(user?.role === "admin" || user?.role === "moderator") && (
            <button
              onClick={() => {
                setEditTask(null);
                setFormData({
                  title: "",
                  description: "",
                  project: "",
                  assignedTo: "",
                  status: "open",
                });
                setShowModal(true);
                setError(null);

                if (users.length === 0) fetchUsers();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Task
            </button>
          )}
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {tasks
            .filter(
              (task) =>
                user?.role !== "user" ||
                (task.assignedTo as User)?._id === user?._id
            )
            .map((task) => (
              <div key={task._id} className="bg-white rounded shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm whitespace-nowrap ml-4 ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <strong>Project:</strong> {getProjectName(task.project)}
                  </div>
                  <div>
                    <strong>Assigned To:</strong> {getUserName(task.assignedTo)}
                  </div>
                </div>
                {task.resolutionNote && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <strong className="text-sm">Resolution Note:</strong>
                    <p className="text-sm mt-1">{task.resolutionNote}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  {user?.role === "user" &&
                    (task.assignedTo as User)?._id === user._id &&
                    task.status === "open" && (
                      <button
                        onClick={() =>
                          handleStatusChange(task._id, "in-progress")
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Start Task (In Progress)
                      </button>
                    )}
                  {user?.role === "user" &&
                    (task.assignedTo as User)?._id === user._id &&
                    task.status === "in-progress" && (
                      <button
                        onClick={() => handleResolve(task)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Resolve Ticket
                      </button>
                    )}

                  {(user?.role === "admin" || user?.role === "moderator") &&
                    task.status === "resolved" && (
                      <>
                        <button
                          onClick={() => handleVerify(task._id, true)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Approve (Verify)
                        </button>
                        <button
                          onClick={() => handleVerify(task._id, false)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  {(user?.role === "admin" || user?.role === "moderator") && (
                    <>
                      <button
                        onClick={() => handleEdit(task)}
                        className="bg-blue-400 text-white px-3 py-1 rounded hover:bg-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded shadow-lg w-96">
              <h2 className="text-2xl font-bold mb-4">
                {editTask ? "Edit Task" : "Create Task"}
              </h2>
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
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
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Project
                  </label>
                  <select
                    value={formData.project}
                    onChange={(e) =>
                      setFormData({ ...formData, project: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Assign To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                {editTask && (
                  <div className="mb-4">
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
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">
                        Resolved (Needs Verification)
                      </option>
                      <option value="verified">Verified (Completed)</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    {editTask ? "Update" : "Create"}
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
        {showResolveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded shadow-lg w-96">
              <h2 className="text-2xl font-bold mb-4">Resolve Task</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Resolution Note
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={5}
                  placeholder="Explain what you did to resolve this task..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitResolution}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                  disabled={!resolutionNote.trim()}
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
