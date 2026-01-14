"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface VideoPlayerProps {
  videoUrl: string
  title: string
  onProgress?: (progress: number) => void
}

export function VideoPlayer({ videoUrl, title, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [quality, setQuality] = useState("auto")
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play().catch(err => console.error("Play error:", err))
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMutedState = !isMuted
    videoRef.current.muted = newMutedState
    setIsMuted(newMutedState)
    if (newMutedState) {
      videoRef.current.volume = 0
    } else {
      videoRef.current.volume = volume > 0 ? volume : 0.5
      if (volume === 0) setVolume(0.5)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const newVolume = value[0]
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
  }

  const skip = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime += seconds
  }

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = clickPosition * duration
  }

  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
      setHasError(false)
      console.log("[v0] Video loaded successfully:", videoUrl)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      if (onProgress && video.duration > 0) {
        const progressPercent = (video.currentTime / video.duration) * 100
        onProgress(progressPercent)
      }
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedPercent = (bufferedEnd / video.duration) * 100
        setBuffered(bufferedPercent)
      }
    }

    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      const errorCode = video.error?.code
      const errorMessages: Record<number, string> = {
        1: "Video loading was aborted",
        2: "Network error occurred while loading the video",
        3: "Video format is not supported or file is corrupted",
        4: "Video source is not available",
      }
      setErrorMessage(errorMessages[errorCode || 4] || "An unknown error occurred")
      console.error("[v0] Video error:", errorCode, video.error?.message)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("progress", handleProgress)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("error", handleError)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("progress", handleProgress)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("error", handleError)
    }
  }, [onProgress, videoUrl])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return

      // Ignore keyboard shortcuts when user is typing in input/textarea
      const target = e.target as HTMLElement
      const isTyping = target.tagName === "INPUT" || 
                       target.tagName === "TEXTAREA" || 
                       target.isContentEditable

      if (isTyping) return

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "m":
          toggleMute()
          break
        case "f":
          toggleFullscreen()
          break
        case "arrowleft":
          skip(-10)
          break
        case "arrowright":
          skip(10)
          break
        case "arrowup":
          e.preventDefault()
          handleVolumeChange([Math.min(volume + 0.1, 1)])
          break
        case "arrowdown":
          e.preventDefault()
          handleVolumeChange([Math.max(volume - 0.1, 0)])
          break
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, volume])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  if (!videoUrl) {
    return (
      <Card className="w-full bg-muted flex items-center justify-center min-h-96">
        <div className="text-center p-8">
          <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Video Not Available</p>
          <p className="text-sm text-muted-foreground">This course video will be uploaded soon.</p>
        </div>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card className="w-full min-h-96 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Load Video</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">{errorMessage}</p>
            <p className="text-sm">Please try:</p>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              <li>Refreshing the page</li>
              <li>Checking your internet connection</li>
              <li>Using a different browser</li>
              <li>Contacting support if the issue persists</li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 bg-transparent"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card
      ref={containerRef}
      className={cn("w-full overflow-hidden transition-all", isFullscreen && "fixed inset-0 z-50 rounded-none")}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="relative bg-black aspect-video flex items-center justify-center group">
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          preload="metadata"
          title={title}
          onClick={togglePlay}
          crossOrigin="anonymous"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          <track kind="captions" />
          Your browser does not support the video tag. Please upgrade your browser.
        </video>

        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {!isPlaying && !isLoading && !hasError && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            aria-label="Play video"
          >
            <div className="w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all hover:scale-110">
              <Play className="h-10 w-10 text-primary-foreground ml-1" />
            </div>
          </button>
        )}

        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0",
          )}
        >
          <div
            ref={progressBarRef}
            className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-4 group/progress hover:h-2 transition-all"
            onClick={handleProgressClick}
          >
            <div className="absolute h-full bg-white/30 rounded-full pointer-events-none" style={{ width: `${buffered}%` }} />
            <div
              className="relative h-full bg-primary rounded-full transition-all pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => skip(-10)}>
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => skip(10)}>
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 group/volume">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-200">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="text-white text-sm font-medium hidden sm:block">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-[60]" sideOffset={5}>
                  <div className="px-2 py-1.5 text-sm font-semibold">Playback Speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={cn(playbackRate === rate && "bg-accent")}
                    >
                      {rate}x {rate === 1 && "(Normal)"}
                    </DropdownMenuItem>
                  ))}
                  <div className="px-2 py-1.5 text-sm font-semibold mt-2 border-t">Quality</div>
                  <DropdownMenuItem
                    onClick={() => setQuality("auto")}
                    className={cn(quality === "auto" && "bg-accent")}
                  >
                    Auto
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setQuality("1080p")}
                    className={cn(quality === "1080p" && "bg-accent")}
                  >
                    1080p
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setQuality("720p")}
                    className={cn(quality === "720p" && "bg-accent")}
                  >
                    720p
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setQuality("480p")}
                    className={cn(quality === "480p" && "bg-accent")}
                  >
                    480p
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block",
            isPlaying && "opacity-0",
          )}
        >
          <div className="font-semibold mb-1">Keyboard Shortcuts</div>
          <div className="space-y-0.5 text-white/80">
            <div>Space/K - Play/Pause</div>
            <div>M - Mute</div>
            <div>F - Fullscreen</div>
            <div>← → - Skip 10s</div>
            <div>↑ ↓ - Volume</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
