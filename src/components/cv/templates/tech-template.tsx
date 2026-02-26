import type { CV } from "@/types/cv"
import {
  capitalize,
  fallbackDescriptionLines,
  formatDateRange,
  getContactItems,
  getFullName,
  getLinkItems,
  groupSkills,
  levelToPercent,
} from "./template-utils"

interface TechTemplateProps {
  cv: CV
}

export function TechTemplate({ cv }: TechTemplateProps) {
  const { summary, experience, education, skills, certifications, languages } = cv
  const contacts = getContactItems(cv)
  const links = getLinkItems(cv)
  const groupedSkills = groupSkills(skills)

  return (
    <div className="mx-auto max-w-[800px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-xl shadow-slate-950/50">
      <div className="grid md:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-800 bg-slate-900 p-6 md:border-b-0 md:border-r">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-cyan-300">
            profile.ts
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{getFullName(cv)}</h1>

          {(contacts.length > 0 || links.length > 0) && (
            <div className="mt-5 space-y-2 text-sm text-slate-300">
              {contacts.map((item) => (
                <p key={item}>{item}</p>
              ))}
              {links.map((item) => (
                <p key={item.label} className="truncate">
                  {item.display}
                </p>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                skills.json
              </h2>
              <div className="space-y-3">
                {groupedSkills.technical.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-slate-200">{skill.name}</span>
                      <span className="text-slate-400">{capitalize(skill.level)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-300"
                        style={{ width: `${levelToPercent(skill.level)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                languages[]
              </h2>
              <div className="space-y-2 text-sm">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between gap-2">
                    <span>{lang.language}</span>
                    <span className="text-xs text-slate-400">{capitalize(lang.proficiency)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        <main className="p-6 md:p-8">
          {summary.trim() && (
            <section className="mb-7 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                summary.md
              </h2>
              <p className="text-sm leading-6 text-slate-200">{summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-7">
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                experience.log
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => {
                  const lines = fallbackDescriptionLines(exp.description)

                  return (
                    <article key={exp.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-100">{exp.position}</h3>
                          <p className="text-sm text-cyan-300">{exp.company}</p>
                        </div>
                        <p className="font-mono text-xs text-slate-400">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </p>
                      </div>

                      {lines.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-slate-300">
                          {lines.map((line, index) => (
                            <li key={`${exp.id}-${index}`} className="flex gap-2">
                              <span className="mt-1.5 font-mono text-cyan-300">{">"}</span>
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
            <section className="mb-7">
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                education.db
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <article key={edu.id} className="rounded-xl border border-slate-800 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-100">
                          {edu.degree}
                          {edu.field.trim() ? `, ${edu.field}` : ""}
                        </h3>
                        <p className="text-sm text-slate-300">{edu.institution}</p>
                      </div>
                      <p className="font-mono text-xs text-slate-400">
                        {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {(groupedSkills.soft.length > 0 || certifications.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {groupedSkills.soft.length > 0 && (
                <section className="rounded-xl border border-slate-800 p-4">
                  <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                    soft-skills.ts
                  </h2>
                  <div className="space-y-2 text-sm text-slate-300">
                    {groupedSkills.soft.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                        <span>{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {certifications.length > 0 && (
                <section className="rounded-xl border border-slate-800 p-4">
                  <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
                    certs.yml
                  </h2>
                  <div className="space-y-2 text-sm">
                    {certifications.map((cert) => (
                      <div key={cert.id}>
                        <p className="font-medium text-slate-100">{cert.name}</p>
                        <p className="text-slate-400">
                          {cert.issuer}
                          {cert.date ? ` • ${cert.date}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
