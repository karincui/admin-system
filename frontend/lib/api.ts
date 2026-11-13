export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface BackendUser {
  id: number;
  username: string;
  nickname: string | null;
  role: "ADMIN" | "USER";
  enabled: boolean;
  createdAt?: string;
}

export interface LoginData {
  token: string;
  user: BackendUser;
}

const TOKEN_KEY = "karin_access_token";
const USER_KEY = "karin_user";

export function getApiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(
    /\/$/,
    ""
  );
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): BackendUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BackendUser;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: BackendUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  let json: ApiResponse<LoginData> | null = null;
  try {
    json = (await res.json()) as ApiResponse<LoginData>;
  } catch {
    throw new Error("后端无响应，请确认 Spring Boot 已在 8080 启动");
  }

  if (!res.ok || !json || json.code !== 0 || !json.data?.token) {
    throw new Error(json?.message || "用户名或密码错误");
  }

  saveSession(json.data.token, json.data.user);
  return json.data;
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("未登录");

  const res = await fetch(`${getApiBase()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    clearSession();
    throw new Error("登录已失效");
  }

  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || `请求失败(${res.status})`);
  }
  return json.data;
}
