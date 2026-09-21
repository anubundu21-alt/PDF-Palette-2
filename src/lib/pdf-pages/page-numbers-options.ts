/**
 * Option types and defaults for the page-numbers tool.
 *
 * Kept free of any pdf-lib import so the UI can read `DEFAULT_PAGE_NUMBERS`
 * without pulling the ~1.1 MB pdf-lib chunk into the initial tool-page load.
 * The rendering code lives in `page-numbers.ts` and loads on demand.
 */
export type NumberPosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export type NumberFace = "sans" | "serif" | "mono";

export interface PageNumberOptions {
  position: NumberPosition;
  /** Template with {n} for the page number and {N} for the total. */
  format: string;
  /** The number printed on the first numbered page. */
  startAt: number;
  /** One-based, inclusive. Pages outside the range are left alone. */
  fromPage: number;
  toPage: number;
  fontSize: number;
  /** Distance from the edge of the page, in points. */
  margin: number;
  face: NumberFace;
  color: { r: number; g: number; b: number };
}

export const DEFAULT_PAGE_NUMBERS: PageNumberOptions = {
  position: "bottom-center",
  format: "{n}",
  startAt: 1,
  fromPage: 1,
  toPage: 0,
  fontSize: 11,
  margin: 28,
  face: "sans",
  color: { r: 0, g: 0, b: 0 },
};
