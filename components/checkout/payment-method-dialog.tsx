"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, QrCode } from "lucide-react"

interface PaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectStripe: () => void
  onSelectKHQR: () => void
  tier: string
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  onSelectStripe,
  onSelectKHQR,
  tier,
}: PaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Payment Method</DialogTitle>
          <DialogDescription>
            Select how you would like to pay for your {tier} subscription.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-6 border-2 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => {
              onSelectStripe()
              onOpenChange(false)
            }}
          >
            <CreditCard className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-lg">Credit / Debit Card</div>
              <div className="text-sm text-muted-foreground">Powered by Stripe</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-6 border-2 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => {
              onSelectKHQR()
              onOpenChange(false)
            }}
          >
            <QrCode className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-lg">Bakong KHQR</div>
              <div className="text-sm text-muted-foreground">Scan to pay with local banking apps</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
