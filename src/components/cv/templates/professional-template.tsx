import { CV } from "@/types/cv"

interface ProfessionalTemplateProps {
  cv: CV
}

export function ProfessionalTemplate({ cv }: ProfessionalTemplateProps) {
  const { personalInfo, summary, experience, education, skills, certifications } = cv

  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 p-8 shadow-lg">
      {/* Header - Traditional Style */}
      <header className="text-center border-b border-gray-300 pb-6 mb-6">
        <h1 className="text-4xl font-serif font-bold text-gray-900 uppercase tracking-wider">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          {personalInfo.email} | {personalInfo.phone} | {personalInfo.address}
        </p>
        {(personalInfo.linkedIn || personalInfo.portfolioUrl) && (
          <p className="text-gray-600 mt-1">
            {personalInfo.linkedIn} {personalInfo.linkedIn && personalInfo.portfolioUrl && "|"} {personalInfo.portfolioUrl}
          </p>
        )}
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900">{exp.company}</h3>
                  <span className="text-gray-600 italic">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p className="text-gray-700 font-semibold">{exp.position}</p>
                {exp.description && (
                  <p className="mt-1 text-gray-700 text-sm">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                  <p className="text-gray-700">
                    {edu.degree} in {edu.field}
                  </p>
                </div>
                <span className="text-gray-600 italic">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            SKILLS
          </h2>
          <p className="text-gray-700">
            {skills.map((s) => s.name).join(" • ")}
          </p>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h2 className="text-xl font-serif font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            CERTIFICATIONS
          </h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <span className="font-semibold text-gray-900">{cert.name}</span>
                <span className="text-gray-600">{cert.issuer} ({cert.date})</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
