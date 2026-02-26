import type { CV } from "@/types/cv"

export interface EditorDraftState {
  key: string
  cv: CV
  savedAt: string
  source: "local" | "server"
}

export interface EditorHistoryEntry {
  id: string
  cvId: string
  createdAt: string
  changeSummary?: string
}

export interface CVImportEnvelope {
  schemaVersion: number
  exportedAt: string
  appVersion?: string
  cv: CV
}
