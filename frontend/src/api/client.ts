export class ApiError extends Error { constructor(message: string, public status: number) { super(message) } }
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { credentials: 'same-origin', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } })
  const raw = await response.text()
  let body: { message?: string } | null = null
  try { body = raw ? JSON.parse(raw) : null } catch { /* An empty or non-JSON error uses a generic message. */ }
  if (!response.ok) throw new ApiError(body?.message || 'No se pudo completar la solicitud.', response.status)
  return body as T
}
