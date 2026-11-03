import { saveAs as fileSaverSaveAs } from "file-saver";

/** Counts a download for the current tool page. Fire-and-forget; never throws. */
export function trackDownload() {
  try {
    const tool = window.location.pathname.split("/")[1];
    if (!tool) return;
    const body = JSON.stringify({ tool });
    const sent = navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
    }
  } catch {
    /* tracking must never break a download */
  }
}

/** file-saver's saveAs, plus a download count for the admin dashboard. */
export function saveAs(...args: Parameters<typeof fileSaverSaveAs>) {
  fileSaverSaveAs(...args);
  trackDownload();
}
