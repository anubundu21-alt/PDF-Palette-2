/**
 * Opening the file browser.
 *
 * A plain `<input type="file">` is the only way most browsers let a page ask for
 * a file, and what the user then sees is up to the platform:
 *
 *  - On the desktop, `showOpenFilePicker` opens the operating system's own file
 *    explorer straight away, already filtered to the tool's file types. It is
 *    the same dialog the `<input>` would eventually reach, minus the browser's
 *    own detour, so it is used whenever it exists and the `<input>` stays as the
 *    fallback for Firefox and Safari.
 *  - On a phone the `accept` list decides which sources the system offers. Image
 *    tools list image types, which is what makes the photo library appear beside
 *    Files; every other tool lists its exact document types so the camera and
 *    photo entries stay out of the way.
 *
 * Both paths end in `matchesAccept`, so a file that slips through the platform's
 * own filter is still rejected with the tool's message.
 */

export type FilePickerAccept = Record<string, string[]>;

type FilePickerHandle = { getFile: () => Promise<File> };

type ShowOpenFilePicker = (options: {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: { description?: string; accept: Record<string, string[]> }[];
}) => Promise<FilePickerHandle[]>;

/** The native picker, or null when this browser/context cannot use it. */
function nativePicker(): ShowOpenFilePicker | null {
  if (typeof window === "undefined") return null;
  const show = (window as unknown as { showOpenFilePicker?: ShowOpenFilePicker })
    .showOpenFilePicker;
  if (typeof show !== "function" || !window.isSecureContext) return null;
  // A cross-origin frame throws SecurityError; only the top document may ask.
  try {
    if (window.self !== window.top) return null;
  } catch {
    return null;
  }
  return show;
}

export const canUseNativePicker = (): boolean => nativePicker() !== null;

/** The `accept` attribute for the `<input>` fallback: MIME types, then extensions. */
export function acceptAttribute(accept: FilePickerAccept): string {
  const exts = [...new Set(Object.values(accept).flat())];
  return [...Object.keys(accept), ...exts].join(",");
}

/** Does this file match what the tool asked for? Extension or MIME type will do. */
export function matchesAccept(file: File, accept: FilePickerAccept): boolean {
  const name = file.name.toLowerCase();
  // Windows and Android both hand over an empty or generic type for .docx etc.,
  // so the extension is the reliable half of this test.
  const type = (file.type || "").toLowerCase();
  return Object.entries(accept).some(([mime, exts]) => {
    const m = mime.toLowerCase();
    const mimeHit = m === type || (m.endsWith("/*") && type.startsWith(m.slice(0, -1)));
    return mimeHit || exts.some((ext) => name.endsWith(ext.toLowerCase()));
  });
}

/** Chrome rejects a picker that lists the same extension twice. */
function pickerTypes(accept: FilePickerAccept) {
  const seen = new Set<string>();
  const types: { description: string; accept: Record<string, string[]> }[] = [];

  for (const [mime, exts] of Object.entries(accept)) {
    if (mime.includes("*")) continue; // wildcards are not allowed in `types`
    const unique: string[] = [];
    for (const ext of exts) {
      const key = ext.toLowerCase();
      if (!key.startsWith(".") || seen.has(key)) continue;
      seen.add(key);
      unique.push(key);
    }
    if (unique.length === 0) continue;
    const description = unique.map((e) => e.slice(1).toUpperCase()).join(", ");
    types.push({ description, accept: { [mime]: unique } });
  }

  return types;
}

/**
 * Open the OS file explorer. Returns the chosen files, an empty array when the
 * dialog was dismissed, or null when this browser cannot open it — in which case
 * the caller clicks its `<input>` instead.
 */
export async function pickFiles(
  accept: FilePickerAccept,
  multiple: boolean
): Promise<File[] | null> {
  const show = nativePicker();
  if (!show) return null;

  const types = pickerTypes(accept);
  if (types.length === 0) return null;

  try {
    const handles = await show({ multiple, types, excludeAcceptAllOption: false });
    return await Promise.all(handles.map((handle) => handle.getFile()));
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return [];
    return null;
  }
}

/** What the in-editor image and signature pickers take. */
export const IMAGE_ACCEPT: FilePickerAccept = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};
