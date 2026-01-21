"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, ChevronDown, Send, Sparkles, Loader2, FileText, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIChatbotProps {
  courseId: string
  courseTitle: string
  isOpen: boolean
  onToggle: () => void
}

interface SearchHistory {
  query: string
  results: any[]
  timestamp: Date
}

export function AIChatbot({ courseId, courseTitle, isOpen, onToggle }: AIChatbotProps) {
  const [input, setInput] = useState("")
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Auto-scroll to bottom when new results added
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [searchHistory, isLoading, error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const currentQuery = input.trim()
    setIsLoading(true)
    setError(null)
    setInput("")

    try {
      const response = await fetch("/api/google-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery, source: "google-search", courseId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Search failed")
      }

      const data = await response.json()
      setSearchHistory((prev) => [
        ...prev,
        {
          query: currentQuery,
          results: data.results || [],
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setSearchHistory([])
    setError(null)
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
            <p className="text-xs text-muted-foreground">Google search powered</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {searchHistory.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearHistory} className="h-8 w-8" title="Clear history">
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6 pb-20">
          {searchHistory.length === 0 && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="relative mb-4">
                <Bot className="h-12 w-12 text-muted-foreground/50" />
                <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1" />
              </div>
              <p className="text-sm text-muted-foreground">Ask me anything about the course</p>
              <p className="text-xs text-muted-foreground mt-1">I'll search the web for you</p>
            </div>
          )}

          {searchHistory.map((search, historyIdx) => (
            <div key={historyIdx} className="space-y-3">
              {/* Query */}
              <div className="bg-primary/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Search className="h-3 w-3 text-primary" />
                  <p className="text-sm font-medium">{search.query}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {search.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {/* Results */}
              {search.results.length > 0 ? (
                <div className="space-y-2 ml-2 border-l-2 border-primary/20 pl-3">
                  <p className="text-xs text-muted-foreground">
                    Found {search.results.length} results
                  </p>
                  {search.results.map((result, idx) => (
                    <Card key={idx} className="bg-muted/50 hover:bg-muted transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium hover:underline hover:text-primary block"
                            >
                              {result.title}
                            </a>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {result.snippet}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {result.source}
                              </Badge>
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline truncate max-w-[150px]"
                              >
                                {result.url}
                              </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="ml-2 border-l-2 border-primary/20 pl-3">
                  <p className="text-xs text-muted-foreground">No results found</p>
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3 text-sm text-muted-foreground items-center p-3 bg-muted/30 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
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
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="flex-shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">Powered by Google Custom Search</p>
      </div>
    </div>
  )
}
