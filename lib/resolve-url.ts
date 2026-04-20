/**
 * Convert Azure Blob Storage URLs to proxy URLs.
 * 
 * Raw Azure URLs (https://xxx.blob.core.windows.net/...) don't work
 * when public access is disabled. This converts them to our backend
 * proxy endpoint (/api/v1/files/...) which generates signed URLs.
 * 
 * URLs that are already proxy paths or non-Azure URLs pass through unchanged.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return ""

  // Already a proxy URL — return as-is
  if (url.startsWith("/api/v1/files/")) return `${API_BASE.replace("/api/v1", "")}${url}`

  // Raw Azure blob URL → convert to proxy
  // Pattern: https://<account>.blob.core.windows.net/<container>/<blob_name>
  const azureMatch = url.match(/https:\/\/[^/]+\.blob\.core\.windows\.net\/[^/]+\/(.+)/)
  if (azureMatch) {
    const blobName = azureMatch[1]
    return `${API_BASE}/files/${blobName}`
  }

  // YouTube, external URLs, local /uploads/ paths — return as-is
  return url
}
