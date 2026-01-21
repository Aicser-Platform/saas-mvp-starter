import { NextResponse } from "next/server"

type SearchSource = "google-search"

function getGoogleEnv() {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    throw new Error("Missing GOOGLE_CUSTOM_SEARCH_API_KEY or GOOGLE_CUSTOM_SEARCH_ENGINE_ID")
  }

  return { apiKey, searchEngineId }
}

async function searchGoogle(query: string) {
  const { apiKey, searchEngineId } = getGoogleEnv()
  const url = new URL("https://www.googleapis.com/customsearch/v1")
  url.searchParams.set("key", apiKey)
  url.searchParams.set("cx", searchEngineId)
  url.searchParams.set("q", query)
  url.searchParams.set("num", "10")

  console.log("[Google Search] Searching for:", query)
  console.log("[Google Search] URL:", url.toString().replace(apiKey, "***"))

  const response = await fetch(url.toString())

  console.log("[Google Search] Response status:", response.status)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("[Google Search] Error data:", errorData)
    throw new Error(
      `Google Custom Search API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`,
    )
  }

  const data = await response.json()
  console.log("[Google Search] Found items:", data.items?.length || 0)

  const results =
    data.items?.map((item: any) => ({
      title: item.title || "No title",
      snippet: item.snippet || "No description available",
      url: item.link || "#",
      source: "google-search" as const,
    })) ?? []

  return {
    results,
    count: results.length,
  }
}

function intentRouter(source?: SearchSource): SearchSource {
  // Single-source router for now; extend here for more tools/sources.
  if (source === "google-search" || !source) return "google-search"
  throw new Error(`Unsupported search source: ${source}`)
}

export async function POST(req: Request) {
  try {
    const { query, source }: { query?: string; source?: SearchSource } = await req.json()

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 })
    }

    const routedSource = intentRouter(source)

    switch (routedSource) {
      case "google-search": {
        const result = await searchGoogle(query.trim())
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ error: "Unsupported source" }, { status: 400 })
    }
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 },
    )
  }
}
