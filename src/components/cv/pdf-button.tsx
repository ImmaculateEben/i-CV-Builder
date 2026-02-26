"use client"

import { Suspense } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { CVPDFDocument } from "@/components/cv/pdf/modern-pdf"
import { useCVStore } from "@/store/cv-store"
import { useHydrated } from "@/lib/use-hydrated"
import { Download, Loader2 } from "lucide-react"

interface PDFButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

function PDFContent({ variant, size, className }: PDFButtonProps) {
  const { currentCV } = useCVStore()

  const fileName = currentCV.personalInfo.firstName 
    ? `${currentCV.personalInfo.firstName}_${currentCV.personalInfo.lastName}_CV.pdf`
    : "My_CV.pdf"

  if (!currentCV.personalInfo.firstName) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={<CVPDFDocument cv={currentCV} />}
      fileName={fileName}
    >
      {({ loading }) => {
        if (loading) {
          return (
            <Button variant={variant} size={size} className={className} disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Preparing...
            </Button>
          )
        }
        return (
          <Button variant={variant} size={size} className={className}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )
      }}
    </PDFDownloadLink>
  )
}

export function PDFDownloadButton(props: PDFButtonProps) {
  const isHydrated = useHydrated()

  if (!isHydrated) {
    return (
      <Button variant={props.variant} size={props.size} className={props.className} disabled>
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    )
  }

  return (
    <Suspense fallback={
      <Button variant={props.variant} size={props.size} className={props.className} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    }>
      <PDFContent {...props} />
    </Suspense>
  )
}
