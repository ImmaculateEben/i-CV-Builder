import type { ReactNode } from "react"
import type { CV } from "@/types/cv"
import {
  fallbackDescriptionLines,
  formatDateRange,
  getContactItems,
  getFullName,
  getLinkItems,
  groupSkills,
} from "./template-utils"

interface NigerianTemplateProps {
  cv: CV
}

function NigerianSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 border-b-2 border-emerald-700 pb-1 text-sm font-bold tracking-[0.18em] text-emerald-800">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function NigerianTemplate({ cv }: NigerianTemplateProps) {
  const { summary, experience, education, skills, certifications, languages, referees } = cv
  const contacts = getContactItems(cv)
  const links = getLinkItems(cv)
  const groupedSkills = groupSkills(skills)

  return (
    <div className="mx-auto max-w-[800px] overflow-hidden border border-emerald-200 bg-white text-slate-900 shadow-lg shadow-emerald-200/40">
      <header className="bg-gradient-to-r from-emerald-800 to-emerald-600 px-8 py-6 text-white">
        <h1 className="text-3xl font-bold tracking-tight">{getFullName(cv)}</h1>
        {contacts.length > 0 && (
          <p className="mt-2 text-sm text-emerald-100">{contacts.join(" | ")}</p>
        )}
        {links.length > 0 && (
          <p className="mt-1 text-xs text-emerald-100">{links.map((item) => item.display).join(" | ")}</p>
        )}
      </header>

      <div className="grid gap-8 p-8 md:grid-cols-[1.55fr_1fr]">
        <div className="space-y-1">
          {summary.trim() && (
            <NigerianSection title="CAREER OBJECTIVE">
              <p className="text-sm leading-6 text-slate-700">{summary}</p>
            </NigerianSection>
          )}

          {experience.length > 0 && (
            <NigerianSection title="WORK EXPERIENCE">
              <div className="space-y-5">
                {experience.map((exp) => {
                  const lines = fallbackDescriptionLines(exp.description)

                  return (
                    <article key={exp.id} className="rounded-lg border border-emerald-100 bg-white p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                          <p className="text-sm font-medium text-emerald-700">{exp.company}</p>
                        </div>
                        <span className="inline-flex w-fit rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </span>
                      </div>
                      {lines.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          {lines.map((line, index) => (
                            <li key={`${exp.id}-${index}`} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  )
                })}
              </div>
            </NigerianSection>
          )}

          {education.length > 0 && (
            <NigerianSection title="EDUCATIONAL QUALIFICATIONS">
              <div className="space-y-4">
                {education.map((edu) => (
                  <article
                    key={edu.id}
                    className="flex flex-col gap-1 rounded-lg border border-emerald-100 p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {edu.degree}
                        {edu.field.trim() ? ` (${edu.field})` : ""}
                      </h3>
                      <p className="text-sm text-emerald-700">{edu.institution}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </article>
                ))}
              </div>
            </NigerianSection>
          )}

          {referees.length > 0 && (
            <section>
              <h2 className="mb-3 border-b-2 border-emerald-700 pb-1 text-sm font-bold tracking-[0.18em] text-emerald-800">
                REFEREES
              </h2>
              <div className="space-y-3">
                {referees.map((ref) => (
                  <article key={ref.id} className="rounded-lg bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900">{ref.name}</h3>
                    <p className="text-sm text-emerald-700">
                      {ref.position}
                      {ref.company.trim() ? `, ${ref.company}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {[ref.email, ref.phone].filter(Boolean).join(" | ")}
                    </p>
                    {ref.relationship.trim() && (
                      <p className="mt-1 text-xs italic text-slate-500">
                        Relationship: {ref.relationship}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {skills.length > 0 && (
            <section className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                Key Competencies
              </h2>
              <div className="space-y-3">
                {groupedSkills.technical.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-500">Technical</p>
                    <div className="grid gap-2">
                      {groupedSkills.technical.map((skill) => (
                        <div key={skill.id} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          <span>{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {groupedSkills.soft.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-500">Soft Skills</p>
                    <p className="text-sm leading-6 text-slate-700">
                      {groupedSkills.soft.map((skill) => skill.name).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section className="rounded-xl border border-emerald-100 p-4">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                Certifications
              </h2>
              <div className="space-y-2 text-sm">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <p className="font-semibold text-slate-900">{cert.name}</p>
                    <p className="text-slate-600">
                      {cert.issuer}
                      {cert.date ? ` • ${cert.date}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section className="rounded-xl border border-emerald-100 p-4">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                Languages
              </h2>
              <div className="space-y-2 text-sm">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{lang.language}</span>
                    <span className="text-xs text-slate-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
