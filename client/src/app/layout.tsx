import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Project Management System",
  description: "Role-based project management with task tracking",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
