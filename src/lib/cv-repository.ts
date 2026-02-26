import { createClient } from "@/lib/supabase"
import type { CV } from "@/types/cv"
import { createEmptyCV, isTemplateId } from "@/types/cv"

type CVRow = {
  id: string
  user_id?: string
  template_id?: string | null
  title?: string | null
  cv_data?: unknown
  created_at: string
  updated_at: string
}

type VersionRow = {
  id: string
  user_id?: string
  cv_id: string
  created_at: string
  change_summary?: string | null
  cv_snapshot?: unknown
}

export interface CVListItem {
  id: string
  templateId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface EditorHistoryEntry {
  id: string
  cvId: string
  createdAt: string
  changeSummary?: string
}

function mergeCVFromRow(row: CVRow): CV {
  const base = createEmptyCV()
  const raw = row.cv_data && typeof row.cv_data === "object" ? (row.cv_data as Partial<CV>) : {}
  const templateIdCandidate = raw.templateId ?? row.template_id ?? base.templateId
  const templateId = isTemplateId(String(templateIdCandidate))
    ? (templateIdCandidate as CV["templateId"])
    : base.templateId

  return {
    ...base,
    ...raw,
    id: row.id ?? raw.id ?? base.id,
    templateId,
    personalInfo: {
      ...base.personalInfo,
      ...(raw.personalInfo ?? {}),
    },
    experience: Array.isArray(raw.experience) ? raw.experience : base.experience,
    education: Array.isArray(raw.education) ? raw.education : base.education,
    skills: Array.isArray(raw.skills) ? raw.skills : base.skills,
    certifications: Array.isArray(raw.certifications) ? raw.certifications : base.certifications,
    languages: Array.isArray(raw.languages) ? raw.languages : base.languages,
    referees: Array.isArray(raw.referees) ? raw.referees : base.referees,
    presentation: {
      ...base.presentation,
      ...(raw.presentation ?? {}),
      sectionOrder: Array.isArray(raw.presentation?.sectionOrder)
        ? raw.presentation.sectionOrder
        : base.presentation?.sectionOrder ?? [],
      hiddenSections: Array.isArray(raw.presentation?.hiddenSections)
        ? raw.presentation.hiddenSections
        : base.presentation?.hiddenSections ?? [],
      density: raw.presentation?.density ?? base.presentation?.density ?? "comfortable",
      fontScale: raw.presentation?.fontScale ?? base.presentation?.fontScale ?? "md",
      accentVariant: raw.presentation?.accentVariant ?? base.presentation?.accentVariant ?? "",
    },
    targeting: {
      ...base.targeting,
      ...(raw.targeting ?? {}),
      extractedKeywords: Array.isArray(raw.targeting?.extractedKeywords)
        ? raw.targeting.extractedKeywords
        : base.targeting?.extractedKeywords ?? [],
      emphasisSections: Array.isArray(raw.targeting?.emphasisSections)
        ? raw.targeting.emphasisSections
        : base.targeting?.emphasisSections ?? [],
      targetRole: raw.targeting?.targetRole ?? base.targeting?.targetRole ?? "",
      targetCompany: raw.targeting?.targetCompany ?? base.targeting?.targetCompany ?? "",
      jobDescription: raw.targeting?.jobDescription ?? base.targeting?.jobDescription ?? "",
    },
    variantMeta: {
      ...base.variantMeta,
      ...(raw.variantMeta ?? {}),
    },
    createdAt: raw.createdAt || row.created_at || base.createdAt,
    updatedAt: raw.updatedAt || row.updated_at || base.updatedAt,
  }
}

function buildTitle(cv: CV) {
  const fullName = [cv.personalInfo.firstName, cv.personalInfo.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ")

  return fullName || "Untitled CV"
}

async function requireUserId() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }
  if (!user) {
    throw new Error("You must be signed in to save CVs.")
  }

  return { supabase, userId: user.id }
}

