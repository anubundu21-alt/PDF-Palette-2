import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const KEY = "pdfrobin-consent";

type Choice = "granted" | "denied";

const readChoice = (): Choice | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

declare global {
  interface Window {
    pdfrobinLoadPixel?: () => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Asks before any advertising cookie is set. The Meta Pixel (index.html) loads
 * only once the visitor accepts; "Change cookie settings" on the Privacy page
 * reopens this banner via the `pdfrobin:cookie-settings` event.
 */
const CookieConsent = () => {
  const [open, setOpen] = useState(() => readChoice() === null);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener("pdfrobin:cookie-settings", reopen);
    return () => window.removeEventListener("pdfrobin:cookie-settings", reopen);
  }, []);

  const choose = (choice: Choice) => {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* storage blocked: the choice lasts for this page view only */
    }
    setOpen(false);
    if (choice === "granted") {
      window.pdfrobinLoadPixel?.();
      window.fbq?.("consent", "grant");
    } else {
      window.fbq?.("consent", "revoke");
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We’d like to use cookies, including the Meta Pixel, to measure our ads. Your files are never shared.{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => choose("denied")}>
            Decline
          </Button>
          <Button size="sm" onClick={() => choose("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
