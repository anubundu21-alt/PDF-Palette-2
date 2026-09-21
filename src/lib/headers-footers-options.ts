/**
 * Option type and defaults for the headers/footers tool.
 *
 * Free of any pdf-lib import so the UI can read `DEFAULT_HEADERS_FOOTERS`
 * without pulling the ~1.1 MB pdf-lib chunk into the initial tool-page load.
 */
export type HeaderFooterOptions = {
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  fontSize: number;
  margin: number;
};

export const DEFAULT_HEADERS_FOOTERS: HeaderFooterOptions = {
  headerLeft: "",
  headerCenter: "",
  headerRight: "",
  footerLeft: "",
  // Pre-filled so "Add headers & footers" works without empty-form failure.
  footerCenter: "Page {n} of {N}",
  footerRight: "",
  fontSize: 10,
  margin: 36,
};
