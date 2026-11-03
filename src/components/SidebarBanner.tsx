import { useState } from "react";
import { getAffiliateOffers } from "@/lib/monetization";

/**
 * Hostinger affiliate banner for the right-hand column of tool pages.
 * Renders nothing until the affiliate URL is set; falls back to a text card
 * when the banner image is missing.
 */
const hostingerOffer = () => getAffiliateOffers().find((o) => o.id === "hostinger");

/** True when a banner will render, so the page can skip the right column. */
export const hasSidebarBanner = () => Boolean(hostingerOffer());

const SidebarBanner = () => {
  const offer = hostingerOffer();
  const [imageFailed, setImageFailed] = useState(false);
  if (!offer) return null;

  const showImage = Boolean(offer.banner) && !imageFailed;
  return (
    <div className="w-full max-w-[300px]">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Sponsored</p>
      <a
        href={offer.url}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
      >
        {showImage ? (
          <img
            src={offer.banner}
            alt={`${offer.name}: ${offer.tagline}`}
            width={300}
            height={250}
            loading="lazy"
            className="block h-auto w-full"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="p-5">
            <p className="text-lg font-bold text-foreground">{offer.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{offer.tagline}</p>
            <span className="mt-4 inline-block rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
              {offer.cta}
            </span>
          </div>
        )}
      </a>
    </div>
  );
};

export default SidebarBanner;
