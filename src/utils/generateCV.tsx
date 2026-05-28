import skillsData from "src/data/skills.json";
import type { ExperienceEntry, AboutEntry } from "src/utils/content";

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

export function getBioText(data: AboutEntry[]): string {
  return data.find((b) => b.id === "3")?.bio || data[0]?.bio || "";
}

export async function loadImage(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export function toCircular(
  base64: string,
  size: number,
  scale = 4
): Promise<string | null> {
  if (typeof document === "undefined") return Promise.resolve(null);
  const px = size * scale;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = px;
      canvas.height = px;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.beginPath();
      ctx.arc(px / 2, px / 2, px / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, px, px);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = base64;
  });
}

export function parseDescription(raw: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = raw.split("\n");
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
        });
      }
      currentTitle = line.replace("# ", "").trim();
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    }
  }

  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

export async function generateAndOpenCV(
  experienceData: ExperienceEntry[],
  aboutData: AboutEntry[]
): Promise<void> {
  const [{ jsPDF }, profileRaw, profileAltRaw] = await Promise.all([
    import("jspdf"),
    loadImage("/images/profile/profile.png").catch(() => ""),
    loadImage("/images/profile/profile_alt.png").catch(() => ""),
  ]);

  const CIRCULAR_SIZE = 80;
  const CIRCULAR_SMALL = 20;
  const profileImg = profileRaw ? await toCircular(profileRaw, CIRCULAR_SIZE) : null;
  const profileAltImg = profileAltRaw ? await toCircular(profileAltRaw, CIRCULAR_SMALL) : null;

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

  // Profile image circular
  if (profileImg) {
    try {
      const imgX = M + (sidebarW - CIRCULAR_SIZE) / 2;
      doc.addImage(profileImg, "PNG", imgX, sy, CIRCULAR_SIZE, CIRCULAR_SIZE);
      doc.setDrawColor(...C.primary);
      doc.setLineWidth(2);
      doc.ellipse(imgX + CIRCULAR_SIZE / 2, sy + CIRCULAR_SIZE / 2, CIRCULAR_SIZE / 2, CIRCULAR_SIZE / 2, "S");
      sy += CIRCULAR_SIZE + 24;
    } catch {
      // image add failed, skip
    }
  }

  // About section
  sy = drawTitle(doc, "ABOUT", M, sy, sidebarW);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  const bioLines = doc.splitTextToSize(getBioText(aboutData), sidebarW);
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
    doc.text(`${job.date_from} \u2014 ${job.date_to}`, mainX, my);
    my += 16;

    const sections = parseDescription(job.description);
    for (const sec of sections) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.white);
      doc.text(sec.title, mainX, my);
      my += 12;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.muted);
      const lines = doc.splitTextToSize(sec.content, mainW);
      doc.text(lines, mainX, my);
      my += lines.length * 11 + 6;
    }
    my += 8;
  }

  // ── Footer ──
  const footerY = H - 24;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(1);
  doc.line(M, footerY - 14, W - M, footerY - 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`Generated from ${window.location.hostname}`, M, footerY);
  doc.text(String(new Date().getFullYear()), W - M - 36, footerY);

  if (profileAltImg) {
    try {
      const imgSize = CIRCULAR_SMALL;
      const imgX = W - M - 24;
      const imgY = footerY - imgSize;
      doc.addImage(profileAltImg, "PNG", imgX, imgY, imgSize, imgSize);
    } catch {
      // skip small footer image
    }
  }

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
