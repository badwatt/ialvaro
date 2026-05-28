import type { ExperienceEntry, AboutEntry, SkillEntry } from "src/utils/content";

const PAGE_W = 595;
const PAGE_H = 842;
const M = 36;

const C = {
  base: [8, 8, 15] as [number, number, number],
  surface: [18, 18, 29] as [number, number, number],
  border: [32, 32, 53] as [number, number, number],
  muted: [152, 152, 176] as [number, number, number],
  white: [232, 232, 242] as [number, number, number],
  primary: [91, 155, 213] as [number, number, number],
  accent: [224, 85, 106] as [number, number, number],
};

function parseDate(str: string): number {
  if (str.toLowerCase() === "now") return Date.now();
  const d = new Date(`${str} 01`);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

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

export async function loadImageToPng(url: string, width: number, height: number): Promise<string | null> {
  if (typeof document === "undefined") return Promise.resolve(null);
  try {
    const base64 = await loadImage(url);
    if (!base64) return null;
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 4;
        canvas.height = height * 4;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = base64;
    });
  } catch {
    return null;
  }
}

export function toCircular(base64: string, size: number, scale = 4): Promise<string | null> {
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
      if (!ctx) { resolve(null); return; }
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
      if (currentTitle) sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      currentTitle = line.replace("# ", "").trim();
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    }
  }
  if (currentTitle) sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  return sections;
}

function sectionTitle(doc: any, label: string, x: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.primary);
  doc.text(label.toUpperCase(), x, y);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(1.2);
  doc.line(x, y + 3, x + 28, y + 3);
  return y + 18;
}

