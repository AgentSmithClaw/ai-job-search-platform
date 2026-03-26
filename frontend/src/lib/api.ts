const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

function buildUrl(path: string, params?: Record<string, string | number | undefined | null>) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return API_BASE_URL ? `${url.pathname}${url.search}`.replace(/^/, API_BASE_URL) : `${url.pathname}${url.search}`;
}

export function getAccessToken() {
  const candidates = [
    localStorage.getItem('gappilot_access_token'),
    localStorage.getItem('access_token'),
    localStorage.getItem('token'),
  ];
  return candidates.find(Boolean) ?? '';
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined | null>) {
  const response = await fetch(buildUrl(path, params), {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
