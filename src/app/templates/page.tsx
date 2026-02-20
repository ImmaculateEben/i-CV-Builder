"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { templates } from "@/types/cv"
import { Check, Layout, Briefcase, Palette, Globe } from "lucide-react"

const templateIcons = {
  modern: Layout,
  professional: Briefcase,
  creative: Palette,
  nigerian: Globe,
}

const templateColors = {
  modern: "bg-blue-500",
  professional: "bg-gray-700",
  creative: "bg-gradient-to-r from-purple-500 to-pink-500",
  nigerian: "bg-green-600",
}

export default function TemplatesPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Choose Your Perfect Template</h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of professionally designed CV templates. 
              All templates are optimized for ATS and ready to use.
            </p>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {templates.map((template) => {
                const Icon = templateIcons[template.id]
                
                return (
                  <div 
                    key={template.id}
                    className="group relative rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Template Preview */}
                    <div className="aspect-[3/4] bg-gray-100 p-4 flex items-center justify-center">
                      <div className="w-full max-w-[180px] transform scale-75 origin-center">
                        {template.id === "modern" && (
                          <div className="bg-white p-3 text-xs shadow">
                            <div className="border-b-2 border-blue-600 pb-2 mb-2">
                              <h1 className="text-lg font-bold">John Doe</h1>
                              <p className="text-gray-500">john@email.com</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] text-gray-400">SUMMARY</p>
                              <p className="text-[8px]">Professional summary...</p>
                            </div>
                          </div>
                        )}
                        {template.id === "professional" && (
                          <div className="bg-white p-3 text-xs shadow">
                            <div className="text-center border-b pb-2 mb-2">
                              <h1 className="text-lg font-serif font-bold uppercase">John Doe</h1>
                              <p className="text-gray-500 text-[8px]">john@email.com</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-serif font-bold">SUMMARY</p>
                              <p className="text-[8px]">Professional summary...</p>
                            </div>
                          </div>
                        )}
                        {template.id === "creative" && (
                          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-1 text-xs">
                            <div className="bg-white p-2">
                              <h1 className="text-lg font-bold text-purple-600">John Doe</h1>
                              <p className="text-[8px] text-gray-600">john@email.com</p>
                            </div>
                          </div>
                        )}
                        {template.id === "nigerian" && (
                          <div className="bg-green-700 p-2 text-xs">
                            <h1 className="text-lg font-bold text-white">John Doe</h1>
                            <p className="text-green-100 text-[8px]">Lagos, Nigeria</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${templateColors[template.id]}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <Link href="/editor">
                        <Button className="w-full">Use Template</Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Our Templates?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">ATS Optimized</h3>
                <p className="text-muted-foreground">
                  All templates are designed to pass through Applicant Tracking Systems
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Layout className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy to Customize</h3>
                <p className="text-muted-foreground">
                  Simple drag-and-drop interface makes customization a breeze
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">PDF Export</h3>
                <p className="text-muted-foreground">
                  Export to PDF with perfect formatting every time
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
