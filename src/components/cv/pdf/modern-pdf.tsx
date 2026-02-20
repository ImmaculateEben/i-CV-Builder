import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import { CV } from "@/types/cv"

// Register fonts
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1a1a1a",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 15,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 9,
    color: "#4b5563",
  },
  contactItem: {
    flexDirection: "row",
    gap: 3,
  },
  link: {
    color: "#2563eb",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  summary: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.6,
  },
  experienceItem: {
    marginBottom: 14,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expPosition: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  expCompany: {
    fontSize: 10,
    color: "#4b5563",
    marginTop: 1,
  },
  expDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  expDescription: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 4,
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 10,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eduDegree: {
    fontSize: 10,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  eduInstitution: {
    fontSize: 9,
    color: "#4b5563",
  },
  eduDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    color: "#374151",
  },
  languagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  languageItem: {
    fontSize: 10,
    color: "#4b5563",
  },
  certItem: {
    marginBottom: 10,
  },
  certHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  certName: {
    fontSize: 10,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  certIssuer: {
    fontSize: 9,
    color: "#4b5563",
  },
  certDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  refereeItem: {
    marginBottom: 12,
  },
  refereeName: {
    fontSize: 10,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  refereePosition: {
    fontSize: 9,
    color: "#4b5563",
  },
  refereeContact: {
    fontSize: 9,
    color: "#6b7280",
  },
})

interface CVPDFProps {
  cv: CV
}

export function CVPDFDocument({ cv }: CVPDFProps) {
  const { personalInfo, summary, experience, education, skills, certifications, languages, referees } = cv

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          <View style={styles.contactRow}>
            {personalInfo.email && (
              <Text style={styles.contactItem}>{personalInfo.email}</Text>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}> | {personalInfo.phone}</Text>
            )}
            {personalInfo.address && (
              <Text style={styles.contactItem}> | {personalInfo.address}</Text>
            )}
          </View>
          <View style={styles.contactRow}>
            {personalInfo.linkedIn && (
              <Text style={[styles.contactItem, styles.link]}>{personalInfo.linkedIn}</Text>
            )}
            {personalInfo.portfolioUrl && (
              <Text style={[styles.contactItem, styles.link]}>
                {personalInfo.linkedIn ? " | " : ""}{personalInfo.portfolioUrl}
              </Text>
            )}
          </View>
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.expHeader}>
                  <View>
                    <Text style={styles.expPosition}>{exp.position}</Text>
                    <Text style={styles.expCompany}>{exp.company}</Text>
                  </View>
                  <Text style={styles.expDate}>
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={styles.expDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <View style={styles.eduHeader}>
                  <View>
                    <Text style={styles.eduDegree}>
                      {edu.degree} in {edu.field}
                    </Text>
                    <Text style={styles.eduInstitution}>{edu.institution}</Text>
                  </View>
                  <Text style={styles.eduDate}>
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skillBadge}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.certItem}>
                <View style={styles.certHeader}>
                  <View>
                    <Text style={styles.certName}>{cert.name}</Text>
                    <Text style={styles.certIssuer}>{cert.issuer}</Text>
                  </View>
                  <Text style={styles.certDate}>{cert.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.languagesContainer}>
              {languages.map((lang) => (
                <Text key={lang.id} style={styles.languageItem}>
                  {lang.language} - {lang.proficiency}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Referees */}
        {referees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referees</Text>
            {referees.map((ref) => (
              <View key={ref.id} style={styles.refereeItem}>
                <Text style={styles.refereeName}>{ref.name}</Text>
                <Text style={styles.refereePosition}>{ref.position} at {ref.company}</Text>
                <Text style={styles.refereeContact}>
                  {ref.email} {ref.phone ? `| ${ref.phone}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
