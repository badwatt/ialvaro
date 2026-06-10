import type { ExperienceEntry, AboutEntry, SkillEntry } from "src/utils/content";
import { pickAssetByLuminance, type CVTheme, type CVThemeColors } from "src/utils/cvThemes";
import {
  tokenize,
  parseExperienceSubgroups,
  extractPeriodTitle,
  stripExtractedTitleAndSubtitle,
  type Token,
} from "src/utils/markdown";
import type { Tokens } from "marked";

const PAGE_W = 595;
const PAGE_H = 842;
const M = 36;

type CVColors = {
  base: CVThemeColors["base"];
  surface: CVThemeColors["surface"];
  border: CVThemeColors["border"];
  muted: CVThemeColors["muted"];
  white: CVThemeColors["text"];
  primary: CVThemeColors["primary"];
  accent: CVThemeColors["accent"];
};

function buildColors(colors: CVThemeColors): CVColors {
  return {
    base: colors.base,
    surface: colors.surface,
    border: colors.border,
    muted: colors.muted,
    white: colors.text,
    primary: colors.primary,
    accent: colors.accent,
  };
}

export function parseDate(str: string): number {
  if (str.toLowerCase() === "now") return Date.now();
  const d = new Date(`${str} 01`);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export function getBioText(data: AboutEntry[]): string {
  return data[0]?.bio ?? "";
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

export async function loadImageToPng(
  url: string,
  width: number,
  height: number,
): Promise<string | null> {
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
        if (!ctx) {
          resolve(null);
          return;
        }
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

export function parseDescription(raw: string): Token[] {
  return tokenize(raw);
}

function getListItemInline(item: Tokens.ListItem): Token[] {
  // A list item can be either "tight" (tokens = [Text]) or "loose"
  // (tokens = [Paragraph, Space, Paragraph, ...]). We want the inline
  // tokens of the first content block so the marker and the text line
  // up. For loose items, the first paragraph's tokens are used; for tight
  // items, the text token's tokens are used.
  for (const t of item.tokens) {
    if (t.type === "paragraph") {
      const p = t as Tokens.Paragraph;
      return p.tokens as Token[];
    } else if (t.type === "text") {
      const text = t as Tokens.Text;
      return text.tokens as Token[];
    }
  }
  return [];
}

function measureText(doc: any, text: string, w: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, w);
  return lines.length * lineHeight;
}

function measureToken(doc: any, token: Token, w: number): number {
  switch (token.type) {
    case "heading": {
      const depth = (token as Tokens.Heading).depth;
      const lineHeight = depth === 1 ? 14 : 13;
      return measureText(doc, (token as Tokens.Heading).text, w, lineHeight) + 2;
    }
    case "paragraph":
      return measureText(doc, (token as Tokens.Paragraph).text, w, 11) + 2;
    case "list": {
      const list = token as Tokens.List;
      let h = 2;
      for (const item of list.items) {
        const inline = getListItemInline(item);
        let inlineText = "";
        for (const t of inline) {
          const txt = (t as { text?: string }).text;
          if (txt) inlineText += txt;
        }
        h += measureText(doc, inlineText, w - 14, 11) + 3;
      }
      return h + 2;
    }
    case "blockquote": {
      const bq = token as Tokens.Blockquote;
      let h = 2;
      for (const t of bq.tokens) {
        h += measureToken(doc, t as Token, w - 14);
      }
      return h + 4;
    }
    case "code": {
      const code = token as Tokens.Code;
      const lineH = 11;
      return code.text.split("\n").length * lineH + 10;
    }
    default:
      return 0;
  }
}

export function measureMarkdown(doc: any, raw: string, w: number): number {
  let h = 0;
  let first = true;
  for (const token of parseDescription(raw)) {
    if (token.type === "space") continue;
    if (!first) h += 4;
    first = false;
    h += measureToken(doc, token, w);
  }
  return h;
}

function sectionTitle(doc: any, C: CVColors, label: string, x: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.primary);
  doc.text(label.toUpperCase(), x, y);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(1.2);
  doc.line(x, y + 3, x + 28, y + 3);
  return y + 18;
}

function tag(
  doc: any,
  C: CVColors,
  label: string,
  x: number,
  y: number,
  featured: boolean,
  baseX: number,
  maxX: number,
): { x: number; y: number } {
  const tw = doc.getTextWidth(label) + 16;
  if (x + tw > baseX + maxX) {
    x = baseX;
    y += 22;
  }
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

function drawInline(
  doc: any,
  C: CVColors,
  tokens: Token[],
  x: number,
  w: number,
  y: number,
): number {
  // Walk inline tokens and draw them left-to-right with the right font style.
  // Word-wrap is handled per-chunk; we just print each chunk on the current line
  // using its own font + size, then advance y if any chunk wrapped.
  // Returns y advanced by at least one line height (lineH) so callers can
  // stack the next block without overlap.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);

  let cursorX = x;
  const lineH = 11;
  let maxLines = 1;
  const startY = y;

  const drawChunk = (text: string, style: "normal" | "bold" | "italic") => {
    doc.setFont("helvetica", style);
    const lines = doc.splitTextToSize(text, w - (cursorX - x));
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i > 0) {
        y += lineH;
        cursorX = x;
      }
      doc.text(line, cursorX, y);
      cursorX += doc.getTextWidth(line);
    }
    if (lines.length > maxLines) maxLines = lines.length;
  };

  for (const t of tokens) {
    if (t.type === "br") {
      y += lineH;
      cursorX = x;
      // Track the number of lines drawn so far so the return value reflects
      // the full block height even if a later chunk draws fewer lines.
      maxLines = Math.floor((y - startY) / lineH) + 1;
      continue;
    }
    const text = (t as unknown as { text?: string }).text ?? "";
    if (!text) continue;
    if (t.type === "strong") {
      drawChunk(text, "bold");
    } else if (t.type === "em") {
      drawChunk(text, "italic");
    } else {
      drawChunk(text, "normal");
    }
  }

  // Always advance by at least one line height, even when text didn't wrap
  // or when no chunks were drawn. This keeps callers from stacking blocks
  // on top of each other.
  return startY + lineH * maxLines;
}

