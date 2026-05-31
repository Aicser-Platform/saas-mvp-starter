"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ShieldCheck } from "lucide-react"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"

interface PaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectStripe: () => void
  onSelectKHQR: () => void
  tier: string
}

/* ── Stripe official S badge ─────────────────────────────────────────── */
function StripeLogo() {
  return (
    <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#635bff] shrink-0">
      {/* Stripe S glyph — traced from official brand */}
      <svg viewBox="0 0 18 18" fill="none" className="h-5 w-5">
        <path
          d="M8.5 5.6c0-.8.7-1.1 1.8-1.1.8 0 1.6.2 2.3.6V2.8A7 7 0 009.3 2.3C6.7 2.3 5 3.6 5 5.8c0 3.4 4.7 2.9 4.7 4.4 0 1-.9 1.3-2 1.3-1 0-2.2-.3-3.1-.9v2.2c1 .5 2.1.7 3.1.7 2.7 0 4.5-1.2 4.5-3.4C12.2 6.5 8.5 7 8.5 5.6z"
          fill="white"
        />
      </svg>
    </span>
  )
}

/* ── Card brand logos ────────────────────────────────────────────────── */
function VisaLogo() {
  return (
    <span className="inline-flex items-center justify-center bg-[#1a1f71] text-white rounded px-1.5 py-0.5 text-[9px] font-extrabold italic tracking-wider leading-none h-5 min-w-7">
      VISA
    </span>
  )
}

function MastercardLogo() {
  return (
    <span className="inline-flex items-center h-5">
      <span className="block h-4 w-4 rounded-full bg-[#eb001b]" />
      <span className="block h-4 w-4 rounded-full bg-[#f79e1b] -ml-2" />
    </span>
  )
}

function AmexLogo() {
  return (
    <span className="inline-flex items-center justify-center bg-[#007bc1] text-white rounded px-1.5 py-0.5 text-[8px] font-bold leading-none h-5 min-w-8">
      AMEX
    </span>
  )
}

/* ── Component ───────────────────────────────────────────────────────── */
export function PaymentMethodDialog({
  open,
  onOpenChange,
  onSelectStripe,
  onSelectKHQR,
  tier,
}: PaymentMethodDialogProps) {
  const product = SUBSCRIPTION_PRODUCTS.find((p) => p.tier === tier)
  const priceLabel =
    product && product.priceInCents > 0
      ? `$${(product.priceInCents / 100).toFixed(2)}/month`
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Payment method</DialogTitle>
            {product && (
              <DialogDescription>
                <span className="font-medium capitalize">{product.name}</span>
                {priceLabel && (
                  <> &mdash; <span className="font-semibold text-foreground">{priceLabel}</span></>
                )}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-3">

          {/* ── Stripe / Card ───────────────────────────────── */}
          <button
            type="button"
            onClick={() => { onSelectStripe(); onOpenChange(false) }}
            className="group w-full rounded-xl bg-neutral-950 dark:bg-neutral-900 px-5 py-4 text-left transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                {/* Row 1: Stripe badge + wordmark */}
                <div className="flex items-center gap-2.5">
                  <StripeLogo />
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm leading-tight">Pay with Card</span>
                    <span className="text-white/50 text-[11px] leading-tight">Powered by Stripe</span>
                  </div>
                </div>
                {/* Row 2: Card brand logos */}
                <div className="flex items-center gap-1.5">
                  <VisaLogo />
                  <MastercardLogo />
                  <AmexLogo />
                  <span className="text-white/30 text-[10px] ml-0.5">& more</span>
                </div>
              </div>
              <svg className="h-5 w-5 text-white/30 group-hover:text-white/60 transition-colors shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* ── Divider ─────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ── Bakong KHQR ─────────────────────────────────── */}
          <button
            type="button"
            onClick={() => { onSelectKHQR(); onOpenChange(false) }}
            className="group w-full rounded-xl border border-border bg-card px-5 py-4 text-left transition-all hover:border-[#c0392b]/50 hover:bg-red-50/30 dark:hover:bg-red-950/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c0392b]/40"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Bakong logo — place your PNG at /public/bakong-logo.png */}
                <Image
                  src="/bakong-logo.png"
                  alt="Bakong KHQR"
                  width={88}
                  height={32}
                  className="h-8 w-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-foreground leading-tight">Bakong KHQR</span>
                  <span className="text-xs text-muted-foreground leading-tight">Scan with any Cambodian bank app</span>
                </div>
              </div>
              <svg className="h-5 w-5 text-muted-foreground/40 group-hover:text-[#c0392b]/70 transition-colors shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {/* ── Trust note ───────────────────────────────────── */}
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Payments are encrypted and securely processed.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
