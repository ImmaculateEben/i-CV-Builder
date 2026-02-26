import { cvSchema } from "@/lib/schemas"
import { createEmptyCV, isTemplateId, type CV } from "@/types/cv"
import type { CVImportEnvelope } from "@/types/editor"

export const CV_IMPORT_SCHEMA_VERSION = 1

export function createCVImportEnvelope(cv: CV): CVImportEnvelope {
  return {
    schemaVersion: CV_IMPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    cv,
  }
}

export function stringifyCVImportEnvelope(cv: CV) {
  return JSON.stringify(createCVImportEnvelope(cv), null, 2)
}

export function parseCVImportEnvelope(input: string): CVImportEnvelope {
  const parsed = JSON.parse(input) as Partial<CVImportEnvelope> | CV

  if ("cv" in (parsed as object) && parsed && typeof parsed === "object") {
    const envelope = parsed as Partial<CVImportEnvelope>
    const cvParse = cvSchema.safeParse(envelope.cv)
    if (!cvParse.success) {
      throw new Error("Imported JSON contains an invalid CV payload.")
    }

    return {
      schemaVersion:
        typeof envelope.schemaVersion === "number"
          ? envelope.schemaVersion
          : CV_IMPORT_SCHEMA_VERSION,
      exportedAt:
        typeof envelope.exportedAt === "string"
          ? envelope.exportedAt
          : new Date().toISOString(),
      appVersion:
        typeof envelope.appVersion === "string" ? envelope.appVersion : undefined,
      cv: normalizeCV(cvParse.data as CV),
    }
  }

  const legacyParse = cvSchema.safeParse(parsed)
  if (!legacyParse.success) {
    throw new Error("Imported JSON is not a valid CV export.")
  }

  return {
    schemaVersion: 0,
    exportedAt: new Date().toISOString(),
    cv: normalizeCV(legacyParse.data as CV),
  }
}

function normalizeCV(input: CV): CV {
  const base = createEmptyCV()
  return {
    ...base,
    ...input,
    templateId: isTemplateId(String(input.templateId)) ? input.templateId : base.templateId,
    personalInfo: {
      ...base.personalInfo,
      ...(input.personalInfo ?? {}),
    },
    experience: Array.isArray(input.experience) ? input.experience : base.experience,
    education: Array.isArray(input.education) ? input.education : base.education,
    skills: Array.isArray(input.skills) ? input.skills : base.skills,
    certifications: Array.isArray(input.certifications) ? input.certifications : base.certifications,
    languages: Array.isArray(input.languages) ? input.languages : base.languages,
    referees: Array.isArray(input.referees) ? input.referees : base.referees,
    presentation: {
      ...base.presentation,
      ...(input.presentation ?? {}),
      sectionOrder: Array.isArray(input.presentation?.sectionOrder)
        ? input.presentation.sectionOrder
        : base.presentation?.sectionOrder ?? [],
      hiddenSections: Array.isArray(input.presentation?.hiddenSections)
        ? input.presentation.hiddenSections
        : base.presentation?.hiddenSections ?? [],
      density: input.presentation?.density ?? base.presentation?.density ?? "comfortable",
      fontScale: input.presentation?.fontScale ?? base.presentation?.fontScale ?? "md",
      accentVariant: input.presentation?.accentVariant ?? base.presentation?.accentVariant ?? "",
    },
    targeting: {
      ...base.targeting,
      ...(input.targeting ?? {}),
      extractedKeywords: Array.isArray(input.targeting?.extractedKeywords)
        ? input.targeting.extractedKeywords
        : base.targeting?.extractedKeywords ?? [],
      emphasisSections: Array.isArray(input.targeting?.emphasisSections)
        ? input.targeting.emphasisSections
        : base.targeting?.emphasisSections ?? [],
      targetRole: input.targeting?.targetRole ?? base.targeting?.targetRole ?? "",
      targetCompany: input.targeting?.targetCompany ?? base.targeting?.targetCompany ?? "",
      jobDescription: input.targeting?.jobDescription ?? base.targeting?.jobDescription ?? "",
    },
    variantMeta: {
      ...base.variantMeta,
      ...(input.variantMeta ?? {}),
    },
  }
}

const STOPWORDS = new Set([
  "the",
  "and",
  "with",
  "for",
  "from",
  "that",
  "this",
  "your",
  "you",
  "our",
  "are",
  "will",
  "have",
  "has",
  "into",
  "through",
  "across",
  "using",
  "use",
  "plus",
  "year",
  "years",
  "role",
  "team",
  "teams",
  "work",
  "working",
  "candidate",
  "experience",
  "preferred",
  "required",
  "ability",
])

export function extractJobKeywords(jobDescription: string, max = 20): string[] {
  const tokens = jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9+\-#./\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token))

  const counts = new Map<string, number>()
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1)
  }

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([token]) => token)

  return ranked
}

export function summarizeCVChanges(previous: CV, next: CV): string {
  const changes: string[] = []

  if (previous.summary !== next.summary) changes.push("summary")
  if (previous.templateId !== next.templateId) changes.push("template")
  if (previous.experience.length !== next.experience.length) changes.push("experience count")
  if (previous.education.length !== next.education.length) changes.push("education count")
  if (previous.skills.length !== next.skills.length) changes.push("skills count")
  if (previous.certifications.length !== next.certifications.length) changes.push("certifications count")
  if (previous.languages.length !== next.languages.length) changes.push("languages count")
  if (previous.referees.length !== next.referees.length) changes.push("referees count")

  const prevName = `${previous.personalInfo.firstName} ${previous.personalInfo.lastName}`.trim()
  const nextName = `${next.personalInfo.firstName} ${next.personalInfo.lastName}`.trim()
  if (prevName !== nextName) changes.push("name")

  return changes.length > 0 ? `Updated ${changes.join(", ")}` : "Saved changes"
}

export function buildDraftStorageKey(cvId?: string | null) {
  return `cv-builder:draft:${cvId?.trim() || "new"}`
}
