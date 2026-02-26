import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  CVTemplatePreview,
  cvTemplateRegistry,
} from "@/components/cv/templates/registry"
import { Check, Layout, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TemplatesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden py-14 sm:py-18">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.08),transparent_50%)]" />
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Choose Your CV Template
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Seven polished templates for corporate, creative, regional, executive, and technical roles.
              Switch layouts anytime without re-entering your information.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="container mx-auto px-4">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <span className="rounded-full border bg-background px-3 py-1 font-medium">
                7 templates
              </span>
              <span className="rounded-full border bg-background px-3 py-1">
                Responsive previews
              </span>
              <span className="rounded-full border bg-background px-3 py-1">
                Multi-page PDF export
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cvTemplateRegistry.map((template) => {
                const Icon = template.icon

                return (
                  <article
                    key={template.id}
                    className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <CVTemplatePreview
                      templateId={template.id}
                      className="rounded-none border-0 bg-slate-100 aspect-[4/5] sm:aspect-[3/4]"
                      scaleClassName="scale-[0.27] sm:scale-[0.31] lg:scale-[0.34]"
                    />

                    <div className="border-t p-5">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg text-white",
                              template.accentClassName
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="font-semibold">{template.name}</h2>
                            <span
                              className={cn(
                                "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                template.chipClassName
                              )}
                            >
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mb-4 text-sm text-muted-foreground">{template.description}</p>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/editor?template=${template.id}`} className="flex-1">
                          <Button className="w-full">Use Template</Button>
                        </Link>
                        <Link href={`/editor?template=${template.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            Preview in Editor
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Why These Templates Work</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">ATS-Friendly Structure</h3>
                <p className="text-sm text-muted-foreground">
                  Clear headings, readable hierarchy, and recruiter-friendly layouts across all templates.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Layout className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Flexible Styling</h3>
                <p className="text-sm text-muted-foreground">
                  Move from conservative to expressive designs without changing your content or section order.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Regional + Role Fit</h3>
                <p className="text-sm text-muted-foreground">
                  Includes Nigerian format support, executive styling, and a technical template for developers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
