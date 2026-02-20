"use client"

import { useState, useEffect } from "react"
import { TemplateId, templates } from "@/types/cv"
import { useCVStore } from "@/store/cv-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

interface TemplateSelectorProps {
  onSelect?: (templateId: TemplateId) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const { currentTemplate, setTemplate, currentCV } = useCVStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleSelect = (templateId: TemplateId) => {
    setTemplate(templateId)
    onSelect?.(templateId)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose a Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = templateIcons[template.id]
          const isSelected = currentTemplate === template.id

          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                </div>
              )}

              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                templateColors[template.id]
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              <h4 className="font-semibold text-gray-900">{template.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Preview Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
        <div className="border rounded-lg overflow-hidden bg-gray-100 p-4">
          <div className="max-w-[600px] mx-auto transform scale-75 lg:scale-90 xl:scale-100 origin-top">
            {currentTemplate === "modern" && (
              <div className="bg-white p-4 text-sm">
                <div className="border-b-2 border-blue-600 pb-2 mb-2">
                  <h1 className="text-xl font-bold">John Doe</h1>
                  <p className="text-gray-600 text-xs">john@email.com | +234 800 000 0000</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Professional Summary</p>
                  <p className="text-xs">Results-driven professional...</p>
                </div>
              </div>
            )}
            {currentTemplate === "professional" && (
              <div className="bg-white p-4 text-sm">
                <div className="text-center border-b pb-2 mb-2">
                  <h1 className="text-xl font-serif font-bold uppercase">John Doe</h1>
                  <p className="text-gray-600 text-xs">john@email.com | +234 800 000 0000</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-serif font-bold">SUMMARY</p>
                  <p className="text-xs">Results-driven professional...</p>
                </div>
              </div>
            )}
            {currentTemplate === "creative" && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2 text-sm">
                <div className="bg-white p-3">
                  <h1 className="text-xl font-bold text-purple-600">John Doe</h1>
                  <p className="text-xs text-gray-600">john@email.com</p>
                </div>
              </div>
            )}
            {currentTemplate === "nigerian" && (
              <div className="bg-green-700 p-3 text-sm">
                <h1 className="text-xl font-bold text-white">John Doe</h1>
                <p className="text-green-100 text-xs">john@email.com | Lagos, Nigeria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
