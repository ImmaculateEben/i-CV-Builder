"use client"

import { useState, useEffect, Suspense } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { CVPDFDocument } from "@/components/cv/pdf/modern-pdf"
import { useCVStore } from "@/store/cv-store"
import { Download, Loader2 } from "lucide-react"

interface PDFButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

function PDFContent({ variant, size }: PDFButtonProps) {
  const { currentCV } = useCVStore()

  const fileName = currentCV.personalInfo.firstName 
    ? `${currentCV.personalInfo.firstName}_${currentCV.personalInfo.lastName}_CV.pdf`
    : "My_CV.pdf"

  if (!currentCV.personalInfo.firstName) {
    return (
      <Button variant={variant} size={size} disabled>
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
      {({ loading, error }) => {
        if (loading) {
          return (
            <Button variant={variant} size={size} disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Preparing...
            </Button>
          )
        }
        return (
          <Button variant={variant} size={size}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )
      }}
    </PDFDownloadLink>
  )
}

export function PDFDownloadButton(props: PDFButtonProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Button variant={props.variant} size={props.size} disabled>
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    )
  }

  return (
    <Suspense fallback={
      <Button variant={props.variant} size={props.size} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    }>
      <PDFContent {...props} />
    </Suspense>
  )
}
