import { CV } from "@/types/cv"

interface CreativeTemplateProps {
  cv: CV
}

export function CreativeTemplate({ cv }: CreativeTemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages } = cv

  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 p-0 shadow-lg overflow-hidden">
      {/* Header with Color Block */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 text-white">
        <h1 className="text-4xl font-bold">
          {personalInfo.firstName} <span className="font-light">{personalInfo.lastName}</span>
        </h1>
        <div className="flex flex-wrap gap-4 mt-4 text-white/90 text-sm">
          <span>✉ {personalInfo.email}</span>
          <span>📱 {personalInfo.phone}</span>
          <span>📍 {personalInfo.address}</span>
        </div>
        <div className="flex gap-4 mt-2 text-sm">
          {personalInfo.linkedIn && <span>🔗 {personalInfo.linkedIn}</span>}
          {personalInfo.portfolioUrl && <span>🌐 {personalInfo.portfolioUrl}</span>}
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        {summary && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
              About Me
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
              Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-purple-200">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h3 className="font-bold text-gray-900">{exp.position}</h3>
                  <p className="text-purple-600 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-500 mb-1">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 text-sm">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-4 border-l-2 border-purple-200">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h3 className="font-bold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-purple-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium rounded-full"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
              Languages
            </h2>
            <div className="flex flex-wrap gap-4">
              {languages.map((lang) => (
                <div key={lang.id} className="text-center">
                  <span className="font-bold text-gray-900">{lang.language}</span>
                  <p className="text-xs text-gray-500 capitalize">{lang.proficiency}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
