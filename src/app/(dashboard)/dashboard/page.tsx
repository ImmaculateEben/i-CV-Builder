"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { deleteCVRecord, getCVById, listCVs, saveCVRecord, type CVListItem } from "@/lib/cv-repository"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { isTemplateId, templateIds, type TemplateId } from "@/types/cv"
import { Plus, FileText, Trash2, LogOut, Copy, Loader2, Palette } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [cvs, setCvs] = useState<CVListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [duplicatingCvId, setDuplicatingCvId] = useState<string | null>(null)
  const [cloneDialogCV, setCloneDialogCV] = useState<CVListItem | null>(null)
  const [cloneTemplateId, setCloneTemplateId] = useState<TemplateId>("modern")
  const [isCloningTemplate, setIsCloningTemplate] = useState(false)

  async function fetchCVs() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setCvs(await listCVs())

    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    
    // Check current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login")
      } else {
        fetchCVs()
      }
    })
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const deleteCV = async (id: string) => {
    await deleteCVRecord(id)
    setCvs((prev) => prev.filter((cv) => cv.id !== id))
  }

  const duplicateCV = async (id: string) => {
    setDuplicatingCvId(id)
    try {
      const source = await getCVById(id)
      if (!source) {
        return
      }

      const now = new Date().toISOString()
      const clone = await saveCVRecord({
        ...source,
        id: "",
        variantMeta: {
          ...(source.variantMeta ?? {}),
          baseCvId: source.id || id,
          sourceTemplateId: source.templateId,
        },
        createdAt: now,
        updatedAt: now,
      })

      setCvs((prev) => [
        {
          id: clone.id,
          templateId: clone.templateId,
          title:
            [clone.personalInfo.firstName, clone.personalInfo.lastName]
              .map((part) => part.trim())
              .filter(Boolean)
              .join(" ") || "Untitled CV",
          createdAt: clone.createdAt,
          updatedAt: clone.updatedAt,
        },
        ...prev,
      ])
    } finally {
      setDuplicatingCvId(null)
    }
  }

  const openCloneTemplateDialog = (cv: CVListItem) => {
    setCloneDialogCV(cv)
    setCloneTemplateId(isTemplateId(cv.templateId) ? cv.templateId : "modern")
  }

  const cloneCVAsTemplate = async () => {
    if (!cloneDialogCV) {
      return
    }

    setIsCloningTemplate(true)
    try {
      const source = await getCVById(cloneDialogCV.id)
      if (!source) {
        return
      }

      const now = new Date().toISOString()
      const clone = await saveCVRecord({
        ...source,
        id: "",
        templateId: cloneTemplateId,
        variantMeta: {
          ...(source.variantMeta ?? {}),
          baseCvId: source.id || cloneDialogCV.id,
          sourceTemplateId: source.templateId,
          variantLabel: source.variantMeta?.variantLabel || `${cloneTemplateId} clone`,
        },
        createdAt: now,
        updatedAt: now,
      })

      setCvs((prev) => [
        {
          id: clone.id,
          templateId: clone.templateId,
          title:
            [clone.personalInfo.firstName, clone.personalInfo.lastName]
              .map((part) => part.trim())
              .filter(Boolean)
              .join(" ") || "Untitled CV",
          createdAt: clone.createdAt,
          updatedAt: clone.updatedAt,
        },
        ...prev,
      ])
      setCloneDialogCV(null)
    } finally {
      setIsCloningTemplate(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My CVs</h1>
              <p className="text-muted-foreground">
                Manage your saved CVs
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Link href="/editor">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New CV
                </Button>
              </Link>
            </div>
          </div>

          {/* CV List */}
          {cvs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No CVs yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first CV to get started
                </p>
                <Link href="/editor">
                  <Button>Create Your First CV</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cvs.map((cv) => (
                <Card key={cv.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{cv.title || `${cv.templateId} CV`}</span>
                    </CardTitle>
                    <CardDescription>
                      Created: {new Date(cv.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Link href={`/editor?id=${cv.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={duplicatingCvId === cv.id}
                      onClick={() => void duplicateCV(cv.id)}
                      title="Duplicate CV"
                    >
                      {duplicatingCvId === cv.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isCloningTemplate && cloneDialogCV?.id === cv.id}
                      onClick={() => openCloneTemplateDialog(cv)}
                      title="Clone as new template"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => void deleteCV(cv.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={Boolean(cloneDialogCV)} onOpenChange={(open) => !open && setCloneDialogCV(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clone As New Template</DialogTitle>
            <DialogDescription>
              Create a new CV copy from the selected record using a different template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cloneDialogCV && (
              <div className="rounded-md border p-3">
                <p className="text-sm font-medium capitalize">{cloneDialogCV.title || "Untitled CV"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current template: {cloneDialogCV.templateId}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="clone-template-id">Target Template</Label>
              <select
                id="clone-template-id"
                value={cloneTemplateId}
                onChange={(event) =>
                  setCloneTemplateId(
                    isTemplateId(event.target.value) ? event.target.value : "modern"
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3"
              >
                {templateIds.map((templateId) => (
                  <option key={templateId} value={templateId}>
                    {templateId}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCloneDialogCV(null)}
                disabled={isCloningTemplate}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => void cloneCVAsTemplate()} disabled={isCloningTemplate}>
                {isCloningTemplate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Clone CV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
