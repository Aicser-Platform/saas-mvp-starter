"use client"

import type React from "react"

import { useChatbot } from "@/lib/hooks/use-chatbot"
import { AIChatbot } from "./ai-chatbot"
import { ChatbotToggle } from "./chatbot-toggle"

interface CoursePageClientProps {
  courseId: string
  courseTitle: string
  lessonTitle?: string
  lessonContent?: string
  lessonTranscript?: string
  children: React.ReactNode
}

export function CoursePageClient({
  courseId,
  courseTitle,
  lessonTitle,
  lessonContent,
  lessonTranscript,
  children,
}: CoursePageClientProps) {
  const { isOpen, toggle } = useChatbot()

  return (
    <>
      {children}
      <AIChatbot
        courseId={courseId}
        courseTitle={courseTitle}
        lessonTitle={lessonTitle}
        lessonContent={lessonContent}
        lessonTranscript={lessonTranscript}
        isOpen={isOpen}
        onToggle={toggle}
      />
      <ChatbotToggle isOpen={isOpen} onClick={toggle} />
    </>
  )
}
