"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { deleteCVRecord, listCVs, type CVListItem } from "@/lib/cv-repository"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Trash2, LogOut } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [cvs, setCvs] = useState<CVListItem[]>([])
  const [loading, setLoading] = useState(true)

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
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteCV(cv.id)}
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

      <Footer />
    </div>
  )
}
