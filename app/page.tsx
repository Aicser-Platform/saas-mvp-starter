"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"
import { Brain, Check, Sparkles, Users, Zap, GraduationCap, TrendingUp, Award } from "lucide-react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between relative">
          <div className="flex items-center gap-2 shrink-0">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2.5 sm:gap-3 group relative focus:outline-none rounded-lg"
              aria-label="Aicser Home"
            >
              <div className="relative">
                <Image
                  src="https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4"
                  alt="Aicser Logo"
                  width={32}
                  height={32}
                  className="rounded-lg group-hover:shadow-lg group-hover:scale-105 transition-all duration-300"
                  priority
                />
                <div className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10"></div>
              </div>
              <span className="text-xl sm:text-2xl font-serif font-bold gradient-text group-hover:opacity-90 transition-opacity">Aicser EdTech SaaS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="flex flex-col p-4 space-y-3">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors py-2">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors py-2">
                Pricing
              </Link>
              <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors py-2">
                About
              </Link>
              <div className="border-t pt-3 space-y-2">
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up" className="block">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-16 sm:py-20 md:py-28 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>AI-Powered Learning Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-tight">
              Master AI & Machine Learning
              <br />
              <span className="text-primary">At Your Own Pace</span>
            </h1>
            <p className="max-w-[700px] text-base sm:text-lg text-muted-foreground text-balance leading-relaxed">
              Join thousands of students learning artificial intelligence through our comprehensive, hands-on courses.
              From beginner to expert, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-base">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="#pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-base bg-transparent">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 sm:py-20 md:py-28 bg-muted/50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Why Choose Aicser?
            </h2>
            <p className="max-w-[700px] text-sm sm:text-base md:text-lg text-muted-foreground">
              Everything you need to succeed in your AI learning journey
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2" />
                <CardTitle className="text-lg sm:text-xl">Expert-Led Courses</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Learn from industry professionals with years of AI experience
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2" />
                <CardTitle className="text-lg sm:text-xl">Hands-On Projects</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Apply your knowledge with real-world projects
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2" />
                <CardTitle className="text-lg sm:text-xl">Progress Tracking</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Monitor your learning with detailed analytics
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Award className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2" />
                <CardTitle className="text-lg sm:text-xl">Certificates</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Earn certificates to showcase your skills
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-16 sm:py-20 md:py-28">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Choose Your Plan</h2>
            <p className="max-w-[700px] text-sm sm:text-base md:text-lg text-muted-foreground">
              Start free and upgrade as you grow. All plans include platform access.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {SUBSCRIPTION_PRODUCTS.map((product) => (
              <Card key={product.id} className={product.tier === "pro" ? "border-primary shadow-lg md:scale-105" : ""}>
                <CardHeader>
                  {product.tier === "pro" && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground mb-2 w-fit">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="text-xl sm:text-2xl">{product.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{product.description}</CardDescription>
                  <div className="mt-4 space-y-1">
                    <span className="text-3xl sm:text-4xl font-bold">
                      ${product.priceInCents === 0 ? "0" : (product.priceInCents / 100).toFixed(2)}
                    </span>
                    {product.priceInCents > 0 && (
                      <span className="text-xs sm:text-sm text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 sm:space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/sign-up" className="block">
                    <Button
                      className="w-full text-sm sm:text-base"
                      variant={product.tier === "pro" ? "default" : "outline"}
                    >
                      {product.tier === "free" ? "Get Started Free" : "Upgrade to " + product.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="w-full py-16 sm:py-20 md:py-28 bg-muted/50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Built for Modern Learners
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                Aicser AI Studio is your gateway to mastering artificial intelligence and machine learning. Our platform
                combines cutting-edge technology with proven teaching methods.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 pt-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">10k+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Active Students</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">50+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Expert Courses</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">95%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Users className="h-20 w-20 sm:h-32 sm:w-32 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-20 md:py-28">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center text-center space-y-4 sm:space-y-6 py-10 sm:py-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                Ready to Start?
              </h2>
              <p className="max-w-[600px] text-sm sm:text-base md:text-lg text-primary-foreground/90 text-balance leading-relaxed">
                Join thousands of students learning AI with Aicser AI Studio. Start free today.
              </p>
              <Link href="/auth/sign-up">
                <Button size="lg" variant="secondary" className="text-sm sm:text-base">
                  Get Started Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-muted/50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                {/* Logo */}
                <Link 
                  href="/" 
                  className="flex items-center gap-2.5 sm:gap-3 group relative focus:outline-none rounded-lg"
                  aria-label="Aicser Home"
                >
                  <div className="relative">
                    <Image
                      src="https://avatars.githubusercontent.com/u/133837356?s=400&u=f050ed1d6533a8115745104b0c23121b3a6bbeaa&v=4"
                      alt="Aicser Logo"
                      width={32}
                      height={32}
                      className="rounded-lg group-hover:shadow-lg group-hover:scale-105 transition-all duration-300"
                      priority
                    />
                    <div className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10"></div>
                  </div>
                  <span className="text-xl sm:text-2xl font-serif font-bold gradient-text group-hover:opacity-90 transition-opacity">Aicser</span>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Master AI at your own pace.</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Product</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href="#about" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Legal</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2026 Aicser EdTech SaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