function drawMarkdownToken(
  doc: any,
  C: CVColors,
  token: Token,
  x: number,
  w: number,
  startY: number,
): number {
  let y = startY;
  switch (token.type) {
    case "heading": {
      const h = token as Tokens.Heading;
      const depth = h.depth;
      const size = depth === 1 ? 11 : depth === 2 ? 10 : 9.5;
      const lineH = depth === 1 ? 14 : 13;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(...C.primary);
      const lines = doc.splitTextToSize(h.text, w);
      for (const line of lines) {
        doc.text(line, x, y);
        y += lineH;
      }
      break;
    }
    case "paragraph": {
      const p = token as Tokens.Paragraph;
      const inlineTokens: Token[] = p.tokens as Token[];
      y = drawInline(doc, C, inlineTokens, x, w, y);
      break;
    }
    case "list": {
      const list = token as Tokens.List;
      y += 2;
      for (let i = 0; i < list.items.length; i++) {
        const item = list.items[i];
        const marker = list.ordered ? `${i + 1}.` : "•";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...C.accent);
        doc.text(marker, x, y);
        const inline = getListItemInline(item);
        y = drawInline(doc, C, inline, x + 14, w - 14, y);
        y += 3;
      }
      break;
    }
    case "blockquote": {
      const bq = token as Tokens.Blockquote;
      const startY = y;
      for (const t of bq.tokens) {
        y = drawMarkdownToken(doc, C, t as Token, x + 10, w - 10, y);
      }
      // Draw the left rule aligned with the first and last text lines.
      // Text drawn at the baseline `startY` extends roughly from `startY - 7`
      // (ascender of a 9pt helvetica glyph) to `y + 2` (descender of the
      // last line). The line is offset slightly above the visual top and
      // below the visual bottom to bracket the text cleanly.
      doc.setDrawColor(...C.primary);
      doc.setLineWidth(0.6);
      doc.line(x + 6, startY - 12, x + 6, y - 4);
      y += 2;
      break;
    }
    case "code": {
      const code = token as Tokens.Code;
      const lineH = 11;
      const lines = code.text.split("\n");
      const blockH = lines.length * lineH + 8;
      doc.setFillColor(...C.base);
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, w, blockH, 2, 2, "FD");
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.white);
      for (let i = 0; i < lines.length; i++) {
        doc.text(lines[i], x + 4, y + 10 + i * lineH);
      }
      y += blockH;
      break;
    }
    default:
      break;
  }
  return y;
}

