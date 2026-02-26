import { z } from "zod"
import { sectionKeys, templateIds } from "@/types/cv"

// Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(30).default(""),
  address: z.string().max(200).default(""),
  linkedIn: z.string().url("Invalid LinkedIn URL").default("").or(z.literal("")),
  portfolioUrl: z.string().url("Invalid portfolio URL").default("").or(z.literal("")),
})

// Work Experience Schema
export const workExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required").max(100),
  position: z.string().min(1, "Position is required").max(100),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  description: z.string().max(1000).default(""),
})

// Education Schema
export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution name is required").max(200),
  degree: z.string().min(1, "Degree is required").max(100),
  field: z.string().min(1, "Field of study is required").max(100),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
})

// Skill Schema
export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name is required").max(50),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
  category: z.enum(["technical", "soft"]).default("technical"),
})

// Certification Schema
export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required").max(200),
  issuer: z.string().min(1, "Issuer is required").max(200),
  date: z.string().min(1, "Date is required"),
  expiryDate: z.string().default(""),
  credentialId: z.string().default(""),
})

// Language Schema
export const languageSchema = z.object({
  id: z.string(),
  language: z.string().min(1, "Language is required").max(50),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "fluent", "native"]).default("intermediate"),
})

// Referee Schema
export const refereeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Referee name is required").max(100),
  position: z.string().min(1, "Position is required").max(100),
  company: z.string().min(1, "Company is required").max(200),
  email: z.string().email("Invalid email address").default("").or(z.literal("")),
  phone: z.string().default(""),
  relationship: z.string().max(100).default(""),
})

export const cvPresentationSchema = z.object({
  sectionOrder: z.array(z.enum(sectionKeys)).default([...sectionKeys]),
  hiddenSections: z.array(z.enum(sectionKeys)).default([]),
  density: z.enum(["comfortable", "compact"]).default("comfortable"),
  fontScale: z.enum(["sm", "md", "lg"]).default("md"),
  accentVariant: z.string().optional().or(z.literal("")),
})

export const cvTargetingSchema = z.object({
  targetRole: z.string().default(""),
  targetCompany: z.string().default(""),
  jobDescription: z.string().default(""),
  extractedKeywords: z.array(z.string()).default([]),
  emphasisSections: z.array(z.enum(sectionKeys)).default([]),
})

export const cvVariantMetaSchema = z.object({
  baseCvId: z.string().optional().or(z.literal("")),
  variantLabel: z.string().optional().or(z.literal("")),
  sourceTemplateId: z.enum(templateIds).optional(),
})

// Full CV Schema
export const cvSchema = z.object({
  id: z.string(),
  templateId: z.enum(templateIds),
  personalInfo: personalInfoSchema,
  summary: z.string().max(2000).optional().or(z.literal("")),
  experience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillSchema),
  certifications: z.array(certificationSchema),
  languages: z.array(languageSchema),
  referees: z.array(refereeSchema),
  presentation: cvPresentationSchema.optional(),
  targeting: cvTargetingSchema.optional(),
  variantMeta: cvVariantMetaSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Type exports
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>
export type EducationInput = z.infer<typeof educationSchema>
export type SkillInput = z.infer<typeof skillSchema>
export type CertificationInput = z.infer<typeof certificationSchema>
export type LanguageInput = z.infer<typeof languageSchema>
export type RefereeInput = z.infer<typeof refereeSchema>
export type CVInput = z.infer<typeof cvSchema>
