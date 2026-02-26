import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CVTemplatePreview, cvTemplateRegistry } from "@/components/cv/templates/registry"
import { cn } from "@/lib/utils"
import { FileText, Download, Palette, Zap, Shield, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-16 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
                Create Professional CVs in Minutes
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
                Build stunning resumes with our easy-to-use CV builder. 
                Choose from beautiful templates, customize your content, and download as PDF.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/editor">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Try Without Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_var(--primary)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--accent)_0%,_transparent_50%)]" />
          </div>
        </section>

        {/* Template Preview Showcase */}
        <section className="py-10 sm:py-14">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">See Your CV Before You Export</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Live previews stay responsive on mobile and desktop while keeping your content readable.
                    </p>
                  </div>
                  <Link href="/templates">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Browse Templates
                    </Button>
                  </Link>
                </div>

                <CVTemplatePreview
                  templateId="modern"
                  className="bg-slate-100 aspect-[4/5] sm:aspect-[3/4]"
                  scaleClassName="scale-[0.29] sm:scale-[0.35] lg:scale-[0.4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-card p-3 shadow-sm">
                  <div className="mb-2">
                    <p className="text-sm font-semibold">Professional</p>
                    <p className="text-xs text-muted-foreground">Formal and recruiter-friendly</p>
                  </div>
                  <CVTemplatePreview
                    templateId="professional"
                    className="rounded-xl border bg-stone-50 aspect-[4/5]"
                    scaleClassName="scale-[0.24] sm:scale-[0.27]"
                  />
                </div>

                <div className="rounded-2xl border bg-card p-3 shadow-sm">
                  <div className="mb-2">
                    <p className="text-sm font-semibold">Creative</p>
                    <p className="text-xs text-muted-foreground">Portfolio-forward visual identity</p>
                  </div>
                  <CVTemplatePreview
                    templateId="creative"
                    className="rounded-xl border bg-rose-50/40 aspect-[4/5]"
                    scaleClassName="scale-[0.24] sm:scale-[0.27]"
                  />
                </div>

                <div className="rounded-2xl border bg-card p-3 shadow-sm sm:col-span-2">
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Tech Grid</p>
                      <p className="text-xs text-muted-foreground">
                        Dark on-screen style with print-safe PDF export theme
                      </p>
                    </div>
                    <Link href="/editor?template=tech" className="text-xs text-primary underline underline-offset-4">
                      Try in editor
                    </Link>
                  </div>
                  <CVTemplatePreview
                    templateId="tech"
                    className="rounded-xl border bg-slate-900/70 aspect-[3/4]"
                    scaleClassName="scale-[0.24] sm:scale-[0.28] md:scale-[0.31]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">All Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse all {cvTemplateRegistry.length} templates from the homepage.
                  </p>
                </div>
                <Link href="/templates">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View Template Gallery
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                {cvTemplateRegistry.map((template) => (
                  <Link
                    key={template.id}
                    href={`/editor?template=${template.id}`}
                    className="group rounded-xl border bg-background p-2 transition hover:border-primary/40 hover:shadow-sm"
                  >
                    <CVTemplatePreview
                      templateId={template.id}
                      className={cn(
                        "rounded-lg border aspect-[4/5]",
                        template.id === "tech" ? "bg-slate-900/70" : "bg-slate-100"
                      )}
                      scaleClassName="scale-[0.17] sm:scale-[0.19] xl:scale-[0.18]"
                    />
                    <div className="pt-2">
                      <p className="truncate text-xs font-medium">{template.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{template.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              Everything You Need to Create the Perfect CV
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Beautiful Templates</h3>
                  <p className="text-muted-foreground">
                    Choose from 7 professionally designed templates, including Modern, Professional, Creative,
                    Nigerian, Minimal, Executive, and Tech layouts.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">PDF Export</h3>
                  <p className="text-muted-foreground">
                    Download your CV as a high-quality PDF that&apos;s ready to send to employers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
                  <p className="text-muted-foreground">
                    Our step-by-step wizard guides you through creating your CV with ease.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">All Sections Covered</h3>
                  <p className="text-muted-foreground">
                    Include personal info, experience, education, skills, certifications, languages, and referees.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
                  <p className="text-muted-foreground">
                    Create an account to save and manage your CVs securely in the cloud.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nigerian Format</h3>
                  <p className="text-muted-foreground">
                    Special template tailored for the Nigerian job market with space for referees.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Create Your CV?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start building your professional resume today - it&apos;s free!
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
