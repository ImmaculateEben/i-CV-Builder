import type { CV, CVPresentation, SectionKey, Skill, TemplateId } from "@/types/cv"
import { createEmptyCV, sectionKeys } from "@/types/cv"

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

export const demoCV: CV = {
  id: "demo-cv",
  templateId: "modern",
  personalInfo: {
    firstName: "Amina",
    lastName: "Okafor",
    email: "amina.okafor@email.com",
    phone: "+234 803 000 1122",
    address: "Lekki, Lagos, Nigeria",
    linkedIn: "linkedin.com/in/aminaokafor",
    portfolioUrl: "amina.design",
  },
  summary:
    "Product designer and operations-minded builder with 6+ years delivering user-centered experiences across fintech and SaaS teams. Strong at turning messy workflows into polished systems and measurable outcomes.",
  experience: [
    {
      id: "exp-1",
      company: "NovaPay",
      position: "Senior Product Designer",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description:
        "Led checkout redesign across web and mobile, improving completion rate by 18%.\nBuilt component library documentation with engineering for faster releases.",
    },
    {
      id: "exp-2",
      company: "Kite Labs",
      position: "Product Designer",
      startDate: "2019-01",
      endDate: "2022-02",
      current: false,
      description:
        "Designed onboarding and account management flows for B2B customers. Partnered with PMs on UX research and roadmap prioritization.",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Lagos",
      degree: "B.Sc.",
      field: "Computer Science",
      startDate: "2014-09",
      endDate: "2018-07",
      current: false,
    },
  ],
  skills: [
    { id: "skill-1", name: "Figma", level: "expert", category: "technical" },
    { id: "skill-2", name: "UX Research", level: "advanced", category: "technical" },
    { id: "skill-3", name: "Design Systems", level: "advanced", category: "technical" },
    { id: "skill-4", name: "Stakeholder Communication", level: "expert", category: "soft" },
    { id: "skill-5", name: "Product Thinking", level: "advanced", category: "soft" },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Google UX Design Certificate",
      issuer: "Google",
      date: "2021-08",
    },
  ],
  languages: [
    { id: "lang-1", language: "English", proficiency: "fluent" },
    { id: "lang-2", language: "Yoruba", proficiency: "native" },
  ],
  referees: [
    {
      id: "ref-1",
      name: "Tunde Adebayo",
      position: "Product Director",
      company: "NovaPay",
      email: "tunde.adebayo@novapay.io",
      phone: "+234 810 111 2233",
      relationship: "Former manager",
    },
  ],
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
}

const mergeText = (value: string, fallback: string) =>
  value.trim() ? value : fallback

export function buildPreviewCV(cv: CV, templateId: TemplateId = cv.templateId): CV {
  return {
    ...demoCV,
    ...cv,
    templateId,
    personalInfo: {
      ...demoCV.personalInfo,
      ...cv.personalInfo,
      firstName: mergeText(cv.personalInfo.firstName, demoCV.personalInfo.firstName),
      lastName: mergeText(cv.personalInfo.lastName, demoCV.personalInfo.lastName),
      email: mergeText(cv.personalInfo.email, demoCV.personalInfo.email),
      phone: mergeText(cv.personalInfo.phone, demoCV.personalInfo.phone),
      address: mergeText(cv.personalInfo.address, demoCV.personalInfo.address),
      linkedIn: mergeText(cv.personalInfo.linkedIn, demoCV.personalInfo.linkedIn),
      portfolioUrl: mergeText(cv.personalInfo.portfolioUrl, demoCV.personalInfo.portfolioUrl),
    },
    summary: mergeText(cv.summary, demoCV.summary),
    experience: cv.experience.length > 0 ? cv.experience : demoCV.experience,
    education: cv.education.length > 0 ? cv.education : demoCV.education,
    skills: cv.skills.length > 0 ? cv.skills : demoCV.skills,
    certifications: cv.certifications.length > 0 ? cv.certifications : demoCV.certifications,
    languages: cv.languages.length > 0 ? cv.languages : demoCV.languages,
    referees: cv.referees.length > 0 ? cv.referees : demoCV.referees,
  }
}

