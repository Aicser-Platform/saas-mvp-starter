const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
const BACKEND_BASE = API_BASE.replace(/\/api\/v1\/?$/, "")

/**
 * Resolve a relative /uploads/ path or /api/v1/files/ proxy path to an
 * absolute URL pointing at the FastAPI backend.
 * External URLs (http/https) and empty values pass through unchanged.
 */
export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `${BACKEND_BASE}${url}`
}
