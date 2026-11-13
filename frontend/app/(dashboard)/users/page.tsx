"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { BackendUser } from "@/lib/api";
import CreateUserForm from "./CreateUserForm";

export default function UsersPage() {
  const { user } = useAuth();
  const [createdUsers, setCreatedUsers] = useState<BackendUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");

  const rows = useMemo(() => {
    if (!user) return createdUsers;
    const map = new Map<number, BackendUser>();
    map.set(user.id, user);
    createdUsers.forEach((u) => map.set(u.id, u));
    return Array.from(map.values()).sort((a, b) => b.id - a.id);
  }, [user, createdUsers]);

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  function handleCreated(newUser: BackendUser) {
    setCreatedUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    setShowForm(false);
    setSuccess(`用户「${newUser.username}」创建成功`);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
          <p className="text-slate-500 text-sm mt-1">
            已对接 <code className="font-mono text-xs">POST /api/users</code>
            ；完整列表接口尚未提供，当前展示登录用户 + 本页新创建用户
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => {
              setSuccess("");
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            新增用户
          </button>
        ) : (
          <span className="text-xs text-slate-400">仅管理员可新增用户</span>
        )}
      </div>

      {success && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          {success}
        </div>
      )}

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
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  暂无用户数据
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {(row.nickname || row.username).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {row.nickname || row.username}
                          {row.id === user.id && (
                            <span className="ml-2 text-xs text-slate-400">(当前)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{row.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.role === "ADMIN" ? "管理员" : "普通用户"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.enabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.enabled ? "启用" : "禁用"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString("zh-CN")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CreateUserForm
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
