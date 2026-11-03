// Download counters for the admin dashboard. Counts only — no IPs, no file
// names, nothing about the user. Stored in Upstash Redis over its REST API
// (Vercel Marketplace sets KV_REST_API_* or UPSTASH_REDIS_REST_*).
import { createHash, timingSafeEqual } from "node:crypto";

/** Tool slugs that may be counted. Keep in step with scripts/tool-seo-params.json. */
export const TOOLS = ["pdf-to-word", "word-to-pdf", "pdf-to-excel", "excel-to-pdf", "pdf-to-powerpoint", "powerpoint-to-pdf", "pdf-to-jpg", "jpg-to-pdf", "html-to-pdf", "txt-to-pdf", "markdown-to-pdf", "csv-to-pdf", "merge-pdf", "split-pdf", "compress-pdf", "rotate-pdf", "organize-pdf", "extract-pages", "remove-pages", "page-numbers", "crop-pdf", "watermark-pdf", "edit-pdf", "headers-footers", "edit-metadata", "sign-pdf", "ocr-pdf", "unlock-pdf", "protect-pdf", "fill-forms", "redact-pdf", "compare-pdf", "flatten-pdf", "repair-pdf", "extract-text", "extract-images", "auto-redact-pii", "chat-with-pdf"];

const DAY_TTL_SECONDS = 400 * 24 * 3600;

function redisConfig() {
  const env = process.env;
  // Vercel lets the integration use a custom prefix (KV_, STORAGE_, ...), so
  // fall back to any <PREFIX>_REST_API_URL that has a matching token.
  const prefixes = ["KV", "UPSTASH_REDIS", ...Object.keys(env).filter((k) => k.endsWith("_REST_API_URL")).map((k) => k.slice(0, -"_REST_API_URL".length))];
  for (const p of prefixes) {
    const url = env[`${p}_REST_API_URL`] || (p === "UPSTASH_REDIS" ? env.UPSTASH_REDIS_REST_URL : undefined);
    const token = env[`${p}_REST_API_TOKEN`] || (p === "UPSTASH_REDIS" ? env.UPSTASH_REDIS_REST_TOKEN : undefined);
    if (url && token) return { url: url.replace(/\/+$/, ""), token };
  }
  return null;
}

export function storageConfigured() {
  return redisConfig() !== null;
}

/** Runs Redis commands in one round trip; returns each command's result. */
export async function redis(commands) {
  const cfg = redisConfig();
  if (!cfg) throw Object.assign(new Error("Analytics storage is not configured."), { statusCode: 503 });
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${cfg.token}`, "content-type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Analytics storage error (${res.status})`);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

/** UTC calendar day, YYYY-MM-DD, `offset` days ago. */
export function day(offset = 0) {
  return new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
}

export async function countDownload(tool) {
  const key = `dl:day:${day()}`;
  await redis([
    ["HINCRBY", "dl:total", tool, 1],
    ["HINCRBY", key, tool, 1],
    ["EXPIRE", key, DAY_TTL_SECONDS],
  ]);
}

/** Totals plus the last 30 days, per tool and per day. */
export async function readStats() {
  const days = Array.from({ length: 30 }, (_, i) => day(i));
  const results = await redis([["HGETALL", "dl:total"], ...days.map((d) => ["HGETALL", `dl:day:${d}`])]);
  const toMap = (flat) => {
    const m = {};
    for (let i = 0; flat && i < flat.length; i += 2) m[flat[i]] = Number(flat[i + 1]) || 0;
    return m;
  };
  return { total: toMap(results[0]), days: days.map((d, i) => ({ date: d, counts: toMap(results[i + 1]) })) };
}

const digest = (s) => createHash("sha256").update(String(s)).digest();

/** HTTP Basic auth against ADMIN_USER / ADMIN_PASSWORD. Returns "ok", "denied" or "unset". */
export function checkAdmin(req) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return "unset";
  const header = String(req.headers?.authorization || "");
  if (!header.startsWith("Basic ")) return "denied";
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const sep = decoded.indexOf(":");
  if (sep < 0) return "denied";
  const userOk = timingSafeEqual(digest(decoded.slice(0, sep)), digest(user));
  const passOk = timingSafeEqual(digest(decoded.slice(sep + 1)), digest(pass));
  return userOk && passOk ? "ok" : "denied";
}
