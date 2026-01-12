import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle, Clock, Award } from "lucide-react"

interface DashboardStatsProps {
  totalCourses: number
  inProgress: number
  completed: number
  subscriptionTier: string
}

export function DashboardStats({ totalCourses, inProgress, completed, subscriptionTier }: DashboardStatsProps) {
  const tierColors = {
    free: "text-gray-600",
    pro: "text-blue-600",
    premium: "text-purple-600",
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCourses}</div>
          <p className="text-xs text-muted-foreground mt-1">Available courses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgress}</div>
          <p className="text-xs text-muted-foreground mt-1">Courses started</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completed}</div>
          <p className="text-xs text-muted-foreground mt-1">Courses finished</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold capitalize ${tierColors[subscriptionTier as keyof typeof tierColors]}`}>
            {subscriptionTier}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Subscription tier</p>
        </CardContent>
      </Card>
    </div>
  )
}