export async function listCVs(): Promise<CVListItem[]> {
  const { supabase, userId } = await requireUserId()
  const { data, error } = await supabase
    .from("cvs")
    .select("id, template_id, title, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    throw error
  }

  return ((data ?? []) as CVRow[]).map((row) => ({
    id: row.id,
    templateId: row.template_id || "modern",
    title: row.title || "Untitled CV",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getCVById(id: string): Promise<CV | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("cvs")
    .select("id, template_id, title, cv_data, created_at, updated_at")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return mergeCVFromRow(data as CVRow)
}

export async function saveCVRecord(cv: CV): Promise<CV> {
  const { supabase, userId } = await requireUserId()

  const now = new Date().toISOString()
  const normalized: CV = {
    ...cv,
    templateId: isTemplateId(String(cv.templateId)) ? cv.templateId : "modern",
    updatedAt: now,
    createdAt: cv.createdAt || now,
  }

  const payload = {
    user_id: userId,
    template_id: normalized.templateId,
    title: buildTitle(normalized),
    cv_data: normalized,
    updated_at: now,
    created_at: normalized.createdAt,
  }

  if (normalized.id) {
    const { data, error } = await supabase
      .from("cvs")
      .update(payload)
      .eq("id", normalized.id)
      .select("id, template_id, title, cv_data, created_at, updated_at")
      .single()

    if (error) {
      throw error
    }

    return mergeCVFromRow(data as CVRow)
  }

  const { data, error } = await supabase
    .from("cvs")
    .insert(payload)
    .select("id, template_id, title, cv_data, created_at, updated_at")
    .single()

  if (error) {
    throw error
  }

  return mergeCVFromRow(data as CVRow)
}

export async function deleteCVRecord(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("cvs").delete().eq("id", id)

  if (error) {
    throw error
  }
}

export async function createCVVersionSnapshot({
  cvId,
  cv,
  changeSummary,
}: {
  cvId: string
  cv: CV
  changeSummary?: string
}) {
  const { supabase, userId } = await requireUserId()
  const { error } = await supabase.from("cv_versions").insert({
    cv_id: cvId,
    user_id: userId,
    cv_snapshot: cv,
    change_summary: changeSummary ?? null,
  })

  if (error) {
    // Versions are optional during rollout; callers can decide whether to surface this.
    throw error
  }
}

export async function listCVVersions(cvId: string): Promise<EditorHistoryEntry[]> {
  const { supabase, userId } = await requireUserId()
  const { data, error } = await supabase
    .from("cv_versions")
    .select("id, cv_id, created_at, change_summary")
    .eq("cv_id", cvId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return ((data ?? []) as VersionRow[]).map((row) => ({
    id: row.id,
    cvId: row.cv_id,
    createdAt: row.created_at,
    changeSummary: row.change_summary ?? undefined,
  }))
}

export async function getCVVersionSnapshot(versionId: string): Promise<CV | null> {
  const { supabase, userId } = await requireUserId()
  const { data, error } = await supabase
    .from("cv_versions")
    .select("id, user_id, cv_id, created_at, change_summary, cv_snapshot")
    .eq("id", versionId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const row = data as VersionRow
  if (!row.cv_snapshot || typeof row.cv_snapshot !== "object") {
    return null
  }

  const base = createEmptyCV()
  const raw = row.cv_snapshot as Partial<CV>
  const templateIdCandidate = raw.templateId ?? base.templateId
  const templateId = isTemplateId(String(templateIdCandidate))
    ? (templateIdCandidate as CV["templateId"])
    : base.templateId

  return {
    ...base,
    ...raw,
    id: raw.id ?? row.cv_id ?? base.id,
    templateId,
    personalInfo: {
      ...base.personalInfo,
      ...(raw.personalInfo ?? {}),
    },
    experience: Array.isArray(raw.experience) ? raw.experience : base.experience,
    education: Array.isArray(raw.education) ? raw.education : base.education,
    skills: Array.isArray(raw.skills) ? raw.skills : base.skills,
    certifications: Array.isArray(raw.certifications) ? raw.certifications : base.certifications,
    languages: Array.isArray(raw.languages) ? raw.languages : base.languages,
    referees: Array.isArray(raw.referees) ? raw.referees : base.referees,
    presentation: {
      ...base.presentation,
      ...(raw.presentation ?? {}),
      sectionOrder: Array.isArray(raw.presentation?.sectionOrder)
        ? raw.presentation.sectionOrder
        : base.presentation?.sectionOrder ?? [],
      hiddenSections: Array.isArray(raw.presentation?.hiddenSections)
        ? raw.presentation.hiddenSections
        : base.presentation?.hiddenSections ?? [],
      density: raw.presentation?.density ?? base.presentation?.density ?? "comfortable",
      fontScale: raw.presentation?.fontScale ?? base.presentation?.fontScale ?? "md",
      accentVariant: raw.presentation?.accentVariant ?? base.presentation?.accentVariant ?? "",
    },
    targeting: {
      ...base.targeting,
      ...(raw.targeting ?? {}),
      extractedKeywords: Array.isArray(raw.targeting?.extractedKeywords)
        ? raw.targeting.extractedKeywords
        : base.targeting?.extractedKeywords ?? [],
      emphasisSections: Array.isArray(raw.targeting?.emphasisSections)
        ? raw.targeting.emphasisSections
        : base.targeting?.emphasisSections ?? [],
      targetRole: raw.targeting?.targetRole ?? base.targeting?.targetRole ?? "",
      targetCompany: raw.targeting?.targetCompany ?? base.targeting?.targetCompany ?? "",
      jobDescription: raw.targeting?.jobDescription ?? base.targeting?.jobDescription ?? "",
    },
    variantMeta: {
      ...base.variantMeta,
      ...(raw.variantMeta ?? {}),
    },
    createdAt: raw.createdAt || row.created_at || base.createdAt,
    updatedAt: raw.updatedAt || row.created_at || base.updatedAt,
  }
}
