import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function DemoBanner() {
  return (
    <Alert className="border-blue-500/50 bg-blue-500/10">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-sm">
        <strong>Demo Mode:</strong> This is a demonstration of Aicser AI Studio. All data is for testing purposes only.
      </AlertDescription>
    </Alert>
  )
}
