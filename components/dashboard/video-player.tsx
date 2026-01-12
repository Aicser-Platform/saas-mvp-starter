"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { Card } from "@/components/ui/card"

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  if (!videoUrl) {
    return (
      <Card className="w-full bg-muted flex items-center justify-center min-h-96">
        <div className="text-center">
          <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Video not available yet</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`w-full overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}>
      <div className="relative bg-black aspect-video flex items-center justify-center">
        <video className="w-full h-full" controls controlsList="nodownload" title={title}>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </Card>
  )
}
