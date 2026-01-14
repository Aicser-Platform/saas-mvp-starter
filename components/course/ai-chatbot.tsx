"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, ChevronDown, Send, Sparkles, User, Loader2, FileText, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIChatbotProps {
  courseId: string
  courseTitle: string
  isOpen: boolean
  onToggle: () => void
}

export function AIChatbot({ courseId, courseTitle, isOpen, onToggle }: AIChatbotProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat/assistant" }),
    body: { courseId },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `Hi! I'm your AI learning assistant for "${courseTitle}". I can help you:\n\n• Answer questions about the course content\n• Search for relevant documents and resources\n• Explain difficult concepts\n• Find additional learning materials\n\nWhat would you like to know?`,
          },
        ],
      },
    ],
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return

    sendMessage({ text: input })
    setInput("")
  }

  const renderMessageContent = (parts: any[]) => {
    return parts.map((part, index) => {
      switch (part.type) {
        case "text":
          return (
            <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{part.text}</p>
            </div>
          )

        case "tool-searchDocuments":
          if (part.state === "output-available") {
            return (
              <div key={index} className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span>Found {part.output.count} documents</span>
                </div>
                {part.output.results.map((result: any, idx: number) => (
                  <Card key={idx} className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{result.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{result.snippet}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {result.source}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          }
          return (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Searching documents...</span>
            </div>
          )

        case "tool-getCourseInfo":
          if (part.state === "output-available") {
            return (
              <div key={index} className="mt-2">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-3">
                    <p className="text-sm">{part.output}</p>
                  </CardContent>
                </Card>
              </div>
            )
          }
          return null

        default:
          return null
      }
    })
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-16 bottom-0 z-40 flex flex-col bg-background border-l transition-all duration-300 ease-in-out shadow-lg",
        isOpen ? "w-full sm:w-[400px] translate-x-0" : "w-0 translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-primary" />
            <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {renderMessageContent(message.parts)}
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {status === "streaming" && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={status !== "ready"}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || status !== "ready"} className="flex-shrink-0">
            {status === "streaming" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">Powered by AI • May occasionally make mistakes</p>
      </div>
    </div>
  )
}