export function formatMonthYear(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim())
  if (!match) {
    return value.trim()
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) {
    return value.trim()
  }

  return monthFormatter.format(new Date(Date.UTC(year, monthIndex, 1)))
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  current?: boolean
): string {
  const start = startDate ? formatMonthYear(startDate) : ""
  const end = current ? "Present" : endDate ? formatMonthYear(endDate) : ""

  if (!start && !end) {
    return ""
  }
  if (!start) {
    return end
  }
  if (!end) {
    return start
  }
  return `${start} - ${end}`
}

export function getFullName(cv: CV): string {
  const parts = [cv.personalInfo.firstName, cv.personalInfo.lastName]
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.join(" ") || "Your Name"
}

export function getContactItems(cv: CV): string[] {
  const { email, phone, address } = cv.personalInfo
  return [email, phone, address].map((item) => item.trim()).filter(Boolean)
}

export function getLinkItems(cv: CV): Array<{ label: string; href: string; display: string }> {
  const items = [
    { label: "LinkedIn", value: cv.personalInfo.linkedIn },
    { label: "Portfolio", value: cv.personalInfo.portfolioUrl },
  ]

  return items
    .map(({ label, value }) => {
      const trimmed = value.trim()
      if (!trimmed) {
        return null
      }

      const href =
        trimmed.startsWith("http://") || trimmed.startsWith("https://")
          ? trimmed
          : `https://${trimmed}`

      return { label, href, display: trimmed }
    })
    .filter((item): item is { label: string; href: string; display: string } => Boolean(item))
}

export function descriptionLines(description: string): string[] {
  const cleaned = description
    .replace(/\r\n/g, "\n")
    .split("\n")
    .flatMap((line) => line.split(/[\u2022\u25CF\u25AA\u25E6]/g))
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean)

  return cleaned
}

export function fallbackDescriptionLines(description: string): string[] {
  const lines = descriptionLines(description)
  return lines.length > 0 ? lines : description.trim() ? [description.trim()] : []
}

export function groupSkills(skills: Skill[]) {
  return {
    technical: skills.filter((skill) => skill.category === "technical" && skill.name.trim()),
    soft: skills.filter((skill) => skill.category === "soft" && skill.name.trim()),
  }
}

export function levelToPercent(level: Skill["level"]): number {
  switch (level) {
    case "beginner":
      return 35
    case "intermediate":
      return 55
    case "advanced":
      return 78
    case "expert":
      return 94
    default:
      return 55
  }
}

export const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value

export const joinNonEmpty = (values: string[], separator = " | ") =>
  values.map((value) => value.trim()).filter(Boolean).join(separator)

export function getNormalizedPresentation(cv: CV): CVPresentation {
  const defaults = createEmptyCV().presentation!
  const input = cv.presentation ?? defaults
  const normalizedOrder: SectionKey[] = []

  for (const key of input.sectionOrder ?? []) {
    if ((sectionKeys as readonly string[]).includes(key) && !normalizedOrder.includes(key)) {
      normalizedOrder.push(key as SectionKey)
    }
  }

  for (const key of sectionKeys) {
    if (!normalizedOrder.includes(key)) {
      normalizedOrder.push(key)
    }
  }

  const hiddenSections = (input.hiddenSections ?? []).filter(
    (key, index, array): key is SectionKey =>
      (sectionKeys as readonly string[]).includes(key) && array.indexOf(key) === index
  )

  return {
    ...defaults,
    ...input,
    sectionOrder: normalizedOrder,
    hiddenSections,
    density: input.density === "compact" ? "compact" : "comfortable",
    fontScale:
      input.fontScale === "sm" || input.fontScale === "lg" ? input.fontScale : "md",
    accentVariant: input.accentVariant ?? "",
  }
}

export function applyPresentationVisibility(cv: CV): CV {
  const presentation = getNormalizedPresentation(cv)
  const hidden = new Set<SectionKey>(presentation.hiddenSections)

  if (hidden.size === 0) {
    return cv
  }

  return {
    ...cv,
    summary: hidden.has("summary") ? "" : cv.summary,
    experience: hidden.has("experience") ? [] : cv.experience,
    education: hidden.has("education") ? [] : cv.education,
    skills: hidden.has("skills") ? [] : cv.skills,
    certifications: hidden.has("certifications") ? [] : cv.certifications,
    languages: hidden.has("languages") ? [] : cv.languages,
    referees: hidden.has("referees") ? [] : cv.referees,
  }
}
