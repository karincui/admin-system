"use client";

import { useAuth } from "@/lib/auth-context";

export default function UsersPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
        <p className="text-slate-500 text-sm mt-1">
          前端已去掉 Prisma。完整用户 CRUD 需在 Spring Boot 实现后再对接
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm mb-4">
        当前后端仅提供 <code className="font-mono">GET /api/users/me</code>。
        下方展示当前登录用户；列表/新增/编辑接口就绪后即可替换此页。
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">用户</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {(user.nickname || user.username).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {user.nickname || user.username}
                    </p>
                    <p className="text-xs text-slate-500">{user.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {user.role === "ADMIN" ? "管理员" : "普通用户"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.enabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.enabled ? "启用" : "禁用"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("zh-CN")
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
