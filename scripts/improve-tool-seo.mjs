/**
 * SEO enrichment for tool landing pages.
 * Strengthens titles/descriptions for Google; keeps strong intros/steps/FAQs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = path.join(root, "src/lib/tool-content.json");
const toolsSource = readFileSync(path.join(root, "src/lib/tools.ts"), "utf8");
const content = JSON.parse(readFileSync(contentPath, "utf8"));

const toolNames = [
  ...toolsSource.matchAll(
    /name: "([^"]+)",\n\s*description: "([^"]+)",[\s\S]*?route: "([^"]+)"/g
  ),
].map((m) => ({ name: m[1], description: m[2], route: m[3] }));

/** Curated meta descriptions (~150–160 chars) tuned for search queries. */
const metaByRoute = {
  "/pdf-to-word":
    "Convert PDF to Word (.docx) free online. Editable text, tables and layout — no sign-up, no watermark. Fast PDF to DOCX with PDFRobin.",
  "/word-to-pdf":
    "Convert Word to PDF free online. Turn .docx into a shareable PDF — no sign-up, no watermark. Fast DOCX to PDF with PDFRobin.",
  "/compress-pdf":
    "Compress PDF free online to reduce file size. Shrink large PDFs for email or upload — no sign-up. Fast PDF compressor in your browser.",
  "/merge-pdf":
    "Merge PDF files free online. Combine multiple PDFs into one document in any order — no sign-up. Fast PDF merger in your browser.",
  "/split-pdf":
    "Split PDF free online. Extract pages or divide a PDF into separate files — no sign-up. Fast PDF splitter in your browser.",
  "/pdf-to-jpg":
    "Convert PDF to JPG free online. Export each page as a high-quality JPEG image — no sign-up. Fast PDF to JPG with PDFRobin.",
  "/jpg-to-pdf":
    "Convert JPG or PNG to PDF free online. Combine images into one PDF — no sign-up, no watermark. Fast image to PDF with PDFRobin.",
  "/pdf-to-excel":
    "Convert PDF to Excel free online. Extract tables into an editable spreadsheet — no sign-up. Fast PDF to XLSX with PDFRobin.",
  "/excel-to-pdf":
    "Convert Excel to PDF free online. Turn spreadsheets into a shareable PDF — no sign-up. Fast XLSX to PDF with PDFRobin.",
  "/pdf-to-powerpoint":
    "Convert PDF to PowerPoint free online. Turn pages into editable PPTX slides — no sign-up. Fast PDF to PPT with PDFRobin.",
  "/powerpoint-to-pdf":
    "Convert PowerPoint to PDF free online. Export PPTX as a fixed PDF — no sign-up. Fast PowerPoint to PDF with PDFRobin.",
  "/edit-pdf":
    "Edit PDF free online. Add text, images and annotations in your browser — no sign-up. Simple PDF editor with PDFRobin.",
  "/sign-pdf":
    "Sign PDF free online. Draw or type your signature and place it on the page — no sign-up. Fast e-sign PDF with PDFRobin.",
  "/ocr-pdf":
    "OCR PDF free online. Make scanned PDFs searchable and copyable — no sign-up. Optical character recognition with PDFRobin.",
  "/unlock-pdf":
    "Unlock PDF free online. Remove PDF password restrictions you know — no sign-up. Open protected PDFs with PDFRobin.",
  "/protect-pdf":
    "Protect PDF free online. Add a password so others need it to open the file — no sign-up. Encrypt PDFs with PDFRobin.",
  "/rotate-pdf":
    "Rotate PDF free online. Fix sideways or upside-down pages permanently — no sign-up. Rotate PDF pages with PDFRobin.",
  "/organize-pdf":
    "Organize PDF free online. Reorder, rotate or delete pages in one place — no sign-up. Rearrange PDF pages with PDFRobin.",
  "/watermark-pdf":
    "Add a watermark to PDF free online. Place text or an image across pages — no sign-up. Watermark PDFs with PDFRobin.",
  "/html-to-pdf":
    "Convert HTML or a web page URL to PDF free online. Save pages as PDF — no sign-up. HTML to PDF with PDFRobin.",
  "/extract-pages":
    "Extract pages from PDF free online. Save selected pages as a new PDF — no sign-up. Pull pages out with PDFRobin.",
  "/remove-pages":
    "Remove pages from PDF free online. Delete unwanted pages and download a clean file — no sign-up. Edit page list with PDFRobin.",
  "/page-numbers":
    "Add page numbers to PDF free online. Choose position and style — no sign-up. Number PDF pages with PDFRobin.",
  "/crop-pdf":
    "Crop PDF free online. Trim margins or cut to a custom area — no sign-up. Crop PDF pages with PDFRobin.",
  "/fill-forms":
    "Fill PDF forms free online. Type into fillable fields and save — no sign-up. Complete PDF forms with PDFRobin.",
  "/redact-pdf":
    "Redact PDF free online. Permanently black out sensitive text and images — no sign-up. Secure redaction with PDFRobin.",
  "/compare-pdf":
    "Compare two PDFs free online. Spot text and layout differences side by side — no sign-up. PDF diff with PDFRobin.",
  "/flatten-pdf":
    "Flatten PDF free online. Bake form fields and annotations into static pages — no sign-up. Lock PDFs with PDFRobin.",
  "/txt-to-pdf":
    "Convert TXT to PDF free online. Turn plain text into a clean PDF document — no sign-up. Text to PDF with PDFRobin.",
};

