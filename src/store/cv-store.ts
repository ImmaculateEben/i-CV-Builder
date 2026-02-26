import { create } from "zustand"
import type { CV, SectionKey, TemplateId } from "@/types/cv"
import { createEmptyCV } from "@/types/cv"

type Direction = "up" | "down"

const HISTORY_LIMIT = 50

type WithId = { id: string }

interface CVStore {
  // Current CV being edited
  currentCV: CV

  // List of saved CVs (for dashboard)
  savedCVs: CV[]

  // Current template
  currentTemplate: TemplateId

  // History state
  undoStack: CV[]
  redoStack: CV[]
  canUndo: boolean
  canRedo: boolean

  // Actions
  setCurrentCV: (cv: CV) => void
  updatePersonalInfo: (data: CV["personalInfo"]) => void
  updateSummary: (summary: string) => void
  updatePresentation: (data: Partial<NonNullable<CV["presentation"]>>) => void
  updateTargeting: (data: Partial<NonNullable<CV["targeting"]>>) => void
  moveSectionOrder: (sectionKey: SectionKey, direction: Direction) => void
  toggleSectionVisibility: (sectionKey: SectionKey) => void

  addExperience: () => void
  updateExperience: (id: string, data: CV["experience"][number]) => void
  removeExperience: (id: string) => void
  duplicateExperience: (id: string) => void
  moveExperience: (id: string, direction: Direction) => void

  addEducation: () => void
  updateEducation: (id: string, data: CV["education"][number]) => void
  removeEducation: (id: string) => void
  duplicateEducation: (id: string) => void
  moveEducation: (id: string, direction: Direction) => void

  addSkill: () => void
  updateSkill: (id: string, data: CV["skills"][number]) => void
  removeSkill: (id: string) => void
  duplicateSkill: (id: string) => void
  moveSkill: (id: string, direction: Direction) => void

  addCertification: () => void
  updateCertification: (id: string, data: CV["certifications"][number]) => void
  removeCertification: (id: string) => void
  duplicateCertification: (id: string) => void
  moveCertification: (id: string, direction: Direction) => void

  addLanguage: () => void
  updateLanguage: (id: string, data: CV["languages"][number]) => void
  removeLanguage: (id: string) => void
  duplicateLanguage: (id: string) => void
  moveLanguage: (id: string, direction: Direction) => void

  addReferee: () => void
  updateReferee: (id: string, data: CV["referees"][number]) => void
  removeReferee: (id: string) => void
  duplicateReferee: (id: string) => void
  moveReferee: (id: string, direction: Direction) => void

  setTemplate: (templateId: TemplateId) => void
  undo: () => void
  redo: () => void
  resetCV: () => void
  loadSavedCVs: (cvs: CV[]) => void
  saveCV: (cv: CV) => void
  deleteCV: (id: string) => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const nowIso = () => new Date().toISOString()

function updateTimestamp<T extends CV>(cv: T): T {
  return {
    ...cv,
    updatedAt: nowIso(),
  }
}

function duplicateById<T extends WithId>(items: T[], id: string): T[] {
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) {
    return items
  }

  const item = items[index]
  const duplicate = { ...item, id: generateId() }
  return [...items.slice(0, index + 1), duplicate, ...items.slice(index + 1)]
}

function moveById<T extends WithId>(items: T[], id: string, direction: Direction): T[] {
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) {
    return items
  }

  const nextIndex = direction === "up" ? index - 1 : index + 1
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items
  }

  const copy = [...items]
  ;[copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]]
  return copy
}

function setHistoryState(
  state: CVStore,
  nextCV: CV,
  options?: { recordHistory?: boolean }
): Partial<CVStore> {
  const recordHistory = options?.recordHistory ?? true

  if (!recordHistory) {
    return {
      currentCV: nextCV,
      currentTemplate: nextCV.templateId,
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
    }
  }

  const undoStack = [...state.undoStack, state.currentCV].slice(-HISTORY_LIMIT)
  return {
    currentCV: nextCV,
    currentTemplate: nextCV.templateId,
    undoStack,
    redoStack: [],
    canUndo: undoStack.length > 0,
    canRedo: false,
  }
}

