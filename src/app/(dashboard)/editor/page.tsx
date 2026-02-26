"use client"

import { Suspense, useEffect, useEffectEvent, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonalInfoForm } from "@/components/cv/forms/personal-info-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  User, Briefcase, GraduationCap, Award, Languages, 
  Users, FileText, Plus, Trash2, ChevronRight, ChevronLeft,
  Eye, Palette, Save, Loader2, Upload, Download, History, Target, Sparkles,
  Copy, ChevronUp, ChevronDown, Undo2, Redo2
} from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import type { CV } from "@/types/cv"
import { isTemplateId } from "@/types/cv"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/lib/use-hydrated"
import {
  createCVVersionSnapshot,
  getCVById,
  listCVVersions,
  saveCVRecord,
} from "@/lib/cv-repository"
import {
  buildDraftStorageKey,
  extractJobKeywords,
  parseCVImportEnvelope,
  stringifyCVImportEnvelope,
  summarizeCVChanges,
} from "@/lib/cv-tools"
import { PDFDownloadButton } from "@/components/cv/pdf-button"
import { TemplateSelector } from "@/components/cv/template-selector"
import { CVTemplateRenderer } from "@/components/cv/templates/registry"
import type { EditorHistoryEntry } from "@/types/editor"

const steps = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Award },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "referees", label: "Referees", icon: Users },
]

type SkillLevel = CV["skills"][number]["level"]
type SkillCategory = CV["skills"][number]["category"]
type LanguageProficiency = CV["languages"][number]["proficiency"]

const fingerprintCV = (cv: CV) =>
  JSON.stringify({
    ...cv,
    id: "",
    createdAt: "",
    updatedAt: "",
  })

function RowActionButtons({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  compact = false,
}: {
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onRemove: () => void
  compact?: boolean
}) {
  const wrapperClass = compact
    ? "flex flex-wrap gap-1 w-full sm:w-auto"
    : "flex items-center gap-1"

  return (
    <div className={wrapperClass}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canMoveUp}
        onClick={onMoveUp}
        className={compact ? "w-full sm:w-auto" : undefined}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canMoveDown}
        onClick={onMoveDown}
        className={compact ? "w-full sm:w-auto" : undefined}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDuplicate}
        className={compact ? "w-full sm:w-auto" : undefined}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className={compact ? "w-full sm:w-auto" : undefined}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

function EditorPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isHydrated = useHydrated()
  const [currentStep, setCurrentStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showTargeting, setShowTargeting] = useState(false)
  const [isLoadingCV, setIsLoadingCV] = useState(false)
  const [isSavingCV, setIsSavingCV] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Draft (not saved)")
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState<string | null>(null)
  const loadedCvIdRef = useRef<string | null>(null)
  const hasPromptedDraftRef = useRef<string | null>(null)
  const importFileRef = useRef<HTMLInputElement | null>(null)
  const [historyEntries, setHistoryEntries] = useState<EditorHistoryEntry[]>([])
  const { currentCV, currentTemplate, canUndo, canRedo, undo, redo, setCurrentCV, setTemplate, updateSummary, addExperience, updateExperience, removeExperience, duplicateExperience, moveExperience,
    addEducation, updateEducation, removeEducation, duplicateEducation, moveEducation,
    addSkill, updateSkill, removeSkill, duplicateSkill, moveSkill,
    addCertification, updateCertification, removeCertification, duplicateCertification, moveCertification,
    addLanguage, updateLanguage, removeLanguage, duplicateLanguage, moveLanguage,
    addReferee, updateReferee, removeReferee, duplicateReferee, moveReferee,
    updateTargeting,
  } = useCVStore()

  const currentCvIdParam = searchParams.get("id")?.trim() ?? ""
  const draftStorageKey = buildDraftStorageKey(currentCvIdParam || currentCV.id)

  useEffect(() => {
    const templateParam = searchParams.get("template")

    if (!templateParam || !isTemplateId(templateParam) || templateParam === currentTemplate) {
      return
    }

    setTemplate(templateParam)
  }, [currentTemplate, searchParams, setTemplate])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const idParam = searchParams.get("id")?.trim() ?? ""
    if (!idParam) {
      loadedCvIdRef.current = null
      setIsLoadingCV(false)
      setStatusMessage("Draft (not saved)")
      return
    }

    if (loadedCvIdRef.current === idParam) {
      return
    }

    let cancelled = false
    setIsLoadingCV(true)
    setStatusMessage("Loading CV...")

    void (async () => {
      try {
        const loaded = await getCVById(idParam)
        if (cancelled) {
          return
        }

        if (!loaded) {
          loadedCvIdRef.current = null
          setStatusMessage("CV not found")
          return
        }

        loadedCvIdRef.current = loaded.id
        const draftKey = buildDraftStorageKey(loaded.id)
        let nextCV = loaded

        try {
          const rawDraft = window.localStorage.getItem(draftKey)
          if (rawDraft && hasPromptedDraftRef.current !== draftKey) {
            hasPromptedDraftRef.current = draftKey
            const parsedDraft = JSON.parse(rawDraft) as {
              cv?: CV
              savedAt?: string
            }
            const localDraftCV = parsedDraft.cv

            const draftUpdatedAt = localDraftCV?.updatedAt
            const shouldRestore =
              localDraftCV &&
              draftUpdatedAt &&
              new Date(draftUpdatedAt).getTime() > new Date(loaded.updatedAt).getTime() &&
              window.confirm("A newer local draft was found for this CV. Restore it?")

            if (shouldRestore) {
              nextCV = localDraftCV
              setStatusMessage("Local draft restored")
            }
          }
        } catch {
          // Ignore malformed local drafts.
        }

        setCurrentCV(nextCV)
        setLastSavedFingerprint(fingerprintCV(nextCV))
        if (nextCV === loaded) {
          setStatusMessage(`Loaded ${loaded.personalInfo.firstName || "CV"}`)
        }
      } catch (error) {
        if (cancelled) {
          return
        }
        setStatusMessage(error instanceof Error ? `Load failed: ${error.message}` : "Load failed")
      } finally {
        if (!cancelled) {
          setIsLoadingCV(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isHydrated, searchParams, setCurrentCV])

  useEffect(() => {
    if (!isHydrated || isLoadingCV) {
      return
    }

    if (currentCvIdParam) {
      return
    }

    if (hasPromptedDraftRef.current === draftStorageKey) {
      return
    }

    hasPromptedDraftRef.current = draftStorageKey

    try {
      const rawDraft = window.localStorage.getItem(draftStorageKey)
      if (!rawDraft) {
        return
      }

      const parsedDraft = JSON.parse(rawDraft) as { cv?: CV }
      if (!parsedDraft.cv) {
        return
      }

      const hasMeaningfulData =
        parsedDraft.cv.summary.trim() ||
        parsedDraft.cv.experience.length > 0 ||
        parsedDraft.cv.education.length > 0 ||
        parsedDraft.cv.skills.length > 0 ||
        parsedDraft.cv.personalInfo.firstName.trim() ||
        parsedDraft.cv.personalInfo.lastName.trim()

      if (!hasMeaningfulData) {
        return
      }

      if (window.confirm("A local draft was found. Restore it?")) {
        setCurrentCV(parsedDraft.cv)
        setLastSavedFingerprint(fingerprintCV(parsedDraft.cv))
        setStatusMessage("Local draft restored")
      }
    } catch {
      // Ignore malformed drafts.
    }
  }, [currentCvIdParam, draftStorageKey, isHydrated, isLoadingCV, setCurrentCV])

  useEffect(() => {
    if (!isHydrated || isLoadingCV) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          draftStorageKey,
          JSON.stringify({
            key: draftStorageKey,
            savedAt: new Date().toISOString(),
            source: "local",
            cv: currentCV,
          })
        )

        if (!isSavingCV && statusMessage !== "Unsaved changes") {
          setStatusMessage((prev) => (prev.startsWith("Saved ") ? prev : "Draft saved locally"))
        }
      } catch {
        // Ignore storage quota errors.
      }
    }, 800)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [currentCV, draftStorageKey, isHydrated, isLoadingCV, isSavingCV, statusMessage])

  useEffect(() => {
    if (!isHydrated || isLoadingCV || isSavingCV) {
      return
    }

    if (!lastSavedFingerprint) {
      return
    }

    const changed = fingerprintCV(currentCV) !== lastSavedFingerprint
    if (changed) {
      setStatusMessage("Unsaved changes")
    }
  }, [currentCV, isHydrated, isLoadingCV, isSavingCV, lastSavedFingerprint])

  useEffect(() => {
    if (!showHistory || !currentCV.id) {
      return
    }

    let cancelled = false
    setIsLoadingHistory(true)

    void (async () => {
      try {
        const entries = await listCVVersions(currentCV.id)
        if (!cancelled) {
          setHistoryEntries(entries)
        }
      } catch {
        if (!cancelled) {
          setHistoryEntries([])
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHistory(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [currentCV.id, showHistory])

  const handleExportJSON = () => {
    const blob = new Blob([stringifyCVImportEnvelope(currentCV)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    const fileBase = [currentCV.personalInfo.firstName, currentCV.personalInfo.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join("_") || "cv"

    anchor.href = url
    anchor.download = `${fileBase}.cv.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setStatusMessage("Exported JSON")
  }

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const content = await file.text()
      const imported = parseCVImportEnvelope(content)
      setCurrentCV({
        ...imported.cv,
        id: "",
        updatedAt: new Date().toISOString(),
        createdAt: imported.cv.createdAt || new Date().toISOString(),
      })
      loadedCvIdRef.current = null
      setLastSavedFingerprint(fingerprintCV(imported.cv))
      setStatusMessage("Imported JSON into current draft")
      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.delete("id")
      nextParams.set("template", imported.cv.templateId)
      router.replace(`/editor?${nextParams.toString()}`)
    } catch (error) {
      setStatusMessage(error instanceof Error ? `Import failed: ${error.message}` : "Import failed")
    } finally {
      event.target.value = ""
    }
  }

  const updateTargetingField = <K extends keyof NonNullable<CV["targeting"]>>(
    key: K,
    value: NonNullable<CV["targeting"]>[K]
  ) => {
    updateTargeting({ [key]: value } as Partial<NonNullable<CV["targeting"]>>)
  }

  const handleExtractKeywords = () => {
    const keywords = extractJobKeywords(currentCV.targeting?.jobDescription ?? "")
    updateTargetingField("extractedKeywords", keywords)
    setStatusMessage(keywords.length ? "Extracted job keywords" : "No keywords extracted")
  }

  const handleCreateTailoredVariant = () => {
    const now = new Date().toISOString()
    const variantLabel = currentCV.targeting?.targetRole?.trim() || "Tailored Variant"
    const nextCV: CV = {
      ...currentCV,
      id: "",
      variantMeta: {
        ...(currentCV.variantMeta ?? {}),
        baseCvId: currentCvIdParam || currentCV.id || undefined,
        variantLabel,
        sourceTemplateId: currentTemplate,
      },
      createdAt: now,
      updatedAt: now,
    }

    setCurrentCV(nextCV)
    loadedCvIdRef.current = null
    setLastSavedFingerprint(fingerprintCV(nextCV))
    setStatusMessage(`Created ${variantLabel} draft`)

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete("id")
    nextParams.set("template", nextCV.templateId)
    router.replace(`/editor?${nextParams.toString()}`)
  }

  async function handleSaveCV() {
    setIsSavingCV(true)
    setStatusMessage("Saving...")

    try {
      const previousSnapshot = currentCV
      const savedCV = await saveCVRecord(currentCV)
      setCurrentCV(savedCV)
      setLastSavedFingerprint(fingerprintCV(savedCV))
      loadedCvIdRef.current = savedCV.id
      setStatusMessage(`Saved ${new Date(savedCV.updatedAt).toLocaleTimeString()}`)

      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.set("id", savedCV.id)
      nextParams.set("template", savedCV.templateId)
      router.replace(`/editor?${nextParams.toString()}`)

      try {
        await createCVVersionSnapshot({
          cvId: savedCV.id,
          cv: savedCV,
          changeSummary: summarizeCVChanges(previousSnapshot, savedCV),
        })
      } catch {
        // Version snapshots are optional during schema rollout.
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? `Save failed: ${error.message}` : "Save failed")
    } finally {
      setIsSavingCV(false)
    }
  }

  const onEditorShortcut = useEffectEvent((event: KeyboardEvent) => {
    const modifier = event.ctrlKey || event.metaKey
    if (!modifier) {
      return
    }

    const target = event.target
    const isEditableTarget =
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable)

    const key = event.key.toLowerCase()
    if (key === "s") {
      event.preventDefault()
      void handleSaveCV()
    }

    if (key === "p") {
      event.preventDefault()
      setShowPreview(true)
    }

    if (key === "z") {
      if (isEditableTarget) {
        return
      }

      event.preventDefault()
      if (event.shiftKey) {
        redo()
      } else {
        undo()
      }
    }
  })

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      onEditorShortcut(event)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isHydrated])

  if (!isHydrated || isLoadingCV) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isLoadingCV ? "Loading CV..." : "Loading editor..."}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">CV Editor</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Fill in your information to create your CV
              </p>
              <p className="text-xs text-muted-foreground mt-1">{statusMessage}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
              <input
                ref={importFileRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportJSON}
                className="hidden"
              />
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveCV}
                disabled={isSavingCV}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                {isSavingCV ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                )}
                <span className="hidden sm:inline">{isSavingCV ? "Saving" : "Save"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Undo2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Undo</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Redo2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Redo</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => importFileRef.current?.click()}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">History</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTargeting(true)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Targeting</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowTemplateSelector(true)} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                <Palette className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Templates</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <PDFDownloadButton size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm" />
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2 min-w-max pb-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                    index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index < currentStep
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <step.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium hidden xs:inline">{step.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 0 && (
              <PersonalInfoForm onNext={handleNext} />
            )}

            {/* Step 2: Summary */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Professional Summary
                  </CardTitle>
                  <CardDescription>
                    Write a brief summary highlighting your key skills and career objectives.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        placeholder="A results-driven professional with experience in..."
                        rows={6}
                        defaultValue={currentCV.summary}
                        onChange={(e) => updateSummary(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        {currentCV.summary.length}/2000 characters
                      </p>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={handlePrevious}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button type="button" onClick={handleNext}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Work Experience */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                  <CardDescription>
                    Add your work history, starting with the most recent position.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.experience.map((exp, index) => (
                    <div key={exp.id} className="relative rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        <RowActionButtons
                          canMoveUp={index > 0}
                          canMoveDown={index < currentCV.experience.length - 1}
                          onMoveUp={() => moveExperience(exp.id, "up")}
                          onMoveDown={() => moveExperience(exp.id, "down")}
                          onDuplicate={() => duplicateExperience(exp.id)}
                          onRemove={() => removeExperience(exp.id)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Company *</Label>
                          <Input
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, { ...exp, company: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Position *</Label>
                          <Input
                            placeholder="Job Title"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, { ...exp, position: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, { ...exp, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            disabled={exp.current}
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, { ...exp, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, { ...exp, current: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`current-${exp.id}`} className="font-normal">
                          I currently work here
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe your responsibilities and achievements..."
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, { ...exp, description: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addExperience} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Education */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                  <CardDescription>
                    Add your educational background.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.education.map((edu, index) => (
                    <div key={edu.id} className="relative rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        <RowActionButtons
                          canMoveUp={index > 0}
                          canMoveDown={index < currentCV.education.length - 1}
                          onMoveUp={() => moveEducation(edu.id, "up")}
                          onMoveDown={() => moveEducation(edu.id, "down")}
                          onDuplicate={() => duplicateEducation(edu.id)}
                          onRemove={() => removeEducation(edu.id)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Institution *</Label>
                          <Input
                            placeholder="University/School Name"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, { ...edu, institution: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Degree *</Label>
                          <Input
                            placeholder="Bachelor of Science"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, { ...edu, degree: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Field of Study *</Label>
                        <Input
                          placeholder="Computer Science"
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, { ...edu, field: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, { ...edu, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            disabled={edu.current}
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, { ...edu, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addEducation} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Skills */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills
                  </CardTitle>
                  <CardDescription>
                    Add your technical and soft skills.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.skills.map((skill, index) => (
                    <div key={skill.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <Input
                        placeholder="Skill name"
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, { ...skill, name: e.target.value })}
                        className="flex-1 w-full"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) =>
                          updateSkill(skill.id, {
                            ...skill,
                            level: e.target.value as SkillLevel,
                          })
                        }
                        className="h-10 px-3 rounded-md border border-input bg-background w-full sm:w-auto"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                      <select
                        value={skill.category}
                        onChange={(e) =>
                          updateSkill(skill.id, {
                            ...skill,
                            category: e.target.value as SkillCategory,
                          })
                        }
                        className="h-10 px-3 rounded-md border border-input bg-background w-full sm:w-auto"
                      >
                        <option value="technical">Technical</option>
                        <option value="soft">Soft</option>
                      </select>
                      <RowActionButtons
                        compact
                        canMoveUp={index > 0}
                        canMoveDown={index < currentCV.skills.length - 1}
                        onMoveUp={() => moveSkill(skill.id, "up")}
                        onMoveDown={() => moveSkill(skill.id, "down")}
                        onDuplicate={() => duplicateSkill(skill.id)}
                        onRemove={() => removeSkill(skill.id)}
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSkill} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Certifications */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                  <CardDescription>
                    Add any professional certifications or licenses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.certifications.map((cert, index) => (
                    <div key={cert.id} className="relative rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Certification {index + 1}</h4>
                        <RowActionButtons
                          canMoveUp={index > 0}
                          canMoveDown={index < currentCV.certifications.length - 1}
                          onMoveUp={() => moveCertification(cert.id, "up")}
                          onMoveDown={() => moveCertification(cert.id, "down")}
                          onDuplicate={() => duplicateCertification(cert.id)}
                          onRemove={() => removeCertification(cert.id)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Certification Name *</Label>
                          <Input
                            placeholder="AWS Solutions Architect"
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, { ...cert, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Issuing Organization *</Label>
                          <Input
                            placeholder="Amazon Web Services"
                            value={cert.issuer}
                            onChange={(e) => updateCertification(cert.id, { ...cert, issuer: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date Obtained</Label>
                          <Input
                            type="month"
                            value={cert.date}
                            onChange={(e) => updateCertification(cert.id, { ...cert, date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Credential ID (optional)</Label>
                          <Input
                            placeholder="ABC123XYZ"
                            value={cert.credentialId || ''}
                            onChange={(e) => updateCertification(cert.id, { ...cert, credentialId: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addCertification} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 7: Languages */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Languages
                  </CardTitle>
                  <CardDescription>
                    List languages you can speak and your proficiency level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.languages.map((lang, index) => (
                    <div key={lang.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <Input
                        placeholder="Language (e.g., English)"
                        value={lang.language}
                        onChange={(e) => updateLanguage(lang.id, { ...lang, language: e.target.value })}
                        className="flex-1 w-full"
                      />
                      <select
                        value={lang.proficiency}
                        onChange={(e) =>
                          updateLanguage(lang.id, {
                            ...lang,
                            proficiency: e.target.value as LanguageProficiency,
                          })
                        }
                        className="h-10 px-3 rounded-md border border-input bg-background w-full sm:w-auto"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                      </select>
                      <RowActionButtons
                        compact
                        canMoveUp={index > 0}
                        canMoveDown={index < currentCV.languages.length - 1}
                        onMoveUp={() => moveLanguage(lang.id, "up")}
                        onMoveDown={() => moveLanguage(lang.id, "down")}
                        onDuplicate={() => duplicateLanguage(lang.id)}
                        onRemove={() => removeLanguage(lang.id)}
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addLanguage} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Language
                  </Button>
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 8: Referees */}
            {currentStep === 7 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Referees
                  </CardTitle>
                  <CardDescription>
                    Add professional references who can vouch for your work.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.referees.map((ref, index) => (
                    <div key={ref.id} className="relative rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Referee {index + 1}</h4>
                        <RowActionButtons
                          canMoveUp={index > 0}
                          canMoveDown={index < currentCV.referees.length - 1}
                          onMoveUp={() => moveReferee(ref.id, "up")}
                          onMoveDown={() => moveReferee(ref.id, "down")}
                          onDuplicate={() => duplicateReferee(ref.id)}
                          onRemove={() => removeReferee(ref.id)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name *</Label>
                          <Input
                            placeholder="Dr. John Smith"
                            value={ref.name}
                            onChange={(e) => updateReferee(ref.id, { ...ref, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Position *</Label>
                          <Input
                            placeholder="Managing Director"
                            value={ref.position}
                            onChange={(e) => updateReferee(ref.id, { ...ref, position: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Company / Organization *</Label>
                        <Input
                          placeholder="ABC Corporation"
                          value={ref.company}
                          onChange={(e) => updateReferee(ref.id, { ...ref, company: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            placeholder="john.smith@company.com"
                            value={ref.email || ''}
                            onChange={(e) => updateReferee(ref.id, { ...ref, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={ref.phone || ''}
                            onChange={(e) => updateReferee(ref.id, { ...ref, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addReferee} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Referee
                  </Button>
                  <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <PDFDownloadButton />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95%] sm:w-full">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">CV Preview</DialogTitle>
            <DialogDescription className="text-sm">
              This is how your CV will look when exported to PDF
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 overflow-x-auto -mx-2 sm:mx-0">
            <CVTemplateRenderer templateId={currentTemplate} cv={currentCV} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95%] sm:w-full">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">Choose a Template</DialogTitle>
            <DialogDescription className="text-sm">
              Select a template for your CV. You can change this anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <TemplateSelector onSelect={() => setShowTemplateSelector(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95%] sm:w-full">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">Version History</DialogTitle>
            <DialogDescription className="text-sm">
              Manual saves create version snapshots when the `cv_versions` table is available.
            </DialogDescription>
          </DialogHeader>
          {!currentCV.id ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              Save this CV first to start recording history snapshots.
            </div>
          ) : isLoadingHistory ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history...
            </div>
          ) : historyEntries.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No version snapshots yet.
            </div>
          ) : (
            <div className="space-y-3">
              {historyEntries.map((entry) => (
                <div key={entry.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">
                    {entry.changeSummary || "Saved changes"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showTargeting} onOpenChange={setShowTargeting}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95%] sm:w-full">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">Job Targeting</DialogTitle>
            <DialogDescription className="text-sm">
              Save a target role/company, paste a job description, extract keywords, and create a tailored variant draft.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Input
                  placeholder="Senior Product Designer"
                  value={currentCV.targeting?.targetRole ?? ""}
                  onChange={(e) => updateTargetingField("targetRole", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Company</Label>
                <Input
                  placeholder="NovaPay"
                  value={currentCV.targeting?.targetCompany ?? ""}
                  onChange={(e) => updateTargetingField("targetCompany", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea
                rows={8}
                placeholder="Paste the job description here..."
                value={currentCV.targeting?.jobDescription ?? ""}
                onChange={(e) => updateTargetingField("jobDescription", e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={handleExtractKeywords}>
                <Sparkles className="h-4 w-4 mr-2" />
                Extract Keywords
              </Button>
              <Button type="button" onClick={handleCreateTailoredVariant}>
                <Target className="h-4 w-4 mr-2" />
                Create Tailored Variant
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Extracted Keywords</Label>
              <div className="min-h-14 rounded-md border bg-muted/30 p-3">
                {(currentCV.targeting?.extractedKeywords?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No keywords extracted yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentCV.targeting?.extractedKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex rounded-full border bg-background px-2 py-1 text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading editor...
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <EditorPageContent />
    </Suspense>
  )
}