const BLOCK_GAP = 4;

export function drawMarkdown(
  doc: any,
  C: CVColors,
  raw: string,
  x: number,
  w: number,
  startY: number,
): number {
  let y = startY;
  let first = true;
  for (const token of parseDescription(raw)) {
    // Drop `hr` tokens here; callers (e.g. drawJob) split on them
    // explicitly so they can render sub-periods with proper spacing
    // instead of a horizontal rule line.
    if (token.type === "space" || token.type === "hr") continue;
    if (!first) y += BLOCK_GAP;
    first = false;
    y = drawMarkdownToken(doc, C, token, x, w, y);
  }
  return y;
}

function measureExperience(doc: any, job: ExperienceEntry, w: number): number {
  let h = 0;
  h += 14 + 18 + 14; // dot spacing + company row + dates
  const subgroups = parseExperienceSubgroups(job.description);
  const CHIP_PAD_TOP = 8;
  const CHIP_PAD_BOTTOM = 8;
  const CHIP_TITLE_H = 11;
  const CHIP_SUBTITLE_H = 11; // subtitle line (9pt) + small gap
  const BODY_TOP_PAD = 10; // breathing room before the body starts
  const CHIP_GAP = 6;
  for (let i = 0; i < subgroups.length; i++) {
    h += CHIP_PAD_TOP;
    h += CHIP_TITLE_H;
    h += CHIP_SUBTITLE_H;
    h += BODY_TOP_PAD;
    h += measureMarkdown(doc, stripExtractedTitleAndSubtitle(subgroups[i]), w);
    h += CHIP_PAD_BOTTOM;
    if (i < subgroups.length - 1) h += CHIP_GAP;
  }
  h += 12; // bottom padding inside the card
  return h;
}

