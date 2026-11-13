"use client";

import { FormEvent, useState } from "react";
import { BackendUser, createUser } from "@/lib/api";

interface Props {
  onCreated: (user: BackendUser) => void;
  onCancel: () => void;
}

export default function CreateUserForm({ onCreated, onCancel }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await createUser({
        username: username.trim(),
        password,
        nickname: nickname.trim() || undefined,
        role,
      });
      onCreated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">新增用户</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            关闭
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              用户名 <span className="text-red-500">*</span>
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={64}
              placeholder="至少 3 位"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              maxLength={64}
              placeholder="至少 4 位"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={64}
              placeholder="可选"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">角色</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="USER">普通用户</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
            >
              {submitting ? "提交中..." : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
