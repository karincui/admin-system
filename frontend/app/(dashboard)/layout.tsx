"use client";

import AuthGuard from "@/components/AuthGuard";
import SidebarNav from "./SidebarNav";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <AuthGuard>
      {!user ? null : (
        <div className="flex h-screen bg-slate-100">
          <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-slate-700">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-white font-semibold">管理系统</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <SidebarNav />
            </nav>

            <div className="border-t border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {(user.nickname || user.username).charAt(0)}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {user.nickname || user.username}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出登录
              </button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-900">后台管理系统</span>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  欢迎，
                  <span className="font-medium text-slate-900">
                    {user.nickname || user.username}
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "ADMIN"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {user.role === "ADMIN" ? "管理员" : "普通用户"}
                </span>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
