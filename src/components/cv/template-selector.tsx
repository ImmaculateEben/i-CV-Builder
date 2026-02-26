"use client"

import { useCVStore } from "@/store/cv-store"
import type { TemplateId } from "@/types/cv"
import { cn } from "@/lib/utils"
import {
  CVTemplatePreview,
  CVTemplateRenderer,
  cvTemplateRegistry,
  cvTemplateRegistryMap,
} from "@/components/cv/templates/registry"
import { buildPreviewCV } from "@/components/cv/templates/template-utils"

interface TemplateSelectorProps {
  onSelect?: (templateId: TemplateId) => void
  mode?: "apply" | "clone"
}

export function TemplateSelector({ onSelect, mode = "apply" }: TemplateSelectorProps) {
  const { currentTemplate, setTemplate, currentCV } = useCVStore()
  const isCloneMode = mode === "clone"

  const handleSelect = (templateId: TemplateId) => {
    if (!isCloneMode) {
      setTemplate(templateId)
    }
    onSelect?.(templateId)
  }

  const currentTemplateMeta = cvTemplateRegistryMap[currentTemplate]
  const previewCV = buildPreviewCV(currentCV, currentTemplate)

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">
          {isCloneMode ? "Clone as New Template" : "Choose a Template"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isCloneMode
            ? "Select a template to create a new draft clone while keeping your current CV content."
            : "Switch anytime. Your data stays the same while the layout changes."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cvTemplateRegistry.map((template) => {
          const isSelected = currentTemplate === template.id
          const Icon = template.icon

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template.id)}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-card text-left transition-all",
                isSelected
                  ? "border-primary shadow-md shadow-primary/10 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/40 hover:shadow-sm"
              )}
            >
              <CVTemplatePreview templateId={template.id} className="rounded-none border-0" scale={0.19} />

              <div className="border-t bg-card p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm",
                        template.accentClassName
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{template.name}</h4>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          template.chipClassName
                        )}
                      >
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      {isCloneMode ? "Current" : "Active"}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Live Preview</h3>
            <p className="text-sm text-muted-foreground">
              Previewing{" "}
              <span className="font-medium text-foreground">{currentTemplateMeta.name}</span>{" "}
              with your content.
            </p>
          </div>
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
              currentTemplateMeta.chipClassName
            )}
          >
            {currentTemplateMeta.category}
          </span>
        </div>

        <div className="overflow-auto rounded-lg border bg-slate-100 p-4">
          <div className="mx-auto w-full max-w-[800px] origin-top scale-[0.72] sm:scale-[0.8] md:scale-[0.88]">
            <CVTemplateRenderer templateId={currentTemplate} cv={previewCV} />
          </div>
        </div>
      </div>
    </div>
  )
}
