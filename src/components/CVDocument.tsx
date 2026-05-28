import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
} from "@react-pdf/renderer";
import experienceData from "src/data/experience.json";
import skillsData from "src/data/skills.json";
import biographyData from "src/data/biography.json";

const colors = {
  base: "#08080f",
  surface: "#12121d",
  border: "#202035",
  muted: "#9898b0",
  white: "#e8e8f2",
  primary: "#5b9bd5",
  dark: "#08080f",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.base,
    padding: 40,
    fontFamily: "Helvetica",
    color: colors.white,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 20,
    marginBottom: 24,
  },
  name: {
    fontSize: 36,
    fontWeight: 700,
    color: colors.white,
    letterSpacing: -1,
    lineHeight: 1.1,
  },
  role: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 6,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  contactRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
  },
  contact: {
    fontSize: 10,
    color: colors.muted,
  },
  contactLink: {
    fontSize: 10,
    color: colors.primary,
    textDecoration: "none",
  },
  twoColumn: {
    flexDirection: "row",
    gap: 32,
  },
  sidebar: {
    width: 160,
    gap: 24,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 8,
    alignSelf: "center",
  },
  main: {
    flex: 1,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  bio: {
    fontSize: 10,
    color: colors.muted,
    lineHeight: 1.6,
  },
  skillTag: {
    fontSize: 9,
    color: colors.white,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
    marginRight: 4,
  },
  skillFeatured: {
    fontSize: 9,
    color: colors.dark,
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
    marginRight: 4,
    fontWeight: 700,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  job: {
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.white,
  },
  jobMeta: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 2,
    marginBottom: 6,
  },
  jobDesc: {
    fontSize: 9,
    color: colors.muted,
    lineHeight: 1.5,
  },
  jobLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.white,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: colors.muted,
  },
  footerPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
});

export const getBioText = (data: typeof biographyData): string =>
  data.find((b) => b.id === "3")?.bio || data[0]?.bio || "";

const bioText = getBioText(biographyData);

const featuredSkills = skillsData.filter((s) => s.featured).map((s) => s.title);
const otherSkills = skillsData.filter((s) => !s.featured).map((s) => s.title);

export const CVDocument = ({ domain }: { domain: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>Alvaro Garcia Macias</Text>
        <Text style={styles.role}>Full Stack Developer</Text>
        <View style={styles.contactRow}>
          <Link src="https://github.com/badwatt" style={styles.contactLink}>
            github.com/badwatt
          </Link>
          <Link src="https://linkedin.com/in/alvaro-garcia-macias" style={styles.contactLink}>
            linkedin.com/in/alvaro-garcia-macias
          </Link>
        </View>
      </View>

      <View style={styles.twoColumn}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Image src="/images/profile/profile.png" style={styles.photo} />
          <View>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{bioText}</Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillWrap}>
              {featuredSkills.map((s) => (
                <Text key={s} style={styles.skillFeatured}>{s}</Text>
              ))}
              {otherSkills.map((s) => (
                <Text key={s} style={styles.skillTag}>{s}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Main */}
        <View style={styles.main}>
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experienceData.map((job) => (
              <View key={job.id} style={styles.job}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobMeta}>
                  {job.date_from} — {job.date_to}
                </Text>
                {job.description.title.one && (
                  <>
                    <Text style={styles.jobLabel}>{job.description.title.one}</Text>
                    <Text style={styles.jobDesc}>{job.description.content.one}</Text>
                  </>
                )}
                {job.description.title.two && (
                  <>
                    <Text style={styles.jobLabel}>{job.description.title.two}</Text>
                    <Text style={styles.jobDesc}>{job.description.content.two}</Text>
                  </>
                )}
                {job.description.title.four && (
                  <>
                    <Text style={styles.jobLabel}>{job.description.title.four}</Text>
                    <Text style={styles.jobDesc}>{job.description.content.four}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated from {domain}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.footerText}>{new Date().getFullYear()}</Text>
          <Image src="/images/profile/profile_alt.png" style={styles.footerPhoto} />
        </View>
      </View>
    </Page>
  </Document>
);