import { useState } from "react";
import { getAffiliateOffers } from "@/lib/monetization";

/**
 * Hostinger affiliate banner for the right-hand column of tool pages: the
 * image alone, linked. Renders nothing until both the affiliate URL and the
 * banner image are set, or if the image fails to load.
 */
const hostingerOffer = () => getAffiliateOffers().find((o) => o.id === "hostinger" && o.banner);

/** True when a banner will render, so the page can skip the right column. */
export const hasSidebarBanner = () => Boolean(hostingerOffer());

const SidebarBanner = () => {
  const offer = hostingerOffer();
  const [imageFailed, setImageFailed] = useState(false);
  if (!offer || imageFailed) return null;

  return (
    <a
      href={offer.url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="block w-full max-w-[300px] overflow-hidden rounded-xl"
    >
      <img
        src={offer.banner}
        alt={`${offer.name}: ${offer.tagline}`}
        width={300}
        height={250}
        loading="lazy"
        className="block h-auto w-full"
        onError={() => setImageFailed(true)}
      />
    </a>
  );
};

export default SidebarBanner;
