"use client"

import { Button } from "@/components/ui/button"
import { Bot, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatbotToggleProps {
  isOpen: boolean
  onClick: () => void
}

export function ChatbotToggle({ isOpen, onClick }: ChatbotToggleProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110",
        "bg-gradient-to-br from-primary to-primary/80",
        isOpen && "scale-0",
      )}
    >
      <div className="relative">
        <Bot className="h-6 w-6" />
        <MessageCircle className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
      </div>
    </Button>
  )
}
