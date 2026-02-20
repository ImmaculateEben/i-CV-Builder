// CV Data Types

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

export interface CV {
  id: string
  templateId: string
  personalInfo: PersonalInfo
  summary: string
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]
  languages: Language[]
  referees: Referee[]
  createdAt: string
  updatedAt: string
}

export type TemplateId = "modern" | "professional" | "creative" | "nigerian"

export interface Template {
  id: TemplateId
  name: string
  description: string
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Template definitions
export const templates: Template[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design with a professional look",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional and formal layout perfect for corporate roles",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold and unique design that stands out from the crowd",
  },
  {
    id: "nigerian",
    name: "Nigerian Regional",
    description: "Tailored for the Nigerian job market with local preferences",
  },
]
