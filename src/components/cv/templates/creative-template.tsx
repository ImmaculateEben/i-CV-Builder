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

interface CreativeTemplateProps {
  cv: CV
}

export function CreativeTemplate({ cv }: CreativeTemplateProps) {
  const { summary, experience, education, skills, languages, certifications } = cv
  const groupedSkills = groupSkills(skills)
  const contactItems = getContactItems(cv)
  const links = getLinkItems(cv)

  return (
    <div className="mx-auto max-w-[800px] overflow-hidden rounded-2xl border border-rose-200 bg-white text-slate-900 shadow-lg shadow-rose-200/40">
      <header className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 p-8 text-white">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-12 left-24 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
            Creative Profile
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            {getFullName(cv)}
          </h1>

          {contactItems.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {contactItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 shadow"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-8 p-8 md:grid-cols-[1.45fr_1fr]">
        <div className="space-y-7">
          {summary.trim() && (
            <section>
              <h2 className="mb-3 inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                About Me
              </h2>
              <p className="text-sm leading-6 text-slate-700">{summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="mb-4 inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                Experience
              </h2>
              <div className="space-y-5">
                {experience.map((exp) => {
                  const lines = fallbackDescriptionLines(exp.description)

                  return (
                    <article key={exp.id} className="relative rounded-xl border border-rose-100 p-4">
                      <div className="absolute left-0 top-4 h-12 w-1 rounded-r bg-gradient-to-b from-rose-500 to-orange-400" />
                      <div className="pl-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                            <p className="text-sm font-medium text-rose-600">{exp.company}</p>
                          </div>
                          <p className="text-xs text-slate-500">
                            {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                          </p>
                        </div>
                        {lines.length > 0 && (
                          <ul className="mt-2 space-y-1 text-sm text-slate-700">
                            {lines.map((line, index) => (
                              <li key={`${exp.id}-${index}`} className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="mb-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <article key={edu.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
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
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {skills.length > 0 && (
            <section className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                Skills
              </h2>
              <div className="space-y-3">
                {groupedSkills.technical.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">Technical</p>
                    <div className="flex flex-wrap gap-2">
                      {groupedSkills.technical.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {groupedSkills.soft.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">Soft</p>
                    <p className="text-sm leading-6 text-slate-700">
                      {groupedSkills.soft.map((skill) => skill.name).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
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
            <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                Languages
              </h2>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div
                    key={lang.id}
                    className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-slate-800">{lang.language}</span>
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
