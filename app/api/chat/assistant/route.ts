import { streamText, convertToModelMessages, type UIMessage, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

export const maxDuration = 60

const searchDocumentsTool = tool({
  description: "Search the web for additional information about the topic",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const response = await fetch(`${baseUrl}/api/google-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, source: "google-search" }),
      })
      if (!response.ok) throw new Error("Search failed")
      return await response.json()
    } catch (error) {
      return { results: [], count: 0, error: "Web search unavailable" }
    }
  },
})

export async function POST(req: Request) {
  const {
    messages,
    courseId,
    lessonTitle,
    lessonContent,
    lessonTranscript,
  }: {
    messages: UIMessage[]
    courseId?: string
    lessonTitle?: string
    lessonContent?: string
    lessonTranscript?: string
  } = await req.json()

  const lessonContext = [
    lessonTitle ? `Current lesson: "${lessonTitle}"` : "",
    lessonContent ? `\nLesson notes:\n${lessonContent}` : "",
    lessonTranscript ? `\nVideo transcript:\n${lessonTranscript}` : "",
  ]
    .filter(Boolean)
    .join("")

  const systemPrompt = `You are an AI Assistant for Aicser AI Studio, a professional learning platform for AI/ML education.
Your role is to help students understand course content and answer their questions.

${lessonContext
  ? `${lessonContext}

Answer questions about this lesson using the notes and transcript above as your primary source.
If the answer is not covered in the lesson content, say so clearly and offer to search the web for more information.`
  : "Answer questions about the course content. If you need more specific information, you can search the web."}

Be concise, friendly, and educational. Use examples where helpful.`

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: { searchDocuments: searchDocumentsTool },
    maxOutputTokens: 2000,
    temperature: 0.5,
  })

  return result.toUIMessageStreamResponse()
}
