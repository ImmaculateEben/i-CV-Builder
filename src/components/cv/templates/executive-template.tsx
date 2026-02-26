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

interface ExecutiveTemplateProps {
  cv: CV
}

export function ExecutiveTemplate({ cv }: ExecutiveTemplateProps) {
  const { summary, experience, education, skills, certifications, languages } = cv
  const contactItems = getContactItems(cv)
  const links = getLinkItems(cv)
  const groupedSkills = groupSkills(skills)
  const currentRole = experience.find((item) => item.position.trim())?.position

  return (
    <div className="mx-auto max-w-[800px] overflow-hidden rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-xl shadow-slate-300/40">
      <header className="bg-slate-900 px-8 py-7 text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Executive Resume
            </p>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">
              {getFullName(cv)}
            </h1>
            {currentRole && (
              <p className="mt-2 text-sm font-medium text-slate-200">{currentRole}</p>
            )}
          </div>

          <div className="space-y-1 text-right text-sm text-slate-200">
            {contactItems.map((item) => (
              <div key={item}>{item}</div>
            ))}
            {links.map((item) => (
              <div key={item.label}>{item.display}</div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-8 p-8 md:grid-cols-[1.65fr_1fr]">
        <main className="space-y-7">
          {summary.trim() && (
            <section>
              <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-800">
                <span className="h-px flex-1 bg-amber-300" />
                Executive Profile
              </h2>
              <p className="text-sm leading-6 text-slate-700">{summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-800">
                Leadership Experience
              </h2>
              <div className="space-y-5">
                {experience.map((exp) => {
                  const lines = fallbackDescriptionLines(exp.description)

                  return (
                    <article key={exp.id} className="border-l-2 border-slate-200 pl-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                          <p className="text-sm text-slate-600">{exp.company}</p>
                        </div>
                        <p className="text-xs font-medium text-slate-500">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </p>
                      </div>
                      {lines.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          {lines.map((line, index) => (
                            <li key={`${exp.id}-${index}`} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-800">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <article
                    key={edu.id}
                    className="flex flex-col gap-1 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {edu.degree}
                        {edu.field.trim() ? `, ${edu.field}` : ""}
                      </h3>
                      <p className="text-sm text-slate-600">{edu.institution}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="space-y-6">
          {skills.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                Core Strengths
              </h2>
              <div className="space-y-3 text-sm">
                {groupedSkills.technical.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Technical
                    </p>
                    <ul className="space-y-1 text-slate-700">
                      {groupedSkills.technical.map((skill) => (
                        <li key={skill.id}>{skill.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {groupedSkills.soft.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Leadership
                    </p>
                    <ul className="space-y-1 text-slate-700">
                      {groupedSkills.soft.map((skill) => (
                        <li key={skill.id}>{skill.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section className="rounded-xl border border-slate-200 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                Certifications
              </h2>
              <div className="space-y-2 text-sm">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <p className="font-medium text-slate-900">{cert.name}</p>
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
            <section className="rounded-xl border border-slate-200 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                Languages
              </h2>
              <div className="space-y-2 text-sm">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">{lang.language}</span>
                    <span className="text-xs text-slate-500">{capitalize(lang.proficiency)}</span>
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
