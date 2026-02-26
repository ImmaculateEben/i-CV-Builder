import type { ComponentType } from "react"
import type { CV, TemplateId } from "@/types/cv"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
  Blocks,
  Briefcase,
  Crown,
  Globe,
  Layout,
  Minimize2,
  Palette,
} from "lucide-react"
import { ModernTemplate } from "./modern-template"
import { ProfessionalTemplate } from "./professional-template"
import { CreativeTemplate } from "./creative-template"
import { NigerianTemplate } from "./nigerian-template"
import { MinimalTemplate } from "./minimal-template"
import { ExecutiveTemplate } from "./executive-template"
import { TechTemplate } from "./tech-template"
import { buildPreviewCV, demoCV } from "./template-utils"

type TemplateComponent = ComponentType<{ cv: CV }>

const templateComponentMap: Record<TemplateId, TemplateComponent> = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  creative: CreativeTemplate,
  nigerian: NigerianTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
}

export interface CVTemplateDefinition {
  id: TemplateId
  name: string
  description: string
  icon: LucideIcon
  accentClassName: string
  chipClassName: string
  category: "ATS" | "Creative" | "Regional" | "Executive" | "Technical"
}

export const cvTemplateRegistry: CVTemplateDefinition[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary two-column layout with clean emphasis on achievements.",
    icon: Layout,
    accentClassName: "bg-blue-600",
    chipClassName: "bg-blue-50 text-blue-700 border-blue-200",
    category: "ATS",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional, formal resume design suitable for corporate and legal roles.",
    icon: Briefcase,
    accentClassName: "bg-stone-700",
    chipClassName: "bg-stone-100 text-stone-700 border-stone-200",
    category: "ATS",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant portfolio-style CV for design, branding, and media positions.",
    icon: Palette,
    accentClassName: "bg-gradient-to-r from-rose-500 to-orange-400",
    chipClassName: "bg-rose-50 text-rose-700 border-rose-200",
    category: "Creative",
  },
  {
    id: "nigerian",
    name: "Nigerian Regional",
    description: "Localized structure with clear referees and competency emphasis.",
    icon: Globe,
    accentClassName: "bg-emerald-700",
    chipClassName: "bg-emerald-50 text-emerald-700 border-emerald-200",
    category: "Regional",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Quiet monochrome layout designed for clarity and easy scanning.",
    icon: Minimize2,
    accentClassName: "bg-zinc-800",
    chipClassName: "bg-zinc-100 text-zinc-700 border-zinc-200",
    category: "ATS",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium presentation for senior leadership and management profiles.",
    icon: Crown,
    accentClassName: "bg-slate-900",
    chipClassName: "bg-amber-50 text-amber-700 border-amber-200",
    category: "Executive",
  },
  {
    id: "tech",
    name: "Tech Grid",
    description: "Developer-focused dark layout with skill levels and structured panels.",
    icon: Blocks,
    accentClassName: "bg-cyan-500",
    chipClassName: "bg-cyan-50 text-cyan-700 border-cyan-200",
    category: "Technical",
  },
]

export const cvTemplateRegistryMap: Record<TemplateId, CVTemplateDefinition> =
  Object.fromEntries(cvTemplateRegistry.map((template) => [template.id, template])) as Record<
    TemplateId,
    CVTemplateDefinition
  >

export function CVTemplateRenderer({
  templateId,
  cv,
}: {
  templateId: TemplateId
  cv: CV
}) {
  const TemplateComponent = templateComponentMap[templateId]
  return <TemplateComponent cv={cv} />
}

export function CVTemplatePreview({
  templateId,
  cv,
  className,
  scale = 0.22,
}: {
  templateId: TemplateId
  cv?: CV
  className?: string
  scale?: number
}) {
  const previewCV = buildPreviewCV(cv ?? demoCV, templateId)

  return (
    <div
      className={cn(
        "relative aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-100",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.95),transparent_55%)]" />
      <div
        className="absolute left-1/2 top-3 origin-top -translate-x-1/2"
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        <div className="w-[800px]">
          <CVTemplateRenderer templateId={templateId} cv={previewCV} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-100 via-slate-100/70 to-transparent" />
    </div>
  )
}
