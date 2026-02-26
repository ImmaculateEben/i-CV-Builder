// CV Data Types

export const templateIds = [
  "modern",
  "professional",
  "creative",
  "nigerian",
  "minimal",
  "executive",
  "tech",
] as const

export type TemplateId = (typeof templateIds)[number]

export const isTemplateId = (value: string): value is TemplateId =>
  (templateIds as readonly string[]).includes(value)

export const sectionKeys = [
  "personal",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "languages",
  "referees",
] as const

export type SectionKey = (typeof sectionKeys)[number]

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  linkedIn: string
  portfolioUrl: string
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
}

export interface Skill {
  id: string
  name: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
  category: "technical" | "soft"
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  expiryDate?: string
  credentialId?: string
}

export interface Language {
  id: string
  language: string
  proficiency: "beginner" | "intermediate" | "advanced" | "fluent" | "native"
}

export interface Referee {
  id: string
  name: string
  position: string
  company: string
  email: string
  phone: string
  relationship: string
}

export interface CVPresentation {
  sectionOrder: SectionKey[]
  hiddenSections: SectionKey[]
  density: "comfortable" | "compact"
  fontScale: "sm" | "md" | "lg"
  accentVariant?: string
}

export interface CVTargeting {
  targetRole: string
  targetCompany: string
  jobDescription: string
  extractedKeywords: string[]
  emphasisSections: SectionKey[]
}

export interface CVVariantMeta {
  baseCvId?: string
  variantLabel?: string
  sourceTemplateId?: TemplateId
}

export interface CV {
  id: string
  templateId: TemplateId
  personalInfo: PersonalInfo
  summary: string
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]
  languages: Language[]
  referees: Referee[]
  presentation?: CVPresentation
  targeting?: CVTargeting
  variantMeta?: CVVariantMeta
  createdAt: string
  updatedAt: string
}

// Default empty CV
export const createEmptyCV = (): CV => ({
  id: "",
  templateId: "modern",
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    linkedIn: "",
    portfolioUrl: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  referees: [],
  presentation: {
    sectionOrder: [...sectionKeys],
    hiddenSections: [],
    density: "comfortable",
    fontScale: "md",
    accentVariant: "",
  },
  targeting: {
    targetRole: "",
    targetCompany: "",
    jobDescription: "",
    extractedKeywords: [],
    emphasisSections: [],
  },
  variantMeta: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})
