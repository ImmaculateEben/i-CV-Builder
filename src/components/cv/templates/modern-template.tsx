import type { ReactNode } from "react"
import type { CV } from "@/types/cv"
import {
  capitalize,
  fallbackDescriptionLines,
  formatDateRange,
  getContactItems,
  getFullName,
  getLinkItems,
  groupSkills,
} from "./template-utils"

interface ModernTemplateProps {
  cv: CV
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
      <span className="h-px flex-1 bg-blue-200" />
      <span>{children}</span>
    </h2>
  )
}

export function ModernTemplate({ cv }: ModernTemplateProps) {
  const { summary, experience, education, skills, certifications, languages } = cv
  const contactItems = getContactItems(cv)
  const linkItems = getLinkItems(cv)
  const groupedSkills = groupSkills(skills)
  const headline = experience.find((item) => item.position.trim())?.position

  return (
    <div className="mx-auto max-w-[800px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-300/40">
      <div className="h-2 bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400" />

      <div className="p-8">
        <header className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                {getFullName(cv)}
              </h1>
              {headline && (
                <p className="mt-1 text-sm font-medium text-blue-700">{headline}</p>
              )}
            </div>

            <div className="space-y-1 text-right text-sm text-slate-600">
              {contactItems.map((item) => (
                <div key={item}>{item}</div>
              ))}
              {linkItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-blue-700 underline decoration-blue-200 underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.display}
                </a>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-[1.65fr_1fr]">
          <div className="space-y-7">
            {summary.trim() && (
              <section>
                <SectionHeading>Professional Summary</SectionHeading>
                <p className="text-sm leading-6 text-slate-700">{summary}</p>
              </section>
            )}

            {experience.length > 0 && (
              <section>
                <SectionHeading>Experience</SectionHeading>
                <div className="space-y-5">
                  {experience.map((exp) => (
                    <article key={exp.id}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                          <p className="text-sm text-slate-600">{exp.company}</p>
                        </div>
                        <p className="text-xs font-medium text-slate-500">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </p>
                      </div>

                      {fallbackDescriptionLines(exp.description).length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          {fallbackDescriptionLines(exp.description).map((line, index) => (
                            <li key={`${exp.id}-${index}`} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section>
                <SectionHeading>Education</SectionHeading>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <article key={edu.id} className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {edu.degree}
                          {edu.field.trim() ? `, ${edu.field}` : ""}
                        </h3>
                        <p className="text-sm text-slate-600">{edu.institution}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            {skills.length > 0 && (
              <section>
                <SectionHeading>Skills</SectionHeading>
                <div className="space-y-3">
                  {groupedSkills.technical.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Technical
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {groupedSkills.technical.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {groupedSkills.soft.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Soft Skills
                      </p>
                      <p className="text-sm leading-6 text-slate-700">
                        {groupedSkills.soft.map((skill) => skill.name).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section>
                <SectionHeading>Certifications</SectionHeading>
                <div className="space-y-3 text-sm">
                  {certifications.map((cert) => (
                    <article key={cert.id}>
                      <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                      <p className="text-slate-600">
                        {cert.issuer}
                        {cert.date ? ` • ${cert.date}` : ""}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {languages.length > 0 && (
              <section>
                <SectionHeading>Languages</SectionHeading>
                <div className="space-y-2 text-sm">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">{lang.language}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {capitalize(lang.proficiency)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
