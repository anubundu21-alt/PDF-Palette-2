import { TOOLS, countDownload, storageConfigured } from "./_lib/analytics.js";
import { guardMethod, readJson, sendJson } from "./_lib/http.js";

/** Counts one download for a tool. Never fails loudly: tracking must not affect users. */
export default async function handler(req, res) {
  if (guardMethod(req, res, "POST")) return;
  try {
    const { tool } = await readJson(req);
    if (!TOOLS.includes(tool)) return sendJson(res, 400, { error: "Unknown tool" });
    if (!storageConfigured()) return sendJson(res, 200, { ok: false, reason: "storage not configured" });
    await countDownload(tool);
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 200, { ok: false, reason: error?.message || "storage error" });
  }
}
