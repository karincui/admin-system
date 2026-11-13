"use client";

import { getApiBase } from "@/lib/api";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">系统设置</h1>
        <p className="text-slate-500 text-sm mt-1">
          原 Prisma 设置接口已移除，这里仅展示前端环境信息
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm max-w-2xl p-6 space-y-4 text-sm">
        <div>
          <p className="text-slate-500 mb-1">API 地址</p>
          <p className="font-mono text-slate-900">{getApiBase()}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-1">架构</p>
          <p className="text-slate-900">Next.js 纯前端 + Spring Boot 后端</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-slate-600">
          后续若需要「网站名称 / 邮箱」等配置，请在 backend 新增 settings 接口，再由本页调用。
        </div>
      </div>
    </div>
  );
}
