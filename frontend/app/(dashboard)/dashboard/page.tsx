"use client";

import { useAuth } from "@/lib/auth-context";
import { getApiBase } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const cards = [
    {
      label: "当前用户",
      value: user.nickname || user.username,
      color: "bg-blue-500",
    },
    {
      label: "角色",
      value: user.role === "ADMIN" ? "管理员" : "普通用户",
      color: "bg-purple-500",
    },
    {
      label: "账号状态",
      value: user.enabled ? "启用" : "禁用",
      color: user.enabled ? "bg-emerald-500" : "bg-red-500",
    },
    {
      label: "后端地址",
      value: getApiBase().replace("http://", ""),
      color: "bg-slate-500",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <p className="text-slate-500 text-sm mt-1">
          纯前端已对接 Spring Boot 登录；用户管理等业务接口可继续在 backend 扩展
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`${card.color} w-10 h-10 rounded-lg mb-3`} />
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1 break-all">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-slate-900">当前登录信息</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">用户名</dt>
            <dd className="font-medium text-slate-900">{user.username}</dd>
          </div>
          <div>
            <dt className="text-slate-500">昵称</dt>
            <dd className="font-medium text-slate-900">{user.nickname || "-"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">用户 ID</dt>
            <dd className="font-medium text-slate-900">{user.id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">创建时间</dt>
            <dd className="font-medium text-slate-900">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString("zh-CN")
                : "-"}
            </dd>
          </div>
        </dl>
        <Link href="/users" className="inline-block text-sm text-blue-600 hover:text-blue-700">
          前往用户管理 →
        </Link>
      </div>
    </div>
  );
}
