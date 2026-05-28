import { experienceData, biographyData } from "src/utils/content";
import skillsData from "src/data/skills.json";

const C = {
  base: [8, 8, 15] as [number, number, number],
  border: [32, 32, 53] as [number, number, number],
  muted: [152, 152, 176] as [number, number, number],
  white: [232, 232, 242] as [number, number, number],
  primary: [91, 155, 213] as [number, number, number],
  surface: [18, 18, 29] as [number, number, number],
};

const featuredSkills = skillsData.filter((s) => s.featured).map((s) => s.title);
const otherSkills = skillsData.filter((s) => !s.featured).map((s) => s.title);
const bioText =
  biographyData.find((b) => b.id === "3")?.bio || biographyData[0]?.bio || "";

async function loadImage(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function generateAndOpenCV(): Promise<void> {
  const [{ jsPDF }, profileImg] = await Promise.all([
    import("jspdf"),
    loadImage("/images/profile/profile.png").catch(() => ""),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const sidebarW = 160;
  const mainX = M + sidebarW + 32;
  const mainW = W - M - sidebarW - 32;

  // Background
  doc.setFillColor(...C.base);
  doc.rect(0, 0, W, H, "F");

  // ── Header ──
  let y = M;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(...C.white);
  doc.text("Alvaro Garcia Macias", M, y + 26);
  y += 36;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...C.primary);
  doc.text("FULL STACK DEVELOPER", M, y + 10);
  y += 20;

  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.textWithLink("github.com/badwatt", M, y + 10, {
    url: "https://github.com/badwatt",
  });
  doc.textWithLink("linkedin.com/in/alvaro-garcia-macias", M + 120, y + 10, {
    url: "https://linkedin.com/in/alvaro-garcia-macias",
  });
  y += 20;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(1);
  doc.line(M, y, W - M, y);
  y += 20;

  // ── Sidebar ──
  let sy = y;

  // Profile image
  if (profileImg) {
    try {
      doc.addImage(profileImg, "PNG", M + (sidebarW - 80) / 2, sy, 80, 80);
      sy += 88;
    } catch {
      // image add failed, skip
    }
  }

  // About section
  sy = drawTitle(doc, "ABOUT", M, sy, sidebarW);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  const bioLines = doc.splitTextToSize(bioText, sidebarW);
  doc.text(bioLines, M, sy);
  sy += bioLines.length * 13 + 16;

  // Skills section
  sy = drawTitle(doc, "SKILLS", M, sy, sidebarW);
  let tagX = M;
  for (const s of featuredSkills) {
    const r = drawTag(doc, s, tagX, sy, true, M, sidebarW);
    tagX = r.x;
    sy = r.y;
  }
  for (const s of otherSkills) {
    const r = drawTag(doc, s, tagX, sy, false, M, sidebarW);
    tagX = r.x;
    sy = r.y;
  }

  // ── Main: Experience ──
  let my = y;
  my = drawTitle(doc, "EXPERIENCE", mainX, my, mainW);

  for (const job of experienceData) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...C.white);
    doc.text(job.title, mainX, my);
    my += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(`${job.date_from} — ${job.date_to}`, mainX, my);
    my += 16;

    const desc = job.description;
    const sections = [
      { t: desc.title.one, c: desc.content.one },
      { t: desc.title.two, c: desc.content.two },
      { t: desc.title.three, c: desc.content.three },
      { t: desc.title.four, c: desc.content.four },
    ].filter((s) => s.t && s.c);

    for (const sec of sections) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.white);
      doc.text(sec.t!, mainX, my);
      my += 12;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.muted);
      const lines = doc.splitTextToSize(sec.c!, mainW);
      doc.text(lines, mainX, my);
      my += lines.length * 11 + 6;
    }
    my += 8;
  }

  // ── Footer ──
  const fy = H - 28;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(1);
  doc.line(M, fy - 10, W - M, fy - 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`Generated from ${window.location.hostname}`, M, fy);
  doc.text(String(new Date().getFullYear()), W - M - 40, fy);

  // Open in new tab
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

function drawTitle(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  label: string,
  x: number,
  y: number,
  w: number
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.text(label, x, y);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(x, y + 4, x + w, y + 4);
  return y + 16;
}

function drawTag(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  label: string,
  x: number,
  y: number,
  featured: boolean,
  baseX: number,
  maxX: number
): { x: number; y: number } {
  const tw = doc.getTextWidth(label) + 14;
  if (x + tw > baseX + maxX) {
    x = baseX;
    y += 20;
  }
  if (featured) {
    doc.setFillColor(...C.primary);
    doc.roundedRect(x, y - 10, tw, 15, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.base);
  } else {
    doc.setFillColor(...C.surface);
    doc.setDrawColor(...C.border);
    doc.roundedRect(x, y - 10, tw, 15, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
  }
  doc.text(label, x + 7, y);
  return { x: x + tw + 4, y };
}