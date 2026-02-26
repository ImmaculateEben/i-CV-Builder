import type { ComponentType } from "react"
import type { CV, TemplateId } from "@/types/cv"
import {
  CreativePDFPage,
  ExecutivePDFPage,
  MinimalPDFPage,
  ModernPDFPage,
  NigerianPDFPage,
  ProfessionalPDFPage,
  TechPDFPage,
} from "@/components/cv/pdf/template-pdfs"

type PDFTemplateComponent = ComponentType<{ cv: CV }>

export const pdfTemplateRegistryMap: Record<TemplateId, PDFTemplateComponent> = {
  modern: ModernPDFPage,
  professional: ProfessionalPDFPage,
  creative: CreativePDFPage,
  nigerian: NigerianPDFPage,
  minimal: MinimalPDFPage,
  executive: ExecutivePDFPage,
  tech: TechPDFPage,
}

export function CVPDFTemplateRenderer({
  templateId,
  cv,
}: {
  templateId: TemplateId
  cv: CV
}) {
  const TemplateComponent = pdfTemplateRegistryMap[templateId]
  return <TemplateComponent cv={cv} />
}
