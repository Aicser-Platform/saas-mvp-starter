import { streamText, convertToModelMessages, type UIMessage, tool } from "ai"
import { z } from "zod"

export const maxDuration = 30

// Tool for searching documents
const searchDocumentsTool = tool({
  description: "Search for relevant documents, resources, or information related to the course content",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    source: z.enum(["course", "google-drive", "google-search"]).describe("Where to search"),
  }),
  execute: async ({ query, source }) => {
    console.log(`[AI Assistant] Searching ${source} for: ${query}`)

    // Handle Google Custom Search API by calling the google-search endpoint
    if (source === "google-search") {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const response = await fetch(`${baseUrl}/api/google-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, source: "google-search" }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Search request failed")
        }

        return await response.json()
      } catch (error) {
        console.error("Google Search error:", error)
        return {
          results: [
            {
              title: "Search Error",
              snippet: error instanceof Error ? error.message : "Failed to perform Google search. Please check API configuration.",
              source: "google-search",
              url: "#",
            },
          ],
          count: 0,
        }
      }
    }

    // Mock implementations for other sources (to be implemented later)
    if (source === "course") {
      // TODO: Implement course database search
      const mockResults = [
        {
          title: `${query} - Course Material`,
          snippet: `Relevant information about ${query} from the course content...`,
          source: source,
          url: "#",
        },
        {
          title: `Understanding ${query}`,
          snippet: `Additional context and examples for ${query}...`,
          source: source,
          url: "#",
        },
      ]

      return {
        results: mockResults,
        count: mockResults.length,
      }
    }

    if (source === "google-drive") {
      // TODO: Implement Google Drive API search
      const mockResults = [
        {
          title: `${query} - Google Drive Document`,
          snippet: `Document about ${query} from Google Drive...`,
          source: source,
          url: "#",
        },
      ]

      return {
        results: mockResults,
        count: mockResults.length,
      }
    }

    return {
      results: [],
      count: 0,
    }
  },
})

const getCourseInfoTool = tool({
  description: "Get information about the current course, lessons, or resources",
  inputSchema: z.object({
    infoType: z.enum(["progress", "resources", "lessons", "difficulty"]),
  }),
  execute: async ({ infoType }) => {
    // Simulated course info - can be enhanced with actual database queries
    const info = {
      progress: "You are currently at 50% completion of this course.",
      resources: "This course includes PDFs, video tutorials, and practice exercises.",
      lessons: "The course covers 10 main lessons with hands-on projects.",
      difficulty: "This is an intermediate level course.",
    }

    return info[infoType]
  },
})

export async function POST(req: Request) {
  const { messages, courseId }: { messages: UIMessage[]; courseId?: string } = await req.json()

  const systemPrompt = `You are an AI Assistant for Aicser AI Studio, a professional learning platform. 
Your role is to help students by:
- Answering questions about the course content
- Searching for relevant documents and resources
- Providing explanations and clarifications
- Helping students understand difficult concepts

Be friendly, professional, and concise. Always cite sources when providing information from documents.
${courseId ? `Current course ID: ${courseId}` : ""}`

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      searchDocuments: searchDocumentsTool,
      getCourseInfo: getCourseInfoTool,
    },
    maxOutputTokens: 2000,
    temperature: 0.7,
  })

  return result.toUIMessageStreamResponse()
}
