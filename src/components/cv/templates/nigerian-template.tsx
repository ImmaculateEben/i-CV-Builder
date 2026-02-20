import { CV } from "@/types/cv"

interface NigerianTemplateProps {
  cv: CV
}

export function NigerianTemplate({ cv }: NigerianTemplateProps) {
  const { personalInfo, summary, experience, education, skills, referees } = cv

  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 p-8 shadow-lg">
      {/* Header - Green/White Theme for Nigeria */}
      <header className="bg-green-700 text-white p-6 -mx-8 -mt-8 mb-6">
        <h1 className="text-3xl font-bold">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <p className="mt-2 text-green-100">
          {personalInfo.email} | {personalInfo.phone}
        </p>
        <p className="text-green-100">{personalInfo.address}</p>
        {personalInfo.linkedIn && (
          <p className="text-green-100 mt-1">LinkedIn: {personalInfo.linkedIn}</p>
        )}
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-green-700 border-b-2 border-green-700 pb-1 mb-3">
            CAREER OBJECTIVE
          </h2>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-green-700 border-b-2 border-green-700 pb-1 mb-3">
            WORK EXPERIENCE
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.position}</h3>
                    <p className="text-green-600 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-2 text-gray-700 text-sm">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education - Emphasized in Nigerian CVs */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-green-700 border-b-2 border-green-700 pb-1 mb-3">
            EDUCATIONAL QUALIFICATIONS
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-green-600">{edu.institution}</p>
                  <p className="text-sm text-gray-600">Field: {edu.field}</p>
                </div>
                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
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
          <h2 className="text-lg font-bold text-green-700 border-b-2 border-green-700 pb-1 mb-3">
            KEY COMPETENCIES
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">{skill.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Referees - Very important in Nigerian job market */}
      {referees.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-green-700 border-b-2 border-green-700 pb-1 mb-3">
            REFEREES
          </h2>
          <div className="space-y-4">
            {referees.map((ref) => (
              <div key={ref.id} className="bg-gray-50 p-3 rounded">
                <h3 className="font-bold text-gray-900">{ref.name}</h3>
                <p className="text-green-600">{ref.position}</p>
                <p className="text-gray-600">{ref.company}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {ref.email} | {ref.phone}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 italic">
            Referees available upon request
          </p>
        </section>
      )}
    </div>
  )
}