const introExtra = {
  "/pdf-to-word":
    " Search for “PDF to Word” when you need DOCX you can edit in Microsoft Word, Google Docs, or LibreOffice.",
  "/word-to-pdf":
    " Ideal when a client or printer asks for PDF instead of an editable Word file.",
  "/compress-pdf":
    " Useful before email attachments, uploads, or sharing on mobile.",
  "/merge-pdf":
    " Common for combining contracts, scanned chapters, or invoice packs into one file.",
  "/split-pdf":
    " Use it to share only the pages someone needs without sending the whole document.",
  "/ocr-pdf":
    " After OCR, you can search, select, and copy text that was previously stuck in an image.",
  "/redact-pdf":
    " Unlike drawing a black box on top, true redaction removes the underlying content.",
  "/html-to-pdf":
    " Paste a public URL or upload HTML when you need a printable snapshot of a page.",
};

const extraFaqs = {
  privacy:
    "Most tools run in your browser. PDF to Word, Word to PDF, and HTML to PDF from a URL send the file (or page address) for conversion only — PDFRobin does not keep a copy.",
  free: "Yes. PDFRobin tools are free to use with no account and no watermark added to your file.",
  signup: "No. Open the tool, add your file, and download the result. No registration is required.",
};

function clampMeta(text, max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 100 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}

function improve(entry, name, description, route) {
  const lower = name.toLowerCase();
  const title = `${name} Free Online — No Sign-Up | PDFRobin`;
  const metaDescription = clampMeta(
    metaByRoute[route] ||
      `${description} Free online ${lower} — no sign-up, no watermark. Try PDFRobin.`
  );

  let intro = entry.intro?.trim() || "";
  if (intro.length < 160) {
    intro = `${description} Use this free online ${lower} tool: upload your file, run the tool, and download the result. No account is required and PDFRobin does not keep your document.`;
  }
  const bonus = introExtra[route];
  if (bonus && !intro.includes(bonus.trim().slice(0, 40))) {
    intro = `${intro.replace(/\s+$/, "")}${bonus}`;
  }

  const steps =
    entry.steps?.length >= 3
      ? entry.steps
      : [
          `Open the free ${name} tool and add your file.`,
          `Adjust any options if needed, then start processing.`,
          `Download your finished file when processing completes.`,
        ];

  const faqs = [...(entry.faqs || [])];
  const have = (q) => faqs.some((f) => f.q.toLowerCase().includes(q));
  if (!have("free")) faqs.push({ q: `Is ${name} free?`, a: extraFaqs.free });
  if (!have("sign") && !have("account") && !have("register")) {
    faqs.push({ q: "Do I need to create an account?", a: extraFaqs.signup });
  }
  if (!have("upload") && !have("private") && !have("browser") && !have("safe")) {
    faqs.push({ q: "Is my file private?", a: extraFaqs.privacy });
  }
  if (!have("mobile") && !have("phone")) {
    faqs.push({
      q: `Can I use ${name} on my phone?`,
      a: `Yes. ${name} works in mobile browsers as well as on desktop — open the page, pick your file, and download when ready.`,
    });
  }
  if (!have("best") && !have("how do i") && !have("how to")) {
    faqs.push({
      q: `How do I ${lower} online for free?`,
      a: `Open PDFRobin’s ${name} page, upload your file, follow the on-screen steps, and download the result. No software install or account is required.`,
    });
  }

  return {
    name,
    title,
    description: metaDescription,
    intro,
    steps,
    faqs: faqs.slice(0, 8),
  };
}

const next = {};
for (const tool of toolNames) {
  const existing = content[tool.route] || {};
  next[tool.route] = improve(existing, tool.name, tool.description, tool.route);
}
for (const route of Object.keys(content)) {
  if (!next[route]) next[route] = content[route];
}

writeFileSync(contentPath, JSON.stringify(next, null, 2) + "\n");
console.log(`Updated SEO for ${toolNames.length} tools`);
