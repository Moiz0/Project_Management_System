"use client";
import { useEffect, useState } from "react";
import { api } from "@/libs/api";
import { getToken } from "@/libs/auth";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import type {
  SystemAnalytics,
  UserPerformance,
  ModeratorPerformance,
} from "@/types";

export default function AnalyticsPage() {
  const [systemStats, setSystemStats] = useState<SystemAnalytics | null>(null);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [moderatorPerformance, setModeratorPerformance] = useState<
    ModeratorPerformance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const [system, users, moderators] = await Promise.all([
          api.analytics.getSystem(token),
          api.analytics.getUserPerformance(token),
          api.analytics.getModeratorPerformance(token),
        ]);

        if (!("error" in system)) setSystemStats(system);
        if (!("error" in users)) setUserPerformance(users);
        if (!("error" in moderators)) setModeratorPerformance(moderators);
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          Loading analytics...
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Navbar />
        <div className="flex justify-center items-center h-screen text-red-600">
          {error}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">System Analytics</h1>

        {systemStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-100 p-6 rounded shadow">
                <h3 className="text-lg font-semibold">Total Projects</h3>
                <p className="text-3xl font-bold">
                  {systemStats.totalProjects}
                </p>
              </div>
              <div className="bg-green-100 p-6 rounded shadow">
                <h3 className="text-lg font-semibold">Active Projects</h3>
                <p className="text-3xl font-bold">
                  {systemStats.activeProjects}
                </p>
              </div>
              <div className="bg-purple-100 p-6 rounded shadow">
                <h3 className="text-lg font-semibold">Total Tasks</h3>
                <p className="text-3xl font-bold">{systemStats.totalTasks}</p>
              </div>
              <div className="bg-yellow-100 p-6 rounded shadow">
                <h3 className="text-lg font-semibold">Completed Projects</h3>
                <p className="text-3xl font-bold">
                  {systemStats.completedProjects}
                </p>
              </div>
            </div>
            <div className="bg-white rounded shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Task Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">
                    {systemStats.taskDistribution.open}
                  </div>
                  <div className="text-sm text-gray-500">Open</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {systemStats.taskDistribution["in-progress"]}
                  </div>
                  <div className="text-sm text-gray-500">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {systemStats.taskDistribution.resolved}
                  </div>
                  <div className="text-sm text-gray-500">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {systemStats.taskDistribution.verified}
                  </div>
                  <div className="text-sm text-gray-500">Verified</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">User Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-right">Tasks Resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPerformance.map((user, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4 text-right font-bold">
                          {user.resolvedTasks}
                        </td>
                      </tr>
                    ))}

                    {userPerformance.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No user performance data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Moderator Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Moderator</th>
                  <th className="px-6 py-3 text-right">Projects</th>
                  <th className="px-6 py-3 text-right">Total Tasks</th>
                  <th className="px-6 py-3 text-right">Completed Tasks</th>
                  <th className="px-6 py-3 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {moderatorPerformance.map((mod, idx) => {
                  const rate = Number(mod.completionRate);

                  return (
                    <tr key={idx} className="border-t">
                      <td className="px-6 py-4">
                        <div className="font-medium">{mod.moderator.name}</div>
                        <div className="text-sm text-gray-500">
                          {mod.moderator.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {mod.totalProjects}
                      </td>
                      <td className="px-6 py-4 text-right">{mod.totalTasks}</td>
                      <td className="px-6 py-4 text-right">
                        {mod.completedTasks}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            rate >= 70
                              ? "bg-green-100 text-green-700"
                              : rate >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {moderatorPerformance.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No moderator performance data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
