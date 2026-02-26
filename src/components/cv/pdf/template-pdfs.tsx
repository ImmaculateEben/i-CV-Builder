import type { ReactElement } from "react"
import { Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import type { CV, CVPresentation, SectionKey, Skill, TemplateId } from "@/types/cv"
import {
  capitalize,
  fallbackDescriptionLines,
  formatDateRange,
  formatMonthYear,
  getNormalizedPresentation,
  getContactItems,
  getFullName,
  getLinkItems,
  groupSkills,
  joinNonEmpty,
  levelToPercent,
} from "@/components/cv/templates/template-utils"

type LayoutMode = "single" | "split"
type HeaderMode = "plain" | "center" | "accent" | "dark"
type SkillsMode = "badges" | "list" | "bars"

interface PdfTheme {
  id: TemplateId
  layout: LayoutMode
  header: HeaderMode
  skillsMode: SkillsMode
  pageBg: string
  surface: string
  text: string
  muted: string
  accent: string
  accentSoft: string
  border: string
  bodyFont: "Helvetica" | "Times-Roman" | "Courier"
  headingFont: "Helvetica" | "Times-Bold" | "Courier-Bold"
  upperTitles?: boolean
  topRibbon?: boolean
  label?: string
}

const THEMES: Record<TemplateId, PdfTheme> = {
  modern: {
    id: "modern",
    layout: "split",
    header: "plain",
    skillsMode: "badges",
    pageBg: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#475569",
    accent: "#2563eb",
    accentSoft: "#eff6ff",
    border: "#dbeafe",
    bodyFont: "Helvetica",
    headingFont: "Helvetica",
    upperTitles: true,
    topRibbon: true,
  },
  professional: {
    id: "professional",
    layout: "single",
    header: "center",
    skillsMode: "list",
    pageBg: "#ffffff",
    surface: "#ffffff",
    text: "#1c1917",
    muted: "#57534e",
    accent: "#44403c",
    accentSoft: "#fafaf9",
    border: "#e7e5e4",
    bodyFont: "Times-Roman",
    headingFont: "Times-Bold",
    upperTitles: true,
  },
  creative: {
    id: "creative",
    layout: "single",
    header: "accent",
    skillsMode: "badges",
    pageBg: "#fff7ed",
    surface: "#ffffff",
    text: "#1f2937",
    muted: "#6b7280",
    accent: "#f43f5e",
    accentSoft: "#fff1f2",
    border: "#fecdd3",
    bodyFont: "Helvetica",
    headingFont: "Helvetica",
    label: "Creative Profile",
  },
  nigerian: {
    id: "nigerian",
    layout: "single",
    header: "plain",
    skillsMode: "list",
    pageBg: "#f0fdf4",
    surface: "#ffffff",
    text: "#052e16",
    muted: "#166534",
    accent: "#15803d",
    accentSoft: "#f0fdf4",
    border: "#bbf7d0",
    bodyFont: "Helvetica",
    headingFont: "Helvetica",
    upperTitles: true,
  },
  minimal: {
    id: "minimal",
    layout: "split",
    header: "plain",
    skillsMode: "list",
    pageBg: "#fafafa",
    surface: "#ffffff",
    text: "#18181b",
    muted: "#52525b",
    accent: "#27272a",
    accentSoft: "#fafafa",
    border: "#e4e4e7",
    bodyFont: "Helvetica",
    headingFont: "Helvetica",
    upperTitles: true,
  },
  executive: {
    id: "executive",
    layout: "split",
    header: "dark",
    skillsMode: "list",
    pageBg: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#475569",
    accent: "#0f172a",
    accentSoft: "#fef3c7",
    border: "#cbd5e1",
    bodyFont: "Times-Roman",
    headingFont: "Times-Bold",
    upperTitles: true,
    label: "Executive Resume",
  },
  tech: {
    id: "tech",
    layout: "split",
    header: "plain",
    skillsMode: "bars",
    // Print-safe variant: keep tech identity (mono + cyan accents) without relying on dark backgrounds.
    pageBg: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#475569",
    accent: "#0891b2",
    accentSoft: "#ecfeff",
    border: "#bae6fd",
    bodyFont: "Courier",
    headingFont: "Courier-Bold",
    label: "profile.ts",
  },
}

const CONTACT_SEPARATOR = " | "
const MAIN_SECTION_KEYS: SectionKey[] = ["summary", "experience", "education"]
const SIDE_SECTION_KEYS: SectionKey[] = ["skills", "certifications", "languages", "referees"]
const ORDERABLE_SECTION_KEYS: SectionKey[] = [...MAIN_SECTION_KEYS, ...SIDE_SECTION_KEYS]

function titleLabel(theme: PdfTheme, label: string) {
  return theme.upperTitles ? label.toUpperCase() : label
}

function stylesFor(theme: PdfTheme, presentation: CVPresentation) {
  const headerText = theme.header === "accent" || theme.header === "dark" ? "#ffffff" : theme.text
  const headerMuted = theme.header === "accent" || theme.header === "dark" ? "rgba(255,255,255,0.88)" : theme.muted
  const densityFactor = presentation.density === "compact" ? 0.9 : 1
  const fontScale =
    presentation.fontScale === "sm" ? 0.94 : presentation.fontScale === "lg" ? 1.08 : 1
  const sp = (value: number) => Number((value * densityFactor).toFixed(2))
  const fs = (value: number) => Number((value * fontScale).toFixed(2))

  return StyleSheet.create({
    page: {
      padding: sp(24),
      backgroundColor: theme.pageBg,
      fontFamily: theme.bodyFont,
      color: theme.text,
      fontSize: fs(10),
      lineHeight: 1.35,
    },
    shell: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      overflow: "hidden",
    },
    topRibbon: {
      height: sp(7),
      backgroundColor: theme.accent,
    },
    header: {
      paddingHorizontal: sp(18),
      paddingVertical: sp(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerAccent: {
      backgroundColor: theme.accent,
      borderBottomColor: theme.accent,
    },
    headerDark: {
      backgroundColor: theme.accent,
      borderBottomColor: theme.accent,
    },
    headerCenter: {
      alignItems: "center",
    },
    name: {
      fontFamily: theme.headingFont,
      fontSize: fs(22),
      fontWeight: 700,
      color: headerText,
      textAlign: theme.header === "center" ? "center" : "left",
    },
    headline: {
      marginTop: sp(4),
      fontSize: fs(10),
      color: headerMuted,
      textAlign: theme.header === "center" ? "center" : "left",
    },
    contactLine: {
      marginTop: sp(6),
      fontSize: fs(9),
      color: headerMuted,
      textAlign: theme.header === "center" ? "center" : "left",
    },
    linksRow: {
      marginTop: sp(6),
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: theme.header === "center" ? "center" : "flex-start",
    },
    link: {
      fontSize: fs(9),
      color: headerText,
      textDecoration: "underline",
      marginRight: sp(10),
      marginBottom: sp(2),
    },
    headerLabel: {
      marginTop: sp(6),
      alignSelf: theme.header === "center" ? "center" : "flex-start",
      paddingHorizontal: sp(7),
      paddingVertical: sp(3),
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.header === "plain" || theme.header === "center" ? theme.border : "rgba(255,255,255,0.35)",
      backgroundColor: theme.header === "plain" || theme.header === "center" ? theme.accentSoft : "rgba(255,255,255,0.12)",
      color: headerText,
      fontSize: fs(8),
    },
    body: {
      padding: sp(18),
    },
    splitBody: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    mainCol: {
      flexBasis: "67%",
      flexGrow: 1,
      flexShrink: 1,
      paddingRight: sp(10),
    },
    sideCol: {
      flexBasis: "33%",
      flexGrow: 0,
      flexShrink: 0,
      paddingLeft: sp(10),
    },
    sidebarCard: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: sp(10),
      marginBottom: sp(10),
      backgroundColor: theme.accentSoft,
    },
    section: {
      marginBottom: sp(12),
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: sp(4),
      marginBottom: sp(7),
    },
    sectionDot: {
      width: sp(6),
      height: sp(6),
      borderRadius: 3,
      backgroundColor: theme.accent,
      marginRight: sp(6),
    },
    sectionTitle: {
      fontFamily: theme.headingFont,
      fontSize: fs(11),
      fontWeight: 700,
      color: theme.id === "creative" ? theme.accent : theme.text,
      letterSpacing: 0.25,
    },
    bodyText: {
      fontSize: fs(10),
      color: theme.text,
      lineHeight: 1.35,
    },
    muted: {
      fontSize: fs(9),
      color: theme.muted,
    },
    item: {
      marginBottom: sp(9),
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    grow: {
      flexGrow: 1,
      flexShrink: 1,
      paddingRight: sp(6),
    },
    itemTitle: {
      fontSize: fs(10),
      fontFamily: theme.headingFont,
      fontWeight: 700,
      color: theme.text,
    },
    itemSubtitle: {
      marginTop: sp(2),
      fontSize: fs(9),
      color: theme.muted,
    },
    itemDate: {
      maxWidth: 125,
      fontSize: fs(8.5),
      color: theme.muted,
      textAlign: "right",
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: sp(2),
    },
    bulletMark: {
      width: sp(10),
      fontSize: fs(9),
      color: theme.accent,
    },
    bulletText: {
      flexGrow: 1,
      flexShrink: 1,
      fontSize: fs(9.25),
      color: theme.text,
      lineHeight: 1.35,
    },
    badgeWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: -sp(4),
    },
    badge: {
      marginTop: sp(4),
      marginRight: sp(4),
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 6,
      backgroundColor: "#ffffff",
      paddingHorizontal: sp(6),
      paddingVertical: sp(3),
      fontSize: fs(8.5),
      color: theme.text,
    },
    listLine: {
      fontSize: fs(9),
      color: theme.text,
      marginBottom: sp(4),
    },
    subheading: {
      fontSize: fs(8.5),
      color: theme.muted,
      marginBottom: sp(4),
    },
    skillRow: {
      marginBottom: sp(6),
    },
    skillMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: sp(2),
    },
    skillName: {
      fontSize: fs(8.25),
      color: theme.text,
      flexShrink: 1,
      marginRight: sp(6),
    },
    skillLevel: {
      fontSize: fs(8),
      color: theme.muted,
    },
    skillTrack: {
      height: sp(4),
      backgroundColor: "#e2e8f0",
      borderRadius: 999,
      overflow: "hidden",
    },
    skillFill: {
      height: sp(4),
      backgroundColor: theme.accent,
      borderRadius: 999,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginVertical: sp(6),
    },
    emptyStateCard: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: sp(12),
      backgroundColor: theme.id === "tech" ? "#f0f9ff" : theme.accentSoft,
    },
    emptyStateTitle: {
      fontFamily: theme.headingFont,
      fontSize: fs(10),
      fontWeight: 700,
      color: theme.text,
    },
    emptyStateText: {
      marginTop: sp(4),
      fontSize: fs(9),
      color: theme.muted,
      lineHeight: 1.35,
    },
  })
}

