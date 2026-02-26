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

interface MinimalTemplateProps {
  cv: CV
}

export function MinimalTemplate({ cv }: MinimalTemplateProps) {
  const { summary, experience, education, skills, certifications, languages } = cv
  const contactItems = getContactItems(cv)
  const links = getLinkItems(cv)
  const groupedSkills = groupSkills(skills)

  return (
    <div className="mx-auto max-w-[800px] border border-zinc-200 bg-white text-zinc-900 shadow-lg shadow-zinc-300/30">
      <div className="grid md:grid-cols-[1.55fr_1fr]">
        <main className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">{getFullName(cv)}</h1>
            {(contactItems.length > 0 || links.length > 0) && (
              <div className="mt-3 space-y-1 text-sm text-zinc-600">
                {contactItems.length > 0 && <p>{contactItems.join(" | ")}</p>}
                {links.length > 0 && <p>{links.map((link) => link.display).join(" | ")}</p>}
              </div>
            )}
          </header>

          {summary.trim() && (
            <section className="mb-7">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Summary
              </h2>
              <p className="text-sm leading-6 text-zinc-700">{summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-7">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Experience
              </h2>
              <div className="space-y-5">
                {experience.map((exp) => {
                  const lines = fallbackDescriptionLines(exp.description)

                  return (
                    <article key={exp.id}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-zinc-900">{exp.position}</h3>
                          <p className="text-sm text-zinc-600">{exp.company}</p>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </p>
                      </div>

                      {lines.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                          {lines.map((line, index) => (
                            <li key={`${exp.id}-${index}`} className="flex gap-2">
                              <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-400" />
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
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <article
                    key={edu.id}
                    className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-zinc-900">
                        {edu.degree}
                        {edu.field.trim() ? `, ${edu.field}` : ""}
                      </h3>
                      <p className="text-sm text-zinc-600">{edu.institution}</p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="border-t border-zinc-200 bg-zinc-50 p-8 md:border-l md:border-t-0">
          <div className="space-y-6">
            {skills.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Skills
                </h2>
                <div className="space-y-3">
                  {groupedSkills.technical.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-zinc-500">Technical</p>
                      <div className="flex flex-wrap gap-2">
                        {groupedSkills.technical.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded bg-white px-2 py-1 text-xs text-zinc-700 shadow-sm"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {groupedSkills.soft.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-zinc-500">Soft</p>
                      <ul className="space-y-1 text-sm text-zinc-700">
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
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Certifications
                </h2>
                <div className="space-y-2 text-sm">
                  {certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-medium text-zinc-900">{cert.name}</p>
                      <p className="text-zinc-600">
                        {cert.issuer}
                        {cert.date ? ` • ${cert.date}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {languages.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Languages
                </h2>
                <div className="space-y-1 text-sm text-zinc-700">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between gap-2">
                      <span>{lang.language}</span>
                      <span className="text-xs text-zinc-500">{capitalize(lang.proficiency)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