export function drawJob(
  doc: any,
  C: CVColors,
  job: ExperienceEntry,
  x: number,
  w: number,
  timelineX: number,
  startY: number,
  logo: string | null,
): number {
  const cardH = measureExperience(doc, job, w);
  const LOGO = 16;

  // Card background
  doc.setFillColor(...C.surface);
  doc.setDrawColor(...C.border);
  doc.roundedRect(x - 12, startY - 10, w + 24, cardH, 4, 4, "FD");

  // Left accent bar: only when there is a single period. With multiple
  // periods each chip draws its own colored bar; drawing a card-wide
  // bar on top would create a redundant edge.
  const subgroups = parseExperienceSubgroups(job.description);
  if (subgroups.length <= 1) {
    doc.setFillColor(...C.accent);
    doc.roundedRect(x - 12, startY - 10, 4, cardH, 2, 2, "F");
  }

  let y = startY + 14;

  // Company + logo
  if (logo) {
    try {
      doc.addImage(logo, "PNG", x, y - LOGO + 2, LOGO, LOGO);
    } catch {
      /* noop */
    }
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

  for (let i = 0; i < subgroups.length; i++) {
    // Render each period as a chip inside the parent card. Both
    // periods share the same primary color so they read as siblings
    // of one experience, not as two competing entries. A card-wide
    // accent bar is drawn on top of the card (single-period only);
    // for multi-period jobs each chip draws its own 4pt left bar in
    // the primary color to mark the period.
    const meta = extractPeriodTitle(subgroups[i], i);
    const chipColor = C.primary as unknown as [number, number, number];

    // Compute chip body height to draw the chip frame. The body-top
    // pad is wider for multi-period jobs (30pt) than for single-
    // period jobs (2pt) so the chip's body has visual breathing
    // room when the card contains multiple chips stacked together.
    const bodyH = measureMarkdown(doc, stripExtractedTitleAndSubtitle(subgroups[i]), w);
    const chipPadTop = 8;
    const chipPadBottom = 8;
    const chipTitleH = 11;
    const chipSubtitleH = 11;
    const bodyTopPad = subgroups.length > 1 ? 30 : 2;
    const chipH = chipPadTop + chipTitleH + chipSubtitleH + bodyTopPad + bodyH + chipPadBottom;

    // Draw the chip frame: only a subtle base fill (no border, since
    // the parent card already provides one and a nested border would
    // feel busy). The chip is flush with the card's interior
    // (same x and width) so only the card's outline is visible.
    doc.setFillColor(...C.base);
    doc.roundedRect(x - 12, y, w + 24, chipH, 4, 4, "F");

    // Colored left accent bar inside the chip, aligned with the
    // card's accent bar.
    doc.setFillColor(...chipColor);
    doc.rect(x - 12, y, 4, chipH, "F");

    // Title inside the chip.
    const innerX = x + 2;
    let innerY = y + chipPadTop + 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...chipColor);
    doc.text(meta.title, innerX, innerY);

    // Subtitle on its own line below the title.
    if (meta.subtitle) {
      innerY += chipSubtitleH;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...C.muted);
      doc.text(meta.subtitle, innerX, innerY);
    }

    // Body content with the title and subtitle stripped. The body sits
    // to the right of the colored accent bar (4pt) with a small
    // padding. bodyTopPad (10pt) leaves a clear gap between the
    // subtitle and the first body heading so the two never collide.
    const bodyY = y + chipPadTop + chipTitleH + chipSubtitleH + bodyTopPad;
    drawMarkdown(doc, C, stripExtractedTitleAndSubtitle(subgroups[i]), innerX, w + 12, bodyY);

    y += chipH;
    if (i < subgroups.length - 1) y += 6;
  }

  return startY + cardH + 14;
}

function continuationHeader(doc: any, C: CVColors): number {
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

function drawFooter(doc: any, C: CVColors, profileAltImg: string | null) {
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
    try {
      doc.addImage(profileAltImg, "PNG", imgX, imgY, imgSize, imgSize);
    } catch {
      /* noop */
    }
  }
}

function startPage(doc: any, W: number, C: CVColors) {
  doc.setFillColor(...C.base);
  doc.rect(0, 0, W, PAGE_H, "F");
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, W, 3, "F");
}

