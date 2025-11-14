"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/dashboard"
          className="text-xl font-bold hover:text-blue-200 transition"
        >
          Project Manager
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="hover:text-blue-200 transition">
            Dashboard
          </Link>

          {user.role === "admin" && (
            <>
              <Link href="/users" className="hover:text-blue-200 transition">
                Users
              </Link>
              <Link
                href="/analytics"
                className="hover:text-blue-200 transition"
              >
                Analytics
              </Link>
            </>
          )}

          {(user.role === "admin" || user.role === "moderator") && (
            <Link href="/projects" className="hover:text-blue-200 transition">
              Projects
            </Link>
          )}

          <Link href="/tasks" className="hover:text-blue-200 transition">
            Tasks
          </Link>

          <div className="border-l border-blue-400 pl-4 ml-2">
            <span className="text-sm">
              {user.name}
              <span className="ml-2 px-2 py-1 bg-blue-700 rounded text-xs">
                {user.role}
              </span>
            </span>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
