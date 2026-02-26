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
  Copy, ChevronUp, ChevronDown, Undo2, Redo2, SlidersHorizontal
} from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import type { CV, SectionKey, TemplateId } from "@/types/cv"
import { isTemplateId, sectionKeys } from "@/types/cv"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/lib/use-hydrated"
import {
  createCVVersionSnapshot,
  getCVById,
  getCVVersionSnapshot,
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
import type { CVImportEnvelope, EditorHistoryEntry } from "@/types/editor"

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

const sectionLabels: Record<SectionKey, string> = {
  personal: "Header / Personal Info",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
  referees: "Referees",
}

const AUTO_SAVE_DEBOUNCE_MS = 2200
const AUTO_SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000

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

const hasMeaningfulCVData = (cv: CV) =>
  Boolean(
    cv.summary.trim() ||
      cv.experience.length > 0 ||
      cv.education.length > 0 ||
      cv.skills.length > 0 ||
      cv.certifications.length > 0 ||
      cv.languages.length > 0 ||
      cv.referees.length > 0 ||
      cv.personalInfo.firstName.trim() ||
      cv.personalInfo.lastName.trim()
  )

const buildKeywordCorpus = (cv: CV) =>
  [
    cv.summary,
    cv.personalInfo.firstName,
    cv.personalInfo.lastName,
    cv.personalInfo.address,
    ...cv.experience.flatMap((exp) => [exp.position, exp.company, exp.description]),
    ...cv.education.flatMap((edu) => [edu.institution, edu.degree, edu.field]),
    ...cv.skills.map((skill) => skill.name),
    ...cv.certifications.flatMap((cert) => [cert.name, cert.issuer]),
    ...cv.languages.map((lang) => lang.language),
  ]
    .join(" \n")
    .toLowerCase()

const generateClientId = () => Math.random().toString(36).slice(2, 11)

type StepCompletionStatus = "empty" | "partial" | "complete"
type EditorStatusTone = "neutral" | "info" | "success" | "warning" | "error"

const hasText = (value: string) => value.trim().length > 0

function getStepCompletionStatus(cv: CV, stepId: string): StepCompletionStatus {
  switch (stepId) {
    case "personal": {
      const fields = [
        cv.personalInfo.firstName,
        cv.personalInfo.lastName,
        cv.personalInfo.email,
        cv.personalInfo.phone,
      ]
      const filled = fields.filter(hasText).length
      if (filled === 0) return "empty"
      return filled === fields.length ? "complete" : "partial"
    }
    case "summary":
      return hasText(cv.summary) ? "complete" : "empty"
    case "experience": {
      const filledRows = cv.experience.filter((row) =>
        [row.company, row.position, row.description].some(hasText)
      )
      if (filledRows.length === 0) return "empty"
      const completeRows = filledRows.filter((row) => hasText(row.company) && hasText(row.position))
      return completeRows.length === filledRows.length ? "complete" : "partial"
    }
    case "education": {
      const filledRows = cv.education.filter((row) =>
        [row.institution, row.degree, row.field].some(hasText)
      )
      if (filledRows.length === 0) return "empty"
      const completeRows = filledRows.filter((row) => hasText(row.institution) && hasText(row.degree))
      return completeRows.length === filledRows.length ? "complete" : "partial"
    }
    case "skills": {
      if (cv.skills.length === 0) return "empty"
      const namedSkills = cv.skills.filter((row) => hasText(row.name))
      if (namedSkills.length === 0) return "partial"
      return namedSkills.length === cv.skills.length ? "complete" : "partial"
    }
    case "certifications": {
      if (cv.certifications.length === 0) return "empty"
      const filledRows = cv.certifications.filter((row) => [row.name, row.issuer].some(hasText))
      if (filledRows.length === 0) return "partial"
      const completeRows = filledRows.filter((row) => hasText(row.name) && hasText(row.issuer))
      return completeRows.length === filledRows.length ? "complete" : "partial"
    }
    case "languages": {
      if (cv.languages.length === 0) return "empty"
      const named = cv.languages.filter((row) => hasText(row.language))
      if (named.length === 0) return "partial"
      return named.length === cv.languages.length ? "complete" : "partial"
    }
    case "referees": {
      if (cv.referees.length === 0) return "empty"
      const filledRows = cv.referees.filter((row) => [row.name, row.position, row.company].some(hasText))
      if (filledRows.length === 0) return "partial"
      const completeRows = filledRows.filter(
        (row) => hasText(row.name) && hasText(row.position) && hasText(row.company)
      )
      return completeRows.length === filledRows.length ? "complete" : "partial"
    }
    default:
      return "empty"
  }
}

function getEditorStatusTone(statusMessage: string): EditorStatusTone {
  const message = statusMessage.toLowerCase()
  if (message.includes("failed") || message.includes("error")) return "error"
  if (message.includes("unsaved")) return "warning"
  if (message.includes("saving") || message.includes("loading")) return "info"
  if (
    message.includes("saved") ||
    message.includes("autosaved") ||
    message.includes("checkpoint created") ||
    message.includes("loaded")
  ) {
    return "success"
  }
  return "neutral"
}

type HistoryCompareRow = {
  label: string
  previous: string
  current: string
  changed: boolean
}

const listValue = (items: string[]) => items.filter(Boolean).join(", ") || "None"

function buildHistoryCompareRows(previous: CV, current: CV): HistoryCompareRow[] {
  const prevName =
    [previous.personalInfo.firstName, previous.personalInfo.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ") || "Untitled CV"
  const currentName =
    [current.personalInfo.firstName, current.personalInfo.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ") || "Untitled CV"

  const prevPresentation = previous.presentation
  const currentPresentation = current.presentation

  const rows: HistoryCompareRow[] = [
    { label: "Name", previous: prevName, current: currentName, changed: prevName !== currentName },
    {
      label: "Template",
      previous: previous.templateId,
      current: current.templateId,
      changed: previous.templateId !== current.templateId,
    },
    {
      label: "Summary Length",
      previous: `${previous.summary.trim().length} chars`,
      current: `${current.summary.trim().length} chars`,
      changed: previous.summary.trim() !== current.summary.trim(),
    },
    {
      label: "Experience",
      previous: String(previous.experience.length),
      current: String(current.experience.length),
      changed: previous.experience.length !== current.experience.length,
    },
    {
      label: "Education",
      previous: String(previous.education.length),
      current: String(current.education.length),
      changed: previous.education.length !== current.education.length,
    },
    {
      label: "Skills",
      previous: String(previous.skills.length),
      current: String(current.skills.length),
      changed: previous.skills.length !== current.skills.length,
    },
    {
      label: "Certifications",
      previous: String(previous.certifications.length),
      current: String(current.certifications.length),
      changed: previous.certifications.length !== current.certifications.length,
    },
    {
      label: "Languages",
      previous: String(previous.languages.length),
      current: String(current.languages.length),
      changed: previous.languages.length !== current.languages.length,
    },
    {
      label: "Referees",
      previous: String(previous.referees.length),
      current: String(current.referees.length),
      changed: previous.referees.length !== current.referees.length,
    },
    {
      label: "Hidden Sections",
      previous: listValue((prevPresentation?.hiddenSections ?? []).map((key) => sectionLabels[key])),
      current: listValue((currentPresentation?.hiddenSections ?? []).map((key) => sectionLabels[key])),
      changed:
        JSON.stringify(prevPresentation?.hiddenSections ?? []) !==
        JSON.stringify(currentPresentation?.hiddenSections ?? []),
    },
    {
      label: "PDF Density / Scale",
      previous: `${prevPresentation?.density ?? "comfortable"} / ${prevPresentation?.fontScale ?? "md"}`,
      current: `${currentPresentation?.density ?? "comfortable"} / ${currentPresentation?.fontScale ?? "md"}`,
      changed:
        (prevPresentation?.density ?? "comfortable") !==
          (currentPresentation?.density ?? "comfortable") ||
        (prevPresentation?.fontScale ?? "md") !== (currentPresentation?.fontScale ?? "md"),
    },
  ]

  return rows
}

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
  const [templateSelectorMode, setTemplateSelectorMode] = useState<"apply" | "clone">("apply")
  const [showHistory, setShowHistory] = useState(false)
  const [showTargeting, setShowTargeting] = useState(false)
  const [showImportPreview, setShowImportPreview] = useState(false)
  const [showLayoutStyle, setShowLayoutStyle] = useState(false)
  const [isLoadingCV, setIsLoadingCV] = useState(false)
  const [isSavingCV, setIsSavingCV] = useState(false)
  const [isAutoSavingCV, setIsAutoSavingCV] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingHistorySnapshot, setIsLoadingHistorySnapshot] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Draft (not saved)")
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState<string | null>(null)
  const loadedCvIdRef = useRef<string | null>(null)
  const hasPromptedDraftRef = useRef<string | null>(null)
  const importFileRef = useRef<HTMLInputElement | null>(null)
  const [historyEntries, setHistoryEntries] = useState<EditorHistoryEntry[]>([])
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<EditorHistoryEntry | null>(null)
  const [selectedHistorySnapshot, setSelectedHistorySnapshot] = useState<CV | null>(null)
  const [pendingImportEnvelope, setPendingImportEnvelope] = useState<CVImportEnvelope | null>(null)
  const [pendingImportFileName, setPendingImportFileName] = useState<string>("")
  const historySnapshotCacheRef = useRef<Record<string, CV>>({})
  const lastAutoSnapshotAtRef = useRef<number>(0)
  const lastAutoSnapshotFingerprintRef = useRef<string | null>(null)
  const { currentCV, currentTemplate, canUndo, canRedo, undo, redo, setCurrentCV, setTemplate, updateSummary, addExperience, updateExperience, removeExperience, duplicateExperience, moveExperience,
    addEducation, updateEducation, removeEducation, duplicateEducation, moveEducation,
    addSkill, updateSkill, removeSkill, duplicateSkill, moveSkill,
    addCertification, updateCertification, removeCertification, duplicateCertification, moveCertification,
    addLanguage, updateLanguage, removeLanguage, duplicateLanguage, moveLanguage,
    addReferee, updateReferee, removeReferee, duplicateReferee, moveReferee,
    updateTargeting, updatePresentation, moveSectionOrder, toggleSectionVisibility,
  } = useCVStore()

  const currentCvIdParam = searchParams.get("id")?.trim() ?? ""
  const draftStorageKey = buildDraftStorageKey(currentCvIdParam || currentCV.id)

  const markVersionSnapshot = (cv: CV) => {
    lastAutoSnapshotAtRef.current = Date.now()
    lastAutoSnapshotFingerprintRef.current = fingerprintCV(cv)
  }

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
        markVersionSnapshot(nextCV)
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
        markVersionSnapshot(parsedDraft.cv)
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

        if (!isSavingCV && !isAutoSavingCV && statusMessage !== "Unsaved changes") {
          setStatusMessage((prev) => (prev.startsWith("Saved ") ? prev : "Draft saved locally"))
        }
      } catch {
        // Ignore storage quota errors.
      }
    }, 800)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [currentCV, draftStorageKey, isHydrated, isLoadingCV, isSavingCV, isAutoSavingCV, statusMessage])

  useEffect(() => {
    if (!isHydrated || isLoadingCV || isSavingCV || isAutoSavingCV) {
      return
    }

    if (!lastSavedFingerprint) {
      return
    }

    const changed = fingerprintCV(currentCV) !== lastSavedFingerprint
    if (changed) {
      setStatusMessage("Unsaved changes")
    }
  }, [currentCV, isHydrated, isLoadingCV, isSavingCV, isAutoSavingCV, lastSavedFingerprint])

  useEffect(() => {
    if (!isHydrated || isLoadingCV || isSavingCV) {
      return
    }

    const existingId = currentCvIdParam || currentCV.id
    if (!existingId || !lastSavedFingerprint) {
      return
    }

    const nextFingerprint = fingerprintCV(currentCV)
    if (nextFingerprint === lastSavedFingerprint) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsAutoSavingCV(true)
        setStatusMessage("Autosaving...")

        try {
          const autoSavedCV = await saveCVRecord({
            ...currentCV,
            id: existingId,
          })
          setLastSavedFingerprint(nextFingerprint)
          setStatusMessage(`Autosaved ${new Date().toLocaleTimeString()}`)

          const enoughTimePassed =
            Date.now() - lastAutoSnapshotAtRef.current >= AUTO_SNAPSHOT_INTERVAL_MS
          const isNewSnapshotContent =
            lastAutoSnapshotFingerprintRef.current !== nextFingerprint

          if (enoughTimePassed && isNewSnapshotContent) {
            try {
              await createCVVersionSnapshot({
                cvId: existingId,
                cv: autoSavedCV,
                changeSummary: "Autosave snapshot",
              })
              markVersionSnapshot(autoSavedCV)

              if (showHistory && currentCV.id === existingId) {
                const entries = await listCVVersions(existingId)
                setHistoryEntries(entries)
              }
            } catch {
              // Optional during rollout.
            }
          }
        } catch {
          setStatusMessage("Auto-save failed")
        } finally {
          setIsAutoSavingCV(false)
        }
      })()
    }, AUTO_SAVE_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    currentCV,
    currentCvIdParam,
    isHydrated,
    isLoadingCV,
    isSavingCV,
    lastSavedFingerprint,
    showHistory,
  ])

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

  useEffect(() => {
    if (!showHistory) {
      setSelectedHistoryEntry(null)
      setSelectedHistorySnapshot(null)
      setIsLoadingHistorySnapshot(false)
    }
  }, [showHistory])

  const loadHistorySnapshotById = async (versionId: string) => {
    const cached = historySnapshotCacheRef.current[versionId]
    if (cached) {
      return cached
    }

    const snapshot = await getCVVersionSnapshot(versionId)
    if (snapshot) {
      historySnapshotCacheRef.current[versionId] = snapshot
    }
    return snapshot
  }

  const handleCompareHistoryEntry = async (entry: EditorHistoryEntry) => {
    setSelectedHistoryEntry(entry)
    setSelectedHistorySnapshot(null)
    setIsLoadingHistorySnapshot(true)

    try {
      const snapshot = await loadHistorySnapshotById(entry.id)
      setSelectedHistorySnapshot(snapshot)
      setStatusMessage(snapshot ? "Loaded version snapshot" : "Version snapshot unavailable")
    } catch (error) {
      setSelectedHistorySnapshot(null)
      setStatusMessage(
        error instanceof Error ? `History load failed: ${error.message}` : "History load failed"
      )
    } finally {
      setIsLoadingHistorySnapshot(false)
    }
  }

  const handleRestoreHistoryEntry = async (entry: EditorHistoryEntry) => {
    setIsLoadingHistorySnapshot(true)

    try {
      const snapshot = await loadHistorySnapshotById(entry.id)
      if (!snapshot) {
        setStatusMessage("Selected version snapshot is unavailable")
        return
      }

      const confirmed = window.confirm(
        "Restore this version into the current draft? This will replace unsaved changes in the editor."
      )
      if (!confirmed) {
        return
      }

      const restoredCV: CV = {
        ...snapshot,
        id: currentCV.id || snapshot.id,
        createdAt: snapshot.createdAt || currentCV.createdAt,
        updatedAt: new Date().toISOString(),
      }

      setCurrentCV(restoredCV)
      setStatusMessage("Version restored to draft (save to persist)")

      const nextParams = new URLSearchParams(searchParams.toString())
      if (restoredCV.id) {
        nextParams.set("id", restoredCV.id)
      }
      nextParams.set("template", restoredCV.templateId)
      router.replace(`/editor?${nextParams.toString()}`)
      setShowHistory(false)
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? `Restore failed: ${error.message}` : "Restore failed"
      )
    } finally {
      setIsLoadingHistorySnapshot(false)
    }
  }

  const handleCreateCheckpoint = async () => {
    if (!currentCV.id) {
      setStatusMessage("Save this CV before creating a checkpoint")
      return
    }

    setStatusMessage("Creating checkpoint...")
    try {
      await createCVVersionSnapshot({
        cvId: currentCV.id,
        cv: currentCV,
        changeSummary: "Manual checkpoint",
      })
      markVersionSnapshot(currentCV)

      setStatusMessage("Checkpoint created")
      if (showHistory) {
        const entries = await listCVVersions(currentCV.id)
        setHistoryEntries(entries)
      }
    } catch {
      setStatusMessage("Checkpoint failed")
    }
  }

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

  const applyImportedCV = (envelope: CVImportEnvelope, mode: "replace" | "new") => {
    const now = new Date().toISOString()
    const keepCurrentId = mode === "replace" ? currentCvIdParam || currentCV.id || "" : ""
    const nextCV: CV = {
      ...envelope.cv,
      id: keepCurrentId,
      updatedAt: now,
      createdAt:
        mode === "replace"
          ? currentCV.createdAt || envelope.cv.createdAt || now
          : envelope.cv.createdAt || now,
    }

    setCurrentCV(nextCV)
    loadedCvIdRef.current = keepCurrentId || null
    setLastSavedFingerprint(mode === "replace" ? null : fingerprintCV(nextCV))

    const nextParams = new URLSearchParams(searchParams.toString())
    if (keepCurrentId) {
      nextParams.set("id", keepCurrentId)
    } else {
      nextParams.delete("id")
    }
    nextParams.set("template", nextCV.templateId)
    router.replace(`/editor?${nextParams.toString()}`)

    setStatusMessage(
      mode === "replace"
        ? "Imported JSON and replaced current draft (save to persist)"
        : "Imported JSON as a new draft"
    )
    setShowImportPreview(false)
    setPendingImportEnvelope(null)
    setPendingImportFileName("")
  }

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const content = await file.text()
      const imported = parseCVImportEnvelope(content)
      setPendingImportEnvelope(imported)
      setPendingImportFileName(file.name)
      setShowImportPreview(true)
      setStatusMessage("Import ready for review")
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

  const handleCopyKeywords = async (keywords: string[]) => {
    if (keywords.length === 0) {
      setStatusMessage("No keywords to copy")
      return
    }

    const text = keywords.join(", ")
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setStatusMessage("Copied keywords to clipboard")
        return
      }
    } catch {
      // Fall back below.
    }

    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.setAttribute("readonly", "")
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setStatusMessage("Copied keywords to clipboard")
    } catch {
      setStatusMessage("Copy failed")
    }
  }

  const handleAppendMissingKeywordsToSummary = (keywords: string[]) => {
    if (keywords.length === 0) {
      setStatusMessage("No missing keywords to append")
      return
    }

    const existing = currentCV.summary.trim()
    const suffix = keywords.join(", ")
    const nextSummary = existing
      ? `${existing}\n\nKeywords: ${suffix}`
      : `Keywords: ${suffix}`

    updateSummary(nextSummary)
    setStatusMessage("Appended missing keywords to summary")
  }

  const handleAddMissingKeywordsAsSkills = (keywords: string[]) => {
    if (keywords.length === 0) {
      setStatusMessage("No missing keywords to add")
      return
    }

    const confirmed = window.confirm(
      `Add ${keywords.length} missing keyword${keywords.length === 1 ? "" : "s"} as technical skills?`
    )
    if (!confirmed) {
      return
    }

    const existingNames = new Set(
      currentCV.skills.map((skill) => skill.name.trim().toLowerCase()).filter(Boolean)
    )
    const additions = keywords
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .filter((keyword) => !existingNames.has(keyword.toLowerCase()))
      .map((keyword) => ({
        id: generateClientId(),
        name: keyword,
        level: "intermediate" as SkillLevel,
        category: "technical" as SkillCategory,
      }))

    if (additions.length === 0) {
      setStatusMessage("All missing keywords are already in skills")
      return
    }

    setCurrentCV({
      ...currentCV,
      skills: [...currentCV.skills, ...additions],
      updatedAt: new Date().toISOString(),
    })
    setStatusMessage(`Added ${additions.length} keyword${additions.length === 1 ? "" : "s"} to skills`)
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

  const cloneDraftAsNew = (templateId: TemplateId, modeLabel: "duplicate" | "template") => {
    const now = new Date().toISOString()
    const baseCvId = currentCvIdParam || currentCV.id || currentCV.variantMeta?.baseCvId
    const nextCV: CV = {
      ...currentCV,
      id: "",
      templateId,
      variantMeta: {
        ...(currentCV.variantMeta ?? {}),
        baseCvId: baseCvId || undefined,
        sourceTemplateId: currentTemplate,
      },
      createdAt: now,
      updatedAt: now,
    }

    setCurrentCV(nextCV)
    loadedCvIdRef.current = null
    setLastSavedFingerprint(fingerprintCV(nextCV))

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete("id")
    nextParams.set("template", templateId)
    router.replace(`/editor?${nextParams.toString()}`)

    setStatusMessage(
      modeLabel === "duplicate"
        ? "Duplicated current draft as a new draft"
        : `Cloned current draft into ${templateId} template`
    )
  }

  const handleDuplicateDraft = () => {
    cloneDraftAsNew(currentTemplate, "duplicate")
  }

  const handleCloneAsNewTemplate = (templateId: TemplateId) => {
    cloneDraftAsNew(templateId, "template")
    setShowTemplateSelector(false)
    setTemplateSelectorMode("apply")
  }

  const openTemplateDialog = (mode: "apply" | "clone") => {
    setTemplateSelectorMode(mode)
    setShowTemplateSelector(true)
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
        markVersionSnapshot(savedCV)
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

  const extractedKeywords = currentCV.targeting?.extractedKeywords ?? []
  const keywordCorpus = buildKeywordCorpus(currentCV)
  const presentKeywords = extractedKeywords.filter((keyword) =>
    keywordCorpus.includes(keyword.toLowerCase())
  )
  const missingKeywords = extractedKeywords.filter(
    (keyword) => !keywordCorpus.includes(keyword.toLowerCase())
  )
  const importPreviewCV = pendingImportEnvelope?.cv ?? null
  const hasCurrentDraftContent = hasMeaningfulCVData(currentCV)
  const importWillOverwriteExisting = hasCurrentDraftContent
  const canReplaceCurrentDraft = Boolean(importPreviewCV)
  const presentation = currentCV.presentation ?? {
    sectionOrder: [...sectionKeys],
    hiddenSections: [],
    density: "comfortable" as const,
    fontScale: "md" as const,
    accentVariant: "",
  }
  const hiddenSectionSet = new Set<SectionKey>(presentation.hiddenSections)
  const stepStatuses = steps.map((step) => ({
    id: step.id,
    status: getStepCompletionStatus(currentCV, step.id),
  }))
  const completedSteps = stepStatuses.filter((item) => item.status === "complete").length
  const startedSteps = stepStatuses.filter((item) => item.status !== "empty").length
  const editorStatusTone = getEditorStatusTone(statusMessage)
  const statusPillClass = cn(
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
    editorStatusTone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
    editorStatusTone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
    editorStatusTone === "error" && "border-red-200 bg-red-50 text-red-700",
    editorStatusTone === "info" && "border-blue-200 bg-blue-50 text-blue-700",
    editorStatusTone === "neutral" && "border-slate-200 bg-slate-50 text-slate-700"
  )
  const historyCompareRows = selectedHistorySnapshot
    ? buildHistoryCompareRows(selectedHistorySnapshot, currentCV)
    : []
  const changedHistoryCompareRows = historyCompareRows.filter((row) => row.changed)

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
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={statusPillClass}>
                  {(isSavingCV || isAutoSavingCV) && <Loader2 className="h-3 w-3 animate-spin" />}
                  {isSavingCV ? "Saving" : isAutoSavingCV ? "Autosaving" : "Status"}
                </span>
                <p className="text-xs text-muted-foreground">{statusMessage}</p>
              </div>
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
                onClick={handleDuplicateDraft}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Duplicate</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateCheckpoint}
                disabled={!currentCV.id}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Checkpoint</span>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLayoutStyle(true)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Layout</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openTemplateDialog("clone")}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Clone Template</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => openTemplateDialog("apply")} className="flex-1 sm:flex-initial text-xs sm:text-sm">
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
            <div className="mb-2 text-xs text-muted-foreground">
              Section progress: {completedSteps}/{steps.length} complete, {startedSteps}/{steps.length} started
            </div>
            <div className="flex items-center gap-1 sm:gap-2 min-w-max pb-2">
              {steps.map((step, index) => (
                (() => {
                  const stepStatus = stepStatuses.find((item) => item.id === step.id)?.status ?? "empty"
                  const statusDotClass =
                    stepStatus === "complete"
                      ? "bg-emerald-500"
                      : stepStatus === "partial"
                        ? "bg-amber-500"
                        : "bg-slate-300"

                  return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  title={`${step.label}: ${stepStatus}`}
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
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block h-1.5 w-1.5 rounded-full",
                      index === currentStep && stepStatus === "empty"
                        ? "bg-primary-foreground/70"
                        : index === currentStep && stepStatus !== "empty"
                          ? "bg-primary-foreground"
                          : statusDotClass
                    )}
                  />
                  <span className="text-xs sm:text-sm font-medium hidden xs:inline">{step.label}</span>
                </button>
                  )
                })()
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

      <Dialog open={showLayoutStyle} onOpenChange={setShowLayoutStyle}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95%] sm:w-full">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">Layout & Style</DialogTitle>
            <DialogDescription className="text-sm">
              Control section visibility/order and PDF density/font size. Hidden sections also affect the HTML preview.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="density">Density (PDF)</Label>
                <select
                  id="density"
                  value={presentation.density}
                  onChange={(e) =>
                    updatePresentation({
                      density:
                        e.target.value === "compact" ? "compact" : "comfortable",
                    })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontScale">Font Scale (PDF)</Label>
                <select
                  id="fontScale"
                  value={presentation.fontScale}
                  onChange={(e) =>
                    updatePresentation({
                      fontScale:
                        e.target.value === "sm"
                          ? "sm"
                          : e.target.value === "lg"
                            ? "lg"
                            : "md",
                    })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentVariant">Accent Variant (template-specific token)</Label>
              <Input
                id="accentVariant"
                placeholder="Optional token (future template variants)"
                value={presentation.accentVariant ?? ""}
                onChange={(e) => updatePresentation({ accentVariant: e.target.value })}
              />
            </div>

            <div className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium">Section Visibility</h4>
                  <p className="text-xs text-muted-foreground">
                    Toggle sections on/off. Hiding `Header / Personal Info` removes the PDF header block.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => updatePresentation({ hiddenSections: [] })}
                >
                  Show All
                </Button>
              </div>
              <div className="space-y-2">
                {sectionKeys.map((key) => {
                  const hidden = hiddenSectionSet.has(key)
                  return (
                    <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="text-sm">{sectionLabels[key]}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant={hidden ? "outline" : "default"}
                        onClick={() => toggleSectionVisibility(key)}
                      >
                        {hidden ? "Show" : "Hide"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium">Section Order</h4>
                  <p className="text-xs text-muted-foreground">
                    Section order is applied to PDF output. Split templates keep main/side columns but respect order within each column group.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updatePresentation({
                      sectionOrder: [...sectionKeys],
                    })
                  }
                >
                  Reset Order
                </Button>
              </div>
              <div className="space-y-2">
                {presentation.sectionOrder.map((key, index) => (
                  <div key={`${key}-${index}`} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <p className="text-sm">{sectionLabels[key]}</p>
                      <p className="text-xs text-muted-foreground">
                        {key === "personal" ? "PDF header block (stays visually at top when visible)" : "Content section"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        onClick={() => moveSectionOrder(key, "up")}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === presentation.sectionOrder.length - 1}
                        onClick={() => moveSectionOrder(key, "down")}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selector Dialog */}
      <Dialog
        open={showTemplateSelector}
        onOpenChange={(open) => {
          setShowTemplateSelector(open)
          if (!open) {
            setTemplateSelectorMode("apply")
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95%] sm:w-full">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">
              {templateSelectorMode === "clone" ? "Clone as New Template" : "Choose a Template"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {templateSelectorMode === "clone"
                ? "Pick a template to create a new draft clone with the same content."
                : "Select a template for your CV. You can change this anytime."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <TemplateSelector
              mode={templateSelectorMode}
              onSelect={(templateId) => {
                if (templateSelectorMode === "clone") {
                  handleCloneAsNewTemplate(templateId)
                  return
                }
                setShowTemplateSelector(false)
              }}
            />
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
            <div className="space-y-4">
              {selectedHistoryEntry && (
                <div className="rounded-md border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Compare Snapshot</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedHistoryEntry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedHistoryEntry(null)
                        setSelectedHistorySnapshot(null)
                      }}
                    >
                      Clear
                    </Button>
                  </div>

                  {isLoadingHistorySnapshot ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading snapshot...
                    </div>
                  ) : !selectedHistorySnapshot ? (
                    <div className="rounded-md border p-3 text-sm text-muted-foreground">
                      Snapshot data is unavailable for this version.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-md border p-3">
                          <p className="text-xs text-muted-foreground mb-1">Current Draft</p>
                          <p className="font-medium">
                            {[currentCV.personalInfo.firstName, currentCV.personalInfo.lastName]
                              .map((part) => part.trim())
                              .filter(Boolean)
                              .join(" ") || "Untitled CV"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Template: {currentCV.templateId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Exp/Edu/Skills: {currentCV.experience.length}/{currentCV.education.length}/
                            {currentCV.skills.length}
                          </p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-xs text-muted-foreground mb-1">Selected Version</p>
                          <p className="font-medium">
                            {[selectedHistorySnapshot.personalInfo.firstName, selectedHistorySnapshot.personalInfo.lastName]
                              .map((part) => part.trim())
                              .filter(Boolean)
                              .join(" ") || "Untitled CV"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Template: {selectedHistorySnapshot.templateId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Exp/Edu/Skills: {selectedHistorySnapshot.experience.length}/
                            {selectedHistorySnapshot.education.length}/{selectedHistorySnapshot.skills.length}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-md border p-3 text-sm">
                        <p className="font-medium">Detected changes</p>
                        <p className="text-muted-foreground mt-1">
                          {summarizeCVChanges(selectedHistorySnapshot, currentCV)}
                        </p>
                        {historyCompareRows.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded-full border bg-background px-2 py-0.5">
                                {changedHistoryCompareRows.length} changed field
                                {changedHistoryCompareRows.length === 1 ? "" : "s"}
                              </span>
                              <span className="rounded-full border bg-background px-2 py-0.5">
                                {historyCompareRows.length - changedHistoryCompareRows.length} unchanged
                              </span>
                            </div>
                            <div className="space-y-1">
                              {historyCompareRows.map((row) => (
                                <div
                                  key={row.label}
                                  className={cn(
                                    "rounded-md border px-2 py-2 text-xs",
                                    row.changed
                                      ? "border-amber-200 bg-amber-50/70"
                                      : "border-slate-200 bg-slate-50/60"
                                  )}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-medium">{row.label}</span>
                                    <span
                                      className={cn(
                                        "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                                        row.changed
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-slate-200 text-slate-700"
                                      )}
                                    >
                                      {row.changed ? "Changed" : "Same"}
                                    </span>
                                  </div>
                                  <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                                    <div>
                                      <p className="text-[10px] text-muted-foreground">Snapshot</p>
                                      <p className="break-words">{row.previous}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-muted-foreground">Current</p>
                                      <p className="break-words">{row.current}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          onClick={() => void handleRestoreHistoryEntry(selectedHistoryEntry)}
                          disabled={isLoadingHistorySnapshot}
                        >
                          Restore to Draft
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleCompareHistoryEntry(selectedHistoryEntry)}
                          disabled={isLoadingHistorySnapshot}
                        >
                          Reload Snapshot
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {historyEntries.map((entry) => (
                  <div key={entry.id} className="rounded-md border p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {entry.changeSummary || "Saved changes"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleCompareHistoryEntry(entry)}
                        >
                          Compare
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void handleRestoreHistoryEntry(entry)}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showImportPreview}
        onOpenChange={(open) => {
          setShowImportPreview(open)
          if (!open) {
            setPendingImportEnvelope(null)
            setPendingImportFileName("")
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95%] sm:w-full">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg sm:text-xl">Review Import</DialogTitle>
            <DialogDescription className="text-sm">
              Confirm how you want to apply this JSON import before changing your current draft.
            </DialogDescription>
          </DialogHeader>

          {!importPreviewCV ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No import payload loaded.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border p-4 space-y-2">
                <p className="text-sm font-medium">
                  {pendingImportFileName || "Imported JSON"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {[importPreviewCV.personalInfo.firstName, importPreviewCV.personalInfo.lastName]
                        .map((part) => part.trim())
                        .filter(Boolean)
                        .join(" ") || "Untitled CV"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Template</p>
                    <p className="font-medium capitalize">{importPreviewCV.templateId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Summary Length</p>
                    <p>{importPreviewCV.summary.trim().length} chars</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sections</p>
                    <p>
                      Exp {importPreviewCV.experience.length} • Edu {importPreviewCV.education.length} • Skills{" "}
                      {importPreviewCV.skills.length}
                    </p>
                  </div>
                </div>
                {importWillOverwriteExisting && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Replacing the current draft will overwrite the editor content currently loaded. Save/export first if you want a backup.
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  onClick={() => pendingImportEnvelope && applyImportedCV(pendingImportEnvelope, "new")}
                >
                  Import as New Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canReplaceCurrentDraft}
                  onClick={() => pendingImportEnvelope && applyImportedCV(pendingImportEnvelope, "replace")}
                >
                  Replace Current Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowImportPreview(false)
                    setPendingImportEnvelope(null)
                    setPendingImportFileName("")
                    setStatusMessage("Import cancelled")
                  }}
                >
                  Cancel
                </Button>
              </div>

              {!importWillOverwriteExisting && (
                <p className="text-xs text-muted-foreground">
                  Replacing is safest when you intend to overwrite the current editor content. Use `Import as New Draft` to avoid replacing this draft.
                </p>
              )}
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
                {extractedKeywords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No keywords extracted yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">Coverage:</span>
                      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                        Present {presentKeywords.length}
                      </span>
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                        Missing {missingKeywords.length}
                      </span>
                    </div>

                    {presentKeywords.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Present in CV content</p>
                        <div className="flex flex-wrap gap-2">
                          {presentKeywords.map((keyword) => (
                            <span
                              key={`present-${keyword}`}
                              className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {missingKeywords.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Missing from CV content</p>
                        <div className="flex flex-wrap gap-2">
                          {missingKeywords.map((keyword) => (
                            <span
                              key={`missing-${keyword}`}
                              className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {extractedKeywords.length > 0 && (
              <div className="space-y-2">
                <Label>Keyword Actions</Label>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleCopyKeywords(extractedKeywords)}
                  >
                    Copy All Keywords
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleCopyKeywords(missingKeywords)}
                    disabled={missingKeywords.length === 0}
                  >
                    Copy Missing Keywords
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAppendMissingKeywordsToSummary(missingKeywords)}
                    disabled={missingKeywords.length === 0}
                  >
                    Append Missing to Summary
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddMissingKeywordsAsSkills(missingKeywords)}
                    disabled={missingKeywords.length === 0}
                  >
                    Add Missing as Skills
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Coverage is a best-effort text match across summary, experience, education, skills, certifications, and languages.
                </p>
              </div>
            )}
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
