const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("culinary_token");
}
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("culinary_user") || "null");
  } catch {
    return null;
  }
}
export function setSession(token, user) {
  localStorage.setItem("culinary_token", token);
  localStorage.setItem("culinary_user", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("culinary_token");
  localStorage.removeItem("culinary_user");
}
export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(isForm ? {} : body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}
export const authApi = {
  async login(identifier, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: { identifier, password },
    });
    setSession(data.token, data.user);
    return data;
  },
  register(payload) {
    return api("/auth/register", { method: "POST", body: payload });
  },
  me() {
    return api("/auth/me");
  },
  logout: clearSession,
};
