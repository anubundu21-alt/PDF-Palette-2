import { TOOLS, checkAdmin, readStats, storageConfigured } from "./_lib/analytics.js";

const NAMES = { jpg: "JPG", pdf: "PDF", ocr: "OCR", html: "HTML", txt: "TXT", csv: "CSV", pii: "PII", powerpoint: "PowerPoint", to: "to", with: "with" };
const label = (slug) =>
  slug.split("-").map((w) => NAMES[w] || w[0].toUpperCase() + w.slice(1)).join(" ");
const n = (v) => Number(v || 0).toLocaleString("en-US");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function page(body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>PDFRobin Downloads</title><style>
:root{--bg:#f7f8fa;--card:#fff;--fg:#0f172a;--muted:#64748b;--line:#e5e7eb;--brand:#e64a0b}
@media (prefers-color-scheme:dark){:root{--bg:#0b0f14;--card:#121821;--fg:#e5e7eb;--muted:#94a3b8;--line:#1f2937;--brand:#f97316}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:960px;margin:0 auto;padding:24px 16px 48px}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:28px 0 10px}
.sub{color:var(--muted);margin:0 0 20px}.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}.tile b{display:block;font-size:26px;font-variant-numeric:tabular-nums}
.tile span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow-x:auto}
table{width:100%;border-collapse:collapse}th,td{padding:9px 14px;text-align:right;border-bottom:1px solid var(--line);white-space:nowrap;font-variant-numeric:tabular-nums}
th:first-child,td:first-child{text-align:left}th{color:var(--muted);font-weight:600;font-size:12px}tr:last-child td{border-bottom:0}
.zero{color:var(--muted)}.bars{display:flex;align-items:flex-end;gap:3px;height:120px;padding:14px}
.bar{flex:1;background:var(--brand);border-radius:3px 3px 0 0;min-height:2px;opacity:.9}
.axis{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;padding:0 14px 10px}
.note{color:var(--muted);font-size:12px;margin-top:20px}</style></head><body><main>${body}</main></body></html>`;
}

function send(res, status, html, extra = {}) {
  res.statusCode = status;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-robots-tag", "noindex, nofollow");
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  res.end(html);
}

export default async function handler(req, res) {
  const auth = checkAdmin(req);
  if (auth === "unset") {
    return send(res, 503, page("<h1>Dashboard not set up</h1><p class=sub>Set ADMIN_USER and ADMIN_PASSWORD in the hosting environment, then redeploy.</p>"));
  }
  if (auth !== "ok") {
    return send(res, 401, page("<h1>Sign in required</h1>"), { "www-authenticate": 'Basic realm="PDFRobin admin", charset="UTF-8"' });
  }
  if (!storageConfigured()) {
    return send(res, 503, page("<h1>Storage not connected</h1><p class=sub>Connect an Upstash Redis database to this project (Vercel → Storage), then redeploy.</p>"));
  }

  let stats;
  try {
    stats = await readStats();
  } catch (error) {
    return send(res, 502, page(`<h1>Could not load stats</h1><p class=sub>${esc(error.message)}</p>`));
  }

  const sumDays = (tool, k) => stats.days.slice(0, k).reduce((s, d) => s + (d.counts[tool] || 0), 0);
  const rows = TOOLS.map((t) => ({ t, today: sumDays(t, 1), d7: sumDays(t, 7), d30: sumDays(t, 30), all: stats.total[t] || 0 }))
    .sort((a, b) => b.all - a.all || b.d30 - a.d30 || a.t.localeCompare(b.t));
  const tot = rows.reduce((s, r) => ({ today: s.today + r.today, d7: s.d7 + r.d7, d30: s.d30 + r.d30, all: s.all + r.all }), { today: 0, d7: 0, d30: 0, all: 0 });
  const daily = stats.days.map((d) => ({ date: d.date, v: Object.values(d.counts).reduce((s, x) => s + x, 0) })).reverse();
  const max = Math.max(1, ...daily.map((d) => d.v));
  const cell = (v) => `<td${v ? "" : " class=zero"}>${n(v)}</td>`;

  send(res, 200, page(`
<h1>PDFRobin downloads</h1><p class=sub>Files downloaded from each tool. Days are UTC.</p>
<div class=tiles>
 <div class=tile><span>Today</span><b>${n(tot.today)}</b></div>
 <div class=tile><span>Last 7 days</span><b>${n(tot.d7)}</b></div>
 <div class=tile><span>Last 30 days</span><b>${n(tot.d30)}</b></div>
 <div class=tile><span>All time</span><b>${n(tot.all)}</b></div>
</div>
<h2>Downloads per day, last 30 days</h2>
<div class=card><div class=bars>${daily.map((d) => `<div class=bar title="${d.date}: ${n(d.v)}" style="height:${(d.v / max) * 100}%"></div>`).join("")}</div>
<div class=axis><span>${daily[0].date}</span><span>${daily[daily.length - 1].date}</span></div></div>
<h2>By tool</h2>
<div class=card><table><thead><tr><th>Tool</th><th>Today</th><th>7 days</th><th>30 days</th><th>All time</th></tr></thead><tbody>
${rows.map((r) => `<tr><td>${esc(label(r.t))}</td>${cell(r.today)}${cell(r.d7)}${cell(r.d30)}${cell(r.all)}</tr>`).join("\n")}
</tbody></table></div>
<p class=note>Counts only: no names, emails, IPs or file details are stored.</p>`));
}