export const useCVStore = create<CVStore>((set) => {
  return {
    currentCV: createEmptyCV(),
    savedCVs: [],
    currentTemplate: "modern",
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,

    setCurrentCV: (cv) =>
      set((state) => {
        const nextCV: CV = {
          ...cv,
          updatedAt: cv.updatedAt || nowIso(),
          createdAt: cv.createdAt || nowIso(),
        }
        return setHistoryState(state, nextCV, { recordHistory: false })
      }),

    updatePersonalInfo: (data) =>
      set((state) =>
        setHistoryState(state, updateTimestamp({ ...state.currentCV, personalInfo: data }))
      ),

    updateSummary: (summary) =>
      set((state) =>
        setHistoryState(state, updateTimestamp({ ...state.currentCV, summary }))
      ),

    updatePresentation: (data) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            presentation: {
              ...(state.currentCV.presentation ?? createEmptyCV().presentation!),
              ...data,
            },
          })
        )
      ),

    updateTargeting: (data) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            targeting: {
              ...(state.currentCV.targeting ?? createEmptyCV().targeting!),
              ...data,
            },
          })
        )
      ),

    moveSectionOrder: (sectionKey, direction) =>
      set((state) => {
        const presentation = state.currentCV.presentation ?? createEmptyCV().presentation!
        const sectionOrder = moveById(
          presentation.sectionOrder.map((key) => ({ id: key })),
          sectionKey,
          direction
        ).map((item) => item.id as SectionKey)

        return setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            presentation: {
              ...presentation,
              sectionOrder,
            },
          })
        )
      }),

    toggleSectionVisibility: (sectionKey) =>
      set((state) => {
        const presentation = state.currentCV.presentation ?? createEmptyCV().presentation!
        const hiddenSections = presentation.hiddenSections.includes(sectionKey)
          ? presentation.hiddenSections.filter((key) => key !== sectionKey)
          : [...presentation.hiddenSections, sectionKey]

        return setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            presentation: {
              ...presentation,
              hiddenSections,
            },
          })
        )
      }),

    addExperience: () =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
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
          })
        )
      ),

    updateExperience: (id, data) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            experience: state.currentCV.experience.map((exp) => (exp.id === id ? data : exp)),
          })
        )
      ),

    removeExperience: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            experience: state.currentCV.experience.filter((exp) => exp.id !== id),
          })
        )
      ),

    duplicateExperience: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            experience: duplicateById(state.currentCV.experience, id),
          })
        )
      ),

    moveExperience: (id, direction) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            experience: moveById(state.currentCV.experience, id, direction),
          })
        )
      ),

    addEducation: () =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
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
          })
        )
      ),

    updateEducation: (id, data) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            education: state.currentCV.education.map((edu) => (edu.id === id ? data : edu)),
          })
        )
      ),

    removeEducation: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            education: state.currentCV.education.filter((edu) => edu.id !== id),
          })
        )
      ),

    duplicateEducation: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            education: duplicateById(state.currentCV.education, id),
          })
        )
      ),

    moveEducation: (id, direction) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            education: moveById(state.currentCV.education, id, direction),
          })
        )
      ),

    addSkill: () =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
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
          })
        )
      ),

    updateSkill: (id, data) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            skills: state.currentCV.skills.map((skill) => (skill.id === id ? data : skill)),
          })
        )
      ),

    removeSkill: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            skills: state.currentCV.skills.filter((skill) => skill.id !== id),
          })
        )
      ),

    duplicateSkill: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            skills: duplicateById(state.currentCV.skills, id),
          })
        )
      ),

    moveSkill: (id, direction) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            skills: moveById(state.currentCV.skills, id, direction),
          })
        )
      ),

    addCertification: () =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
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
          })
        )
      ),

    updateCertification: (id, data) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            certifications: state.currentCV.certifications.map((cert) =>
              cert.id === id ? data : cert
            ),
          })
        )
      ),

    removeCertification: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            certifications: state.currentCV.certifications.filter((cert) => cert.id !== id),
          })
        )
      ),

    duplicateCertification: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            certifications: duplicateById(state.currentCV.certifications, id),
          })
        )
      ),

    moveCertification: (id, direction) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            certifications: moveById(state.currentCV.certifications, id, direction),
          })
        )
      ),

    addLanguage: () =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            languages: [
              ...state.currentCV.languages,
              {
                id: generateId(),
                language: "",
                proficiency: "intermediate",
              },
            ],
          })
        )
      ),

    updateLanguage: (id, data) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            languages: state.currentCV.languages.map((lang) => (lang.id === id ? data : lang)),
          })
        )
      ),

    removeLanguage: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            languages: state.currentCV.languages.filter((lang) => lang.id !== id),
          })
        )
      ),

    duplicateLanguage: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            languages: duplicateById(state.currentCV.languages, id),
          })
        )
      ),

    moveLanguage: (id, direction) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            languages: moveById(state.currentCV.languages, id, direction),
          })
        )
      ),

    addReferee: () =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
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
          })
        )
      ),

    updateReferee: (id, data) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            referees: state.currentCV.referees.map((ref) => (ref.id === id ? data : ref)),
          })
        )
      ),

    removeReferee: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            referees: state.currentCV.referees.filter((ref) => ref.id !== id),
          })
        )
      ),

    duplicateReferee: (id) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            referees: duplicateById(state.currentCV.referees, id),
          })
        )
      ),

    moveReferee: (id, direction) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            referees: moveById(state.currentCV.referees, id, direction),
          })
        )
      ),

    setTemplate: (templateId) =>
      set((state) =>
        setHistoryState(
          state,
          updateTimestamp({
            ...state.currentCV,
            templateId,
          })
        )
      ),

    undo: () =>
      set((state) => {
        if (state.undoStack.length === 0) {
          return state
        }

        const previous = state.undoStack[state.undoStack.length - 1]
        const undoStack = state.undoStack.slice(0, -1)
        const redoStack = [...state.redoStack, state.currentCV].slice(-HISTORY_LIMIT)

        return {
          currentCV: previous,
          currentTemplate: previous.templateId,
          undoStack,
          redoStack,
          canUndo: undoStack.length > 0,
          canRedo: redoStack.length > 0,
        }
      }),

    redo: () =>
      set((state) => {
        if (state.redoStack.length === 0) {
          return state
        }

        const next = state.redoStack[state.redoStack.length - 1]
        const redoStack = state.redoStack.slice(0, -1)
        const undoStack = [...state.undoStack, state.currentCV].slice(-HISTORY_LIMIT)

        return {
          currentCV: next,
          currentTemplate: next.templateId,
          undoStack,
          redoStack,
          canUndo: undoStack.length > 0,
          canRedo: redoStack.length > 0,
        }
      }),

    resetCV: () =>
      set((state) => {
        const empty = createEmptyCV()
        return setHistoryState(state, empty, { recordHistory: false })
      }),

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
  }
})
