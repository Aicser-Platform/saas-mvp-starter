"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, ChevronDown, Send, Sparkles, Loader2, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIChatbotProps {
  courseId: string
  courseTitle: string
  lessonTitle?: string
  lessonContent?: string
  lessonTranscript?: string
  isOpen: boolean
  onToggle: () => void
}

export function AIChatbot({
  courseId,
  courseTitle,
  lessonTitle,
  lessonContent,
  lessonTranscript,
  isOpen,
  onToggle,
}: AIChatbotProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasLessonContext = !!(lessonTitle || lessonContent || lessonTranscript)
  const hasTranscript = !!lessonTranscript

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/assistant",
        body: { courseId, lessonTitle, lessonContent, lessonTranscript },
      }),
    // Re-create transport only when lesson changes (component re-mounts on navigation anyway)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courseId, lessonTitle],
  )

  const { messages, sendMessage, status, error } = useChat({ transport })

  const isLoading = status === "streaming" || status === "submitted"

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (el) el.scrollTop = el.scrollHeight
    }
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput("")
    sendMessage({ text })
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-16 bottom-0 z-40 flex flex-col bg-background border-l transition-all duration-300 ease-in-out shadow-lg",
        isOpen ? "w-full sm:w-[400px] translate-x-0" : "w-0 translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-primary" />
            <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            {lessonTitle && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lessonTitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context badges */}
      {hasLessonContext && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-b bg-muted/30 flex-wrap shrink-0">
          <Badge variant="secondary" className="text-xs gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Lesson context
          </Badge>
          {hasTranscript && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Bot className="h-2.5 w-2.5" />
              Transcript
            </Badge>
          )}
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 overflow-hidden">
        <div className="p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="relative mb-4">
                <Bot className="h-12 w-12 text-muted-foreground/50" />
                <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {hasLessonContext ? "Ask me anything about this lesson" : "Ask me anything about this course"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasTranscript
                  ? "I have the lesson notes and video transcript"
                  : hasLessonContext
                  ? "I have access to the lesson notes"
                  : "I can search the web for additional information"}
              </p>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user"
            const textContent = message.parts
              .filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join("")

            if (!textContent) return null

            return (
              <div key={message.id} className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    isUser ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {isUser ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm",
                  )}
                >
                  <p className="whitespace-pre-wrap">{textContent}</p>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-3">
                <div className="flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {error.message || "Something went wrong. Please try again."}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasLessonContext ? "Ask about this lesson..." : "Ask anything..."}
            disabled={isLoading}
            className="flex-1 placeholder:text-muted-foreground/40"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {hasLessonContext ? "Powered by Claude · Lesson context active" : "Powered by Claude"}
        </p>
      </div>
    </div>
  )
}
