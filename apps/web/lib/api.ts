const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dna_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error en la petición' }));
    const message = errorData.message || `Error ${response.status}`;
    // Attach HTTP status so callers can distinguish 404 (resource not yet
    // created) from genuine failures without parsing the message string.
    const err = new Error(message) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  return response.json();
}
