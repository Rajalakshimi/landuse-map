// frontend/src/api.ts
const API_BASE = '/api';

export async function fetchLanduse(params: Record<string, string | number>) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();

  const res = await fetch(`${API_BASE}/landuse?${qs}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
