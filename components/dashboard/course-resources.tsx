"use client"

import { Download, File, FileText, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Resource {
  id: string
  name: string
  url: string
  type: string
}

interface CourseResourcesProps {
  resources: Resource[] | null
}

export function CourseResources({ resources }: CourseResourcesProps) {
  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No resources available for this course yet.</p>
        </CardContent>
      </Card>
    )
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "zip":
      case "rar":
        return <Archive className="h-5 w-5 text-amber-500" />
      default:
        return <File className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map((resource, index) => (
          <div
            key={resource.id ?? `resource-${index}`}
            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              {getFileIcon(resource.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{resource.name}</p>
                <p className="text-xs text-muted-foreground">{resource.type.toUpperCase()}</p>
              </div>
            </div>
            <a href={resource.url} download target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