function Section({
  title,
  theme,
  styles,
  children,
}: {
  title: string
  theme: PdfTheme
  styles: ReturnType<typeof stylesFor>
  children: React.ReactNode
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionDot} />
        <Text style={styles.sectionTitle}>{titleLabel(theme, title)}</Text>
      </View>
      {children}
    </View>
  )
}

function Header({ cv, theme, styles }: { cv: CV; theme: PdfTheme; styles: ReturnType<typeof stylesFor> }) {
  const contacts = getContactItems(cv)
  const links = getLinkItems(cv)
  const role = cv.experience.find((entry) => entry.position.trim())?.position?.trim()
  const headerStyle =
    theme.header === "center"
      ? [styles.header, styles.headerCenter]
      : theme.header === "accent"
        ? [styles.header, styles.headerAccent]
        : theme.header === "dark"
          ? [styles.header, styles.headerDark]
          : styles.header

  return (
    <View style={headerStyle}>
      <Text style={styles.name}>{getFullName(cv)}</Text>
      {role && <Text style={styles.headline}>{role}</Text>}
      {contacts.length > 0 && <Text style={styles.contactLine}>{joinNonEmpty(contacts, CONTACT_SEPARATOR)}</Text>}
      {links.length > 0 && (
        <View style={styles.linksRow}>
          {links.map((link) => (
            <Link key={link.label} src={link.href} style={styles.link}>
              {link.display}
            </Link>
          ))}
        </View>
      )}
      {theme.label && <Text style={styles.headerLabel}>{theme.label}</Text>}
    </View>
  )
}

