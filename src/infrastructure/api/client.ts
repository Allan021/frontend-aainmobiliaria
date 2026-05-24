/** Base URL compartida — única fuente de verdad en todo el proyecto */
export const API_BASE_URL =
  import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';

/* ─────────────────────────────────────────────────────────────
   ApiClient  —  uso en el BROWSER (hooks, adapters, React)
   Agrega Authorization header automáticamente desde localStorage.
───────────────────────────────────────────────────────────── */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('aa_token');
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: this.headers(options.headers as Record<string, string>),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Error de red' }));
      throw Object.assign(new Error(body.error || `HTTP ${res.status}`), { status: res.status });
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  get<T>(path: string) { return this.request<T>(path); }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload<T>(path: string, file: File, fieldName = 'image'): Promise<T> {
    const form = new FormData();
    form.append(fieldName, file);
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: form,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Error de red' }));
      throw Object.assign(new Error(body.error), { status: res.status });
    }
    return res.json();
  }
}

/** Instancia browser — usar en hooks y adapters */
export const api = new ApiClient(API_BASE_URL);

/* ─────────────────────────────────────────────────────────────
   serverFetch  —  uso en SSR / Astro frontmatter / getStaticPaths
   Sin localStorage, sin browser APIs. Lanza Error en !res.ok.
───────────────────────────────────────────────────────────── */
export async function serverFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Error de red' }));
    throw Object.assign(new Error(body.error || `HTTP ${res.status}`), { status: res.status });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
