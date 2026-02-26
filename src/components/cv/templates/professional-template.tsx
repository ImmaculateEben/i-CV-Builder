import type { ReactNode } from "react"
import type { CV } from "@/types/cv"
import {
  fallbackDescriptionLines,
  formatDateRange,
  getContactItems,
  getFullName,
  getLinkItems,
  groupSkills,
  joinNonEmpty,
} from "./template-utils"

interface ProfessionalTemplateProps {
  cv: CV
}

function ProfessionalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 border-b border-stone-300 pb-1 text-lg font-semibold tracking-[0.18em] text-stone-900">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function ProfessionalTemplate({ cv }: ProfessionalTemplateProps) {
  const { summary, experience, education, skills, certifications, languages } = cv
  const contactLine = joinNonEmpty(getContactItems(cv))
  const linkLine = joinNonEmpty(getLinkItems(cv).map((item) => item.display))
  const groupedSkills = groupSkills(skills)

  return (
    <div className="mx-auto max-w-[800px] border border-stone-300 bg-white p-8 text-stone-900 shadow-lg shadow-stone-300/40">
      <header className="mb-8 border-b-2 border-stone-800 pb-5 text-center">
        <h1 className="font-serif text-4xl font-bold uppercase tracking-[0.12em]">
          {getFullName(cv)}
        </h1>
        {contactLine && <p className="mt-2 text-sm text-stone-700">{contactLine}</p>}
        {linkLine && <p className="mt-1 text-sm text-stone-700">{linkLine}</p>}
      </header>

      {summary.trim() && (
        <ProfessionalSection title="PROFESSIONAL SUMMARY">
          <p className="text-sm leading-6 text-justify text-stone-800">{summary}</p>
        </ProfessionalSection>
      )}

      {experience.length > 0 && (
        <ProfessionalSection title="PROFESSIONAL EXPERIENCE">
          <div className="space-y-5">
            {experience.map((exp) => (
              <article key={exp.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-900">{exp.company}</h3>
                    <p className="text-sm font-medium text-stone-700">{exp.position}</p>
                  </div>
                  <p className="text-xs italic text-stone-600">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                </div>
                {fallbackDescriptionLines(exp.description).length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-800">
                    {fallbackDescriptionLines(exp.description).map((line, index) => (
                      <li key={`${exp.id}-${index}`}>{line}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </ProfessionalSection>
      )}

      {education.length > 0 && (
        <ProfessionalSection title="EDUCATION">
          <div className="space-y-4">
            {education.map((edu) => (
              <article
                key={edu.id}
                className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-stone-900">{edu.institution}</h3>
                  <p className="text-sm text-stone-700">
                    {edu.degree}
                    {edu.field.trim() ? ` in ${edu.field}` : ""}
                  </p>
                </div>
                <p className="text-xs italic text-stone-600">
                  {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                </p>
              </article>
            ))}
          </div>
        </ProfessionalSection>
      )}

      {skills.length > 0 && (
        <ProfessionalSection title="SKILLS">
          <div className="space-y-2 text-sm text-stone-800">
            {groupedSkills.technical.length > 0 && (
              <p>
                <span className="font-semibold">Technical:</span>{" "}
                {groupedSkills.technical.map((skill) => skill.name).join(" • ")}
              </p>
            )}
            {groupedSkills.soft.length > 0 && (
              <p>
                <span className="font-semibold">Soft:</span>{" "}
                {groupedSkills.soft.map((skill) => skill.name).join(" • ")}
              </p>
            )}
          </div>
        </ProfessionalSection>
      )}

      {certifications.length > 0 && (
        <ProfessionalSection title="CERTIFICATIONS">
          <div className="space-y-2 text-sm">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex flex-col sm:flex-row sm:justify-between">
                <span className="font-semibold text-stone-900">{cert.name}</span>
                <span className="text-stone-700">
                  {cert.issuer}
                  {cert.date ? ` (${cert.date})` : ""}
                </span>
              </div>
            ))}
          </div>
        </ProfessionalSection>
      )}

      {languages.length > 0 && (
        <section>
          <h2 className="mb-3 border-b border-stone-300 pb-1 text-lg font-semibold tracking-[0.18em] text-stone-900">
            LANGUAGES
          </h2>
          <p className="text-sm text-stone-800">
            {languages.map((lang) => `${lang.language} (${lang.proficiency})`).join(" • ")}
          </p>
        </section>
      )}
    </div>
  )
}
