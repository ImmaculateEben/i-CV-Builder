import { create } from "zustand"
import { CV, createEmptyCV, TemplateId } from "@/types/cv"

interface CVStore {
  // Current CV being edited
  currentCV: CV
  
  // List of saved CVs (for dashboard)
  savedCVs: CV[]
  
  // Current template
  currentTemplate: TemplateId
  
  // Actions
  setCurrentCV: (cv: CV) => void
  updatePersonalInfo: (data: CV["personalInfo"]) => void
  updateSummary: (summary: string) => void
  addExperience: () => void
  updateExperience: (id: string, data: CV["experience"][0]) => void
  removeExperience: (id: string) => void
  addEducation: () => void
  updateEducation: (id: string, data: CV["education"][0]) => void
  removeEducation: (id: string) => void
  addSkill: () => void
  updateSkill: (id: string, data: CV["skills"][0]) => void
  removeSkill: (id: string) => void
  addCertification: () => void
  updateCertification: (id: string, data: CV["certifications"][0]) => void
  removeCertification: (id: string) => void
  addLanguage: () => void
  updateLanguage: (id: string, data: CV["languages"][0]) => void
  removeLanguage: (id: string) => void
  addReferee: () => void
  updateReferee: (id: string, data: CV["referees"][0]) => void
  removeReferee: (id: string) => void
  setTemplate: (templateId: TemplateId) => void
  resetCV: () => void
  loadSavedCVs: (cvs: CV[]) => void
  saveCV: (cv: CV) => void
  deleteCV: (id: string) => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useCVStore = create<CVStore>((set) => ({
  currentCV: createEmptyCV(),
  savedCVs: [],
  currentTemplate: "modern",

  setCurrentCV: (cv) => set({ currentCV: cv }),

  updatePersonalInfo: (data) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        personalInfo: data,
        updatedAt: new Date().toISOString(),
      },
    })),

  updateSummary: (summary) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        summary,
        updatedAt: new Date().toISOString(),
      },
    })),

  addExperience: () =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        experience: [
          ...state.currentCV.experience,
          {
            id: generateId(),
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateExperience: (id, data) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        experience: state.currentCV.experience.map((exp) =>
          exp.id === id ? data : exp
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeExperience: (id) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        experience: state.currentCV.experience.filter((exp) => exp.id !== id),
        updatedAt: new Date().toISOString(),
      },
    })),

  addEducation: () =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        education: [
          ...state.currentCV.education,
          {
            id: generateId(),
            institution: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            current: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateEducation: (id, data) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        education: state.currentCV.education.map((edu) =>
          edu.id === id ? data : edu
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeEducation: (id) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        education: state.currentCV.education.filter((edu) => edu.id !== id),
        updatedAt: new Date().toISOString(),
      },
    })),

  addSkill: () =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        skills: [
          ...state.currentCV.skills,
          {
            id: generateId(),
            name: "",
            level: "intermediate",
            category: "technical",
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateSkill: (id, data) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        skills: state.currentCV.skills.map((skill) =>
          skill.id === id ? data : skill
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeSkill: (id) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        skills: state.currentCV.skills.filter((skill) => skill.id !== id),
        updatedAt: new Date().toISOString(),
      },
    })),

  addCertification: () =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        certifications: [
          ...state.currentCV.certifications,
          {
            id: generateId(),
            name: "",
            issuer: "",
            date: "",
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateCertification: (id, data) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        certifications: state.currentCV.certifications.map((cert) =>
          cert.id === id ? data : cert
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeCertification: (id) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        certifications: state.currentCV.certifications.filter(
          (cert) => cert.id !== id
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  addLanguage: () =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        languages: [
          ...state.currentCV.languages,
          {
            id: generateId(),
            language: "",
            proficiency: "intermediate",
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateLanguage: (id, data) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        languages: state.currentCV.languages.map((lang) =>
          lang.id === id ? data : lang
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeLanguage: (id) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        languages: state.currentCV.languages.filter((lang) => lang.id !== id),
        updatedAt: new Date().toISOString(),
      },
    })),

  addReferee: () =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        referees: [
          ...state.currentCV.referees,
          {
            id: generateId(),
            name: "",
            position: "",
            company: "",
            email: "",
            phone: "",
            relationship: "",
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateReferee: (id, data) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        referees: state.currentCV.referees.map((ref) =>
          ref.id === id ? data : ref
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeReferee: (id) =>
    set((state) => ({
      currentCV: {
        ...state.currentCV,
        referees: state.currentCV.referees.filter((ref) => ref.id !== id),
        updatedAt: new Date().toISOString(),
      },
    })),

  setTemplate: (templateId) =>
    set((state) => ({
      currentTemplate: templateId,
      currentCV: {
        ...state.currentCV,
        templateId,
        updatedAt: new Date().toISOString(),
      },
    })),

  resetCV: () => set({ currentCV: createEmptyCV() }),

  loadSavedCVs: (cvs) => set({ savedCVs: cvs }),

  saveCV: (cv) =>
    set((state) => {
      const existingIndex = state.savedCVs.findIndex((c) => c.id === cv.id)
      if (existingIndex >= 0) {
        const updated = [...state.savedCVs]
        updated[existingIndex] = cv
        return { savedCVs: updated }
      }
      return { savedCVs: [...state.savedCVs, cv] }
    }),

  deleteCV: (id) =>
    set((state) => ({
      savedCVs: state.savedCVs.filter((cv) => cv.id !== id),
    })),
}))
