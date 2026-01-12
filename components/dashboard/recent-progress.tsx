import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Clock } from "lucide-react"

interface RecentProgressProps {
  progress: any[]
}

export function RecentProgress({ progress }: RecentProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Continue Learning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {progress.map((item) => (
          <Link key={item.id} href={`/dashboard/courses/${item.course_id}`}>
            <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.courses?.title}</p>
                  <span className="text-sm text-muted-foreground">{item.progress_percentage}%</span>
                </div>
                <Progress value={item.progress_percentage} className="h-2" />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