function tag(doc: any, label: string, x: number, y: number, featured: boolean, baseX: number, maxX: number): { x: number; y: number } {
  const tw = doc.getTextWidth(label) + 16;
  if (x + tw > baseX + maxX) { x = baseX; y += 22; }
  if (featured) {
    doc.setFillColor(...C.accent);
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
  doc.text(label, x + 8, y + 1);
  return { x: x + tw + 5, y };
}

function measureExperience(doc: any, job: ExperienceEntry, w: number): number {
  let h = 0;
  h += 14 + 18 + 14; // dot spacing + company row + dates
  const sections = parseDescription(job.description);
  for (const sec of sections) {
    h += 13; // sec title
    const lines = doc.splitTextToSize(sec.content, w);
    h += lines.length * 10 + 4;
  }
  h += 20; // card vertical padding
  return h;
}

function drawJob(doc: any, job: ExperienceEntry, x: number, w: number, timelineX: number, startY: number, logo: string | null): number {
  const sections = parseDescription(job.description);
  const cardH = measureExperience(doc, job, w);
  const LOGO = 16;

  // Card background
  doc.setFillColor(...C.surface);
  doc.setDrawColor(...C.border);
  doc.roundedRect(x - 12, startY - 10, w + 24, cardH, 4, 4, "FD");

  // Left accent bar
  doc.setFillColor(...C.accent);
  doc.roundedRect(x - 12, startY - 10, 4, cardH, 2, 2, "F");

  // Dot
  doc.setFillColor(...C.accent);
  doc.circle(timelineX, startY + 6, 3.5, "F");

  let y = startY + 14;

  // Company + logo
  if (logo) {
    try {
      doc.addImage(logo, "PNG", x, y - LOGO + 2, LOGO, LOGO);
    } catch { /* noop */ }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text(job.title, x + (logo ? LOGO + 6 : 0), y);
  y += 18;

  // Dates
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  doc.text(`${job.date_from} — ${job.date_to}`, x, y);
  y += 14;

  for (const sec of sections) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text(sec.title, x, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    const lines = doc.splitTextToSize(sec.content, w);
    doc.text(lines, x, y);
    y += lines.length * 10 + 4;
  }

  return startY + cardH + 14;
}

function continuationHeader(doc: any): number {
  let y = M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text("Alvaro Garcia Macias", M, y + 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.primary);
  doc.text("FULL STACK DEVELOPER", M, y + 22);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(M, y + 28, PAGE_W - M, y + 28);
  return y + 56;
}

function drawFooter(doc: any, profileAltImg: string | null) {
  const footerY = PAGE_H - 24;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(M, footerY - 14, PAGE_W - M, footerY - 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);

  const yearStr = String(new Date().getFullYear());
  const yearW = doc.getTextWidth(yearStr);
  const imgSize = 12;
  const imgX = PAGE_W - M - imgSize;
  const yearX = imgX - 8 - yearW;
  const textY = footerY + imgSize / 4;
  const imgY = footerY - imgSize / 2;

  doc.text(`Generated from ${window.location.hostname}`, M, textY);
  doc.text(yearStr, yearX, textY);

  if (profileAltImg) {
    try { doc.addImage(profileAltImg, "PNG", imgX, imgY, imgSize, imgSize); } catch { /* noop */ }
  }
}

function startPage(doc: any, W: number) {
  doc.setFillColor(...C.base);
  doc.rect(0, 0, W, PAGE_H, "F");
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, W, 3, "F");
}

export async function generateAndOpenCV(
  experienceData: ExperienceEntry[],
  aboutData: AboutEntry[],
  skillsData: SkillEntry[],
): Promise<void> {
  const sortedExperience = [...experienceData].sort((a, b) => parseDate(b.date_from) - parseDate(a.date_from));
  const featuredSkills = skillsData.filter((s) => s.featured).map((s) => s.title);
  const otherSkills = skillsData.filter((s) => !s.featured).map((s) => s.title);

  const expImages = sortedExperience.map((e) => e.image);
  const allImages = [
    "/images/profile/profile.png",
    "/images/profile/profile_alt.png",
    "/social/github.svg",
    "/social/linkedin.svg",
    ...expImages,
  ];

  const [{ jsPDF }, ...rawImages] = await Promise.all([
    import("jspdf"),
    ...allImages.map((u) => loadImage(u).catch(() => "")),
  ]);

  const [profileRaw, profileAltRaw, githubRaw, linkedinRaw, ...expRaws] = rawImages;

  const PROFILE = 72;
  const ALT = 12;
  const ICON = 12;
  const profileImg = profileRaw ? await toCircular(profileRaw, PROFILE) : null;
  const profileAltImg = profileAltRaw ? await toCircular(profileAltRaw, ALT) : null;
  const githubIcon = githubRaw ? await loadImageToPng(githubRaw, ICON, ICON) : null;
  const linkedinIcon = linkedinRaw ? await loadImageToPng(linkedinRaw, ICON, ICON) : null;
  const LOGO = 16;
  const expLogos: (string | null)[] = [];
  for (const raw of expRaws) {
    if (!raw) { expLogos.push(null); continue; }
    const logo = await loadImageToPng(raw, LOGO, LOGO);
    expLogos.push(logo);
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  startPage(doc, W);

  // Header
  let y = M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...C.white);
  doc.text("Alvaro Garcia Macias", M, y + 20);
  y += 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.text("FULL STACK DEVELOPER", M, y + 10);
  y += 16;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(M, y, W - M, y);
  y += 20;

  const sidebarW = 160;
  const mainX = M + sidebarW + 28;
  const mainW = W - M - sidebarW - 28;
  const contW = mainW - 28;
  const CONTENT_W = W - M * 2;

  // Sidebar
  let sy = y;
  if (profileImg) {
    try {
      const imgX = M + (sidebarW - PROFILE) / 2;
      doc.addImage(profileImg, "PNG", imgX, sy, PROFILE, PROFILE);
      doc.setDrawColor(...C.primary);
      doc.setLineWidth(1.5);
      doc.ellipse(imgX + PROFILE / 2, sy + PROFILE / 2, PROFILE / 2, PROFILE / 2, "S");
      sy += PROFILE + 24;
    } catch { /* noop */ }
  }

  // Social links
  if (githubIcon) {
    try { doc.addImage(githubIcon, "PNG", M, sy, ICON, ICON); } catch { /* noop */ }
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.textWithLink("github.com/badwatt", M + ICON + 4, sy + 8, { url: "https://github.com/badwatt" });
  sy += 16;

  if (linkedinIcon) {
    try { doc.addImage(linkedinIcon, "PNG", M, sy, ICON, ICON); } catch { /* noop */ }
  }
  doc.textWithLink("linkedin.com/in/badwatt", M + ICON + 4, sy + 8, { url: "https://linkedin.com/in/badwatt" });
  sy += 34;

  sy = sectionTitle(doc, "ABOUT", M, sy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  const bio = doc.splitTextToSize(getBioText(aboutData), sidebarW - 8);
  doc.text(bio, M, sy);
  sy += bio.length * 11 + 18;

  sy = sectionTitle(doc, "SKILLS", M, sy);
  let tx = M;
  for (const s of featuredSkills) {
    const r = tag(doc, s, tx, sy, true, M, sidebarW); tx = r.x; sy = r.y;
  }
  for (const s of otherSkills) {
    const r = tag(doc, s, tx, sy, false, M, sidebarW); tx = r.x; sy = r.y;
  }
  sy += 20;

  let page = 1;

  const timelineX = mainX + 10;
  const cx = mainX + 28;

  // Experience area (no title)
  y += 8;

  const totalJobs = sortedExperience.length;

  for (let i = 0; i < totalJobs; i++) {
    const job = sortedExperience[i];
    const logo = expLogos[i] ?? null;
    const needed = measureExperience(doc, job, contW) + (i < totalJobs - 1 ? 14 : 0);
    if (y + needed > PAGE_H - M - 36) {
      drawFooter(doc, profileAltImg);
      doc.addPage();
      page++;
      startPage(doc, W);
      y = continuationHeader(doc);
    }
    const startY = y;
    const usePage1 = page === 1;
    const dotX = usePage1 ? timelineX : M + 10;
    const jx = usePage1 ? cx : M + 28;
    const jw = usePage1 ? contW : CONTENT_W - 40;
    y = drawJob(doc, job, jx, jw, dotX, startY, logo);
  }

  drawFooter(doc, profileAltImg);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
