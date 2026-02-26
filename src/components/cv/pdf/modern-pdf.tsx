import { Document } from "@react-pdf/renderer"
import type { CV } from "@/types/cv"
import { CVPDFTemplateRenderer } from "@/components/cv/pdf/registry"

interface CVPDFProps {
  cv: CV
}

export function CVPDFDocument({ cv }: CVPDFProps) {
  return (
    <Document>
      <CVPDFTemplateRenderer templateId={cv.templateId} cv={cv} />
    </Document>
  )
}