function Summary({ cv, theme, styles }: { cv: CV; theme: PdfTheme; styles: ReturnType<typeof stylesFor> }) {
  if (!cv.summary.trim()) return null
  const title = theme.id === "executive" ? "Executive Profile" : "Professional Summary"
  return (
    <Section title={title} theme={theme} styles={styles}>
      <Text style={styles.bodyText}>{cv.summary.trim()}</Text>
    </Section>
  )
}

function Experience({ cv, theme, styles }: { cv: CV; theme: PdfTheme; styles: ReturnType<typeof stylesFor> }) {
  if (cv.experience.length === 0) return null
  const title = theme.id === "executive" ? "Leadership Experience" : "Work Experience"

  return (
    <Section title={title} theme={theme} styles={styles}>
      {cv.experience.map((exp) => (
        <View key={exp.id} style={styles.item}>
          <View style={styles.rowBetween}>
            <View style={styles.grow}>
              <Text style={styles.itemTitle}>{exp.position || "Role"}</Text>
              <Text style={styles.itemSubtitle}>{exp.company || "Company"}</Text>
            </View>
            <Text style={styles.itemDate}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
          </View>
          {fallbackDescriptionLines(exp.description).map((line, index) => (
            <View key={`${exp.id}-${index}`} style={styles.bulletRow}>
              <Text style={styles.bulletMark}>•</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      ))}
    </Section>
  )
}

function Education({ cv, theme, styles }: { cv: CV; theme: PdfTheme; styles: ReturnType<typeof stylesFor> }) {
  if (cv.education.length === 0) return null
  return (
    <Section title="Education" theme={theme} styles={styles}>
      {cv.education.map((edu) => {
        const degree = edu.field.trim() ? `${edu.degree || "Degree"} in ${edu.field}` : edu.degree || "Degree"
        return (
          <View key={edu.id} style={styles.item}>
            <View style={styles.rowBetween}>
              <View style={styles.grow}>
                <Text style={styles.itemTitle}>{degree}</Text>
                <Text style={styles.itemSubtitle}>{edu.institution}</Text>
              </View>
              <Text style={styles.itemDate}>{formatDateRange(edu.startDate, edu.endDate, edu.current)}</Text>
            </View>
          </View>
        )
      })}
    </Section>
  )
}

function Skills({ cv, theme, styles }: { cv: CV; theme: PdfTheme; styles: ReturnType<typeof stylesFor> }) {
  if (cv.skills.length === 0) return null
  const grouped = groupSkills(cv.skills)

  const renderSkill = (skill: Skill) => {
    if (theme.skillsMode === "bars") {
      return (
        <View key={skill.id} style={styles.skillRow}>
          <View style={styles.skillMeta}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillLevel}>{capitalize(skill.level)}</Text>
          </View>
          <View style={styles.skillTrack}>
            <View style={[styles.skillFill, { width: `${levelToPercent(skill.level)}%` }]} />
          </View>
        </View>
      )
    }
    if (theme.skillsMode === "badges") {
      return (
        <Text key={skill.id} style={styles.badge}>
          {skill.name}
        </Text>
      )
    }
    return (
      <Text key={skill.id} style={styles.listLine}>
        {skill.name}
      </Text>
    )
  }

  const title = theme.id === "tech" ? "skills.json" : "Skills"

  return (
    <Section title={title} theme={theme} styles={styles}>
      {grouped.technical.length > 0 && (
        <View style={{ marginBottom: grouped.soft.length > 0 ? 6 : 0 }}>
          {theme.skillsMode !== "bars" && <Text style={styles.subheading}>Technical</Text>}
          {theme.skillsMode === "badges" ? (
            <View style={styles.badgeWrap}>{grouped.technical.map(renderSkill)}</View>
          ) : (
            <View>{grouped.technical.map(renderSkill)}</View>
          )}
        </View>
      )}
      {grouped.soft.length > 0 && (
        <View>
          {theme.skillsMode !== "bars" && <Text style={styles.subheading}>Soft Skills</Text>}
          {theme.skillsMode === "badges" ? (
            <View style={styles.badgeWrap}>{grouped.soft.map(renderSkill)}</View>
          ) : (
            <View>{grouped.soft.map(renderSkill)}</View>
          )}
        </View>
      )}
    </Section>
  )
}

function Certifications({
  cv,
  theme,
  styles,
}: {
  cv: CV
  theme: PdfTheme
  styles: ReturnType<typeof stylesFor>
}) {
  if (cv.certifications.length === 0) return null
  return (
    <Section title="Certifications" theme={theme} styles={styles}>
      {cv.certifications.map((cert) => (
        <View key={cert.id} style={styles.item}>
          <View style={styles.rowBetween}>
            <View style={styles.grow}>
              <Text style={styles.itemTitle}>{cert.name}</Text>
              <Text style={styles.itemSubtitle}>{cert.issuer}</Text>
            </View>
            <Text style={styles.itemDate}>{cert.date ? formatMonthYear(cert.date) : ""}</Text>
          </View>
        </View>
      ))}
    </Section>
  )
}

function Languages({ cv, theme, styles }: { cv: CV; theme: PdfTheme; styles: ReturnType<typeof stylesFor> }) {
  if (cv.languages.length === 0) return null
  const title = theme.id === "tech" ? "languages[]" : "Languages"
  return (
    <Section title={title} theme={theme} styles={styles}>
      {cv.languages.map((lang) => (
        <Text key={lang.id} style={styles.listLine}>
          {lang.language} - {capitalize(lang.proficiency)}
        </Text>
      ))}
    </Section>
  )
}

function Referees({ cv, theme, styles }: { cv: CV; theme: PdfTheme; styles: ReturnType<typeof stylesFor> }) {
  if (cv.referees.length === 0) return null
  return (
    <Section title={theme.id === "nigerian" ? "Referees" : "References"} theme={theme} styles={styles}>
      {cv.referees.map((ref) => (
        <View key={ref.id} style={styles.item}>
          <Text style={styles.itemTitle}>{ref.name}</Text>
          <Text style={styles.itemSubtitle}>{joinNonEmpty([ref.position, ref.company], CONTACT_SEPARATOR)}</Text>
          {!!joinNonEmpty([ref.email, ref.phone], CONTACT_SEPARATOR) && (
            <Text style={styles.listLine}>{joinNonEmpty([ref.email, ref.phone], CONTACT_SEPARATOR)}</Text>
          )}
          {ref.relationship.trim() && <Text style={styles.muted}>{ref.relationship}</Text>}
        </View>
      ))}
    </Section>
  )
}

function ThemedTemplatePDF({ cv, theme }: { cv: CV; theme: PdfTheme }) {
  const presentation = getNormalizedPresentation(cv)
  const hidden = new Set<SectionKey>(presentation.hiddenSections)
  const styles = stylesFor(theme, presentation)

  const orderedSections = presentation.sectionOrder.filter((key): key is SectionKey =>
    ORDERABLE_SECTION_KEYS.includes(key)
  )

  const renderSection = (key: SectionKey): ReactElement | null => {
    if (hidden.has(key)) {
      return null
    }

    switch (key) {
      case "summary":
        return <Summary key={key} cv={cv} theme={theme} styles={styles} />
      case "experience":
        return <Experience key={key} cv={cv} theme={theme} styles={styles} />
      case "education":
        return <Education key={key} cv={cv} theme={theme} styles={styles} />
      case "skills":
        return <Skills key={key} cv={cv} theme={theme} styles={styles} />
      case "certifications":
        return <Certifications key={key} cv={cv} theme={theme} styles={styles} />
      case "languages":
        return <Languages key={key} cv={cv} theme={theme} styles={styles} />
      case "referees":
        return <Referees key={key} cv={cv} theme={theme} styles={styles} />
      default:
        return null
    }
  }

  const mainSections = orderedSections.filter((key) => MAIN_SECTION_KEYS.includes(key))
  const sideSections = orderedSections.filter((key) => SIDE_SECTION_KEYS.includes(key))
  const renderedSideSections = sideSections
    .map((key) => ({ key, node: renderSection(key) }))
    .filter((item): item is { key: SectionKey; node: ReactElement } => item.node !== null)
  const renderedMainSections = mainSections
    .map((key) => renderSection(key))
    .filter((node): node is ReactElement => node !== null)
  const hasHeader = !hidden.has("personal")
  const hasVisibleSections = renderedMainSections.length > 0 || renderedSideSections.length > 0

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.shell}>
        {theme.topRibbon ? <View style={styles.topRibbon} /> : null}
        {hasHeader ? <Header cv={cv} theme={theme} styles={styles} /> : null}

        <View style={styles.body}>
          {!hasHeader && !hasVisibleSections ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>No visible content to export</Text>
              <Text style={styles.emptyStateText}>
                Add CV content or re-enable hidden sections in Layout & Style before exporting.
              </Text>
            </View>
          ) : null}
          {theme.layout === "split" ? (
            <View style={styles.splitBody}>
              <View style={styles.mainCol}>
                {renderedMainSections}
              </View>
              <View style={styles.sideCol}>
                {renderedSideSections.map((item) => (
                  <View key={item.key} style={styles.sidebarCard}>
                    {item.node}
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View>{orderedSections.map((key) => renderSection(key))}</View>
          )}
        </View>
      </View>
    </Page>
  )
}

export function ModernPDFPage({ cv }: { cv: CV }) {
  return <ThemedTemplatePDF cv={cv} theme={THEMES.modern} />
}

export function ProfessionalPDFPage({ cv }: { cv: CV }) {
  return <ThemedTemplatePDF cv={cv} theme={THEMES.professional} />
}

export function CreativePDFPage({ cv }: { cv: CV }) {
  return <ThemedTemplatePDF cv={cv} theme={THEMES.creative} />
}

export function NigerianPDFPage({ cv }: { cv: CV }) {
  return <ThemedTemplatePDF cv={cv} theme={THEMES.nigerian} />
}

export function MinimalPDFPage({ cv }: { cv: CV }) {
  return <ThemedTemplatePDF cv={cv} theme={THEMES.minimal} />
}

export function ExecutivePDFPage({ cv }: { cv: CV }) {
  return <ThemedTemplatePDF cv={cv} theme={THEMES.executive} />
}

export function TechPDFPage({ cv }: { cv: CV }) {
  return <ThemedTemplatePDF cv={cv} theme={THEMES.tech} />
}
