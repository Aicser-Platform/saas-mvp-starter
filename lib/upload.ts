/**
 * Client-side file upload utility.
 * Uploads directly to the FastAPI backend, which saves files to the local uploads/ directory.
 * This CANNOT be a server action because File objects can't cross the server boundary.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export async function uploadFileToStorage(
  file: File,
  token: string,
): Promise<{ url: string; filename: string; content_type: string }> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_BASE}/lessons/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Upload failed")
  }

  const data = await res.json()

  // Backend returns relative paths (/uploads/... or /api/v1/files/...).
  // Resolve to absolute so <video> and <img> src work from any page.
  if (data.url?.startsWith("/")) {
    const backendBase = API_BASE.replace(/\/api\/v1\/?$/, "")
    data.url = `${backendBase}${data.url}`
  }

  return data
}