export async function generateCV(
  theme: CVTheme,
  experienceData: ExperienceEntry[],
  aboutData: AboutEntry[],
  skillsData: SkillEntry[],
): Promise<string> {
  const C = buildColors(theme.colors);
  const sortedExperience = [...experienceData].sort(
    (a, b) => parseDate(b.date_from) - parseDate(a.date_from),
  );
  const featuredSkills = skillsData.filter((s) => s.featured).map((s) => s.title);
  const otherSkills = skillsData.filter((s) => !s.featured).map((s) => s.title);

  const expImages = sortedExperience.map((e) => e.image);
  const githubUrl = pickAssetByLuminance(
    theme.colors.base,
    "/social/github.svg",
    "/social/github_dark.svg",
  );
  const linkedinUrl = pickAssetByLuminance(
    theme.colors.base,
    "/social/linkedin.svg",
    "/social/linkedin_dark.svg",
  );
  const allImages = [
    "/images/profile/profile.png",
    "/images/profile/profile_alt.png",
    githubUrl,
    linkedinUrl,
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
    if (!raw) {
      expLogos.push(null);
      continue;
    }
    const logo = await loadImageToPng(raw, LOGO, LOGO);
    expLogos.push(logo);
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  startPage(doc, W, C);

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
    } catch {
      /* noop */
    }
  }

  // Email
  if (aboutData[0]?.email) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C.white);
    doc.text("@", M + ICON / 2, sy + 9, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.textWithLink(aboutData[0].email, M + ICON + 4, sy + 8, {
      url: `mailto:${aboutData[0].email}`,
    });
  }
  sy += 16;

  // Social links
  if (githubIcon) {
    try {
      doc.addImage(githubIcon, "PNG", M, sy, ICON, ICON);
    } catch {
      /* noop */
    }
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.textWithLink("github.com/badwatt", M + ICON + 4, sy + 8, {
    url: "https://github.com/badwatt",
  });
  sy += 16;

  if (linkedinIcon) {
    try {
      doc.addImage(linkedinIcon, "PNG", M, sy, ICON, ICON);
    } catch {
      /* noop */
    }
  }
  doc.textWithLink("linkedin.com/in/badwatt", M + ICON + 4, sy + 8, {
    url: "https://linkedin.com/in/badwatt",
  });
  const socialBottom = sy + 12;
  sy = socialBottom + 22;

  sy = sectionTitle(doc, C, "ABOUT", M, sy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  const bio = doc.splitTextToSize(getBioText(aboutData), sidebarW - 8);
  doc.text(bio, M, sy);
  sy = sy + (bio.length - 1) * 10 + 10 + 22;

  // Location
  if (aboutData[0]?.location) {
    sy = sectionTitle(doc, C, "LOCATION", M, sy);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.muted);
    doc.text(aboutData[0].location, M, sy);
    sy = sy + 11 + 22;
  }

  // Languages
  if (aboutData[0]?.languages && aboutData[0].languages.length > 0) {
    sy = sectionTitle(doc, C, "LANGUAGES", M, sy);
    for (const lang of aboutData[0].languages) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.white);
      const tw = doc.getTextWidth(`${lang.language} · ${lang.level}`);
      doc.setFillColor(...C.surface);
      doc.setDrawColor(...C.border);
      doc.roundedRect(M, sy - 8, tw + 12, 13, 2, 2, "FD");
      doc.text(`${lang.language} · ${lang.level}`, M + 6, sy + 1);
      sy += 18;
    }
    const langBottom = sy - 18 + 5;
    sy = langBottom + 22;
  }

  // Education
  if (aboutData[0]?.education && aboutData[0].education.length > 0) {
    sy = sectionTitle(doc, C, "EDUCATION", M, sy);
    for (const edu of aboutData[0].education) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.white);
      doc.text(edu.degree, M, sy);
      sy += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      const instText = edu.year ? `${edu.institution} · ${edu.year}` : edu.institution;
      doc.text(instText, M, sy);
      sy += 12;
    }
    const eduBottom = sy - 12 + 8;
    sy = eduBottom + 22;
  }

  sy = sectionTitle(doc, C, "SKILLS", M, sy);
  let tx = M;
  for (const s of featuredSkills) {
    const r = tag(doc, C, s, tx, sy, true, M, sidebarW);
    tx = r.x;
    sy = r.y;
  }
  for (const s of otherSkills) {
    const r = tag(doc, C, s, tx, sy, false, M, sidebarW);
    tx = r.x;
    sy = r.y;
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
      drawFooter(doc, C, profileAltImg);
      doc.addPage();
      page++;
      startPage(doc, W, C);
      y = continuationHeader(doc, C);
    }
    const startY = y;
    const usePage1 = page === 1;
    const dotX = usePage1 ? timelineX : M + 10;
    const jx = usePage1 ? cx : M + 28;
    const jw = usePage1 ? contW : CONTENT_W - 40;
    y = drawJob(doc, C, job, jx, jw, dotX, startY, logo);
  }

  drawFooter(doc, C, profileAltImg);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return url;
}
