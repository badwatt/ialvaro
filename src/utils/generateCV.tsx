import { experienceData, biographyData } from "src/utils/content";
import skillsData from "src/data/skills.json";

const colors = {
  base: [8, 8, 15] as [number, number, number],
  border: [32, 32, 53] as [number, number, number],
  muted: [152, 152, 176] as [number, number, number],
  white: [232, 232, 242] as [number, number, number],
  primary: [91, 155, 213] as [number, number, number],
};

const featuredSkills = skillsData.filter((s) => s.featured).map((s) => s.title);
const otherSkills = skillsData.filter((s) => !s.featured).map((s) => s.title);
const bioText =
  biographyData.find((b) => b.id === "3")?.bio || biographyData[0]?.bio || "";

export async function generateAndOpenCV(): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;

  // Background
  doc.setFillColor(...colors.base);
  doc.rect(0, 0, pageW, pageH, "F");

  // ── Header ──
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(...colors.white);
  doc.text("Alvaro Garcia Macias", margin, y + 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.text("FULL STACK DEVELOPER", margin, y + 48);

  doc.setFontSize(10);
  doc.setTextColor(...colors.primary);
  const linkY = y + 66;
  doc.textWithLink("github.com/badwatt", margin, linkY, {
    url: "https://github.com/badwatt",
  });
  doc.textWithLink(
    "linkedin.com/in/alvaro-garcia-macias",
    margin + 120,
    linkY,
    { url: "https://linkedin.com/in/alvaro-garcia-macias" }
  );

  y += 84;
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);
  y += 24;

  // ── Sidebar / Main layout ──
  const sidebarW = 160;
  const mainX = margin + sidebarW + 32;
  const mainW = contentW - sidebarW - 32;
  let sidebarY = y;
  let mainY = y;

  // Helper: section title
  const drawSectionTitle = (
    title: string,
    x: number,
    yPos: number,
    w: number
  ): number => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...colors.primary);
    doc.text(title.toUpperCase(), x, yPos);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(1);
    doc.line(x, yPos + 4, x + w, yPos + 4);
    return yPos + 18;
  };

  // ── Sidebar: About ──
  sidebarY = drawSectionTitle("About", margin, sidebarY, sidebarW);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colors.muted);
  const bioLines = doc.splitTextToSize(bioText, sidebarW);
  doc.text(bioLines, margin, sidebarY);
  sidebarY += bioLines.length * 14 + 24;

  // ── Sidebar: Skills ──
  sidebarY = drawSectionTitle("Skills", margin, sidebarY, sidebarW);

  const drawTag = (
    label: string,
    x: number,
    yPos: number,
    featured: boolean
  ): { x: number; y: number } => {
    const tw = doc.getTextWidth(label) + 12;
    if (x + tw > margin + sidebarW) {
      x = margin;
      yPos += 20;
    }
    if (featured) {
      doc.setFillColor(...colors.primary);
      doc.roundedRect(x, yPos - 10, tw, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.base);
    } else {
      doc.setFillColor(18, 18, 29);
      doc.setDrawColor(...colors.border);
      doc.roundedRect(x, yPos - 10, tw, 16, 2, 2, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.white);
    }
    doc.text(label, x + 6, yPos);
    return { x: x + tw + 4, y: yPos };
  };

  let tagX = margin;
  for (const s of featuredSkills) {
    const res = drawTag(s, tagX, sidebarY, true);
    tagX = res.x;
    sidebarY = res.y;
  }
  for (const s of otherSkills) {
    const res = drawTag(s, tagX, sidebarY, false);
    tagX = res.x;
    sidebarY = res.y;
  }
  sidebarY += 24;

  // ── Main: Experience ──
  mainY = drawSectionTitle("Experience", margin, mainY, mainW);

  for (const job of experienceData) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.white);
    doc.text(job.title, mainX, mainY);
    mainY += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text(`${job.date_from} — ${job.date_to}`, mainX, mainY);
    mainY += 14;

    const desc = job.description;
    const sections = [
      { title: desc.title.one, content: desc.content.one },
      { title: desc.title.two, content: desc.content.two },
      { title: desc.title.three, content: desc.content.three },
      { title: desc.title.four, content: desc.content.four },
    ].filter((s) => s.title && s.content);

    for (const sec of sections) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.white);
      doc.text(sec.title!, mainX, mainY);
      mainY += 13;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.muted);
      const lines = doc.splitTextToSize(sec.content!, mainW);
      doc.text(lines, mainX, mainY);
      mainY += lines.length * 12 + 4;
    }
    mainY += 10;
  }

  // ── Footer ──
  const footerY = pageH - 32;
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(1);
  doc.line(margin, footerY - 12, pageW - margin, footerY - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text(`Generated from ${window.location.hostname}`, margin, footerY);
  doc.text(String(new Date().getFullYear()), pageW - margin - 40, footerY);

  // Open in new tab
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}