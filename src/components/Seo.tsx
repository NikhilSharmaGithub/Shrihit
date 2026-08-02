import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  /** Set for pages that should not be indexed, e.g. checkout and account. */
  noIndex?: boolean;
}

const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

/**
 * Every route previously shared the single title/description baked into
 * index.html, so Google saw one page for the whole catalogue. This sets the
 * per-page tags on mount and restores nothing on unmount, since the next page
 * overwrites them anyway.
 */
const Seo = ({ title, description, image, noIndex }: SeoProps) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
      setMeta('meta[property="og:description"]', "property", "og:description", description);
    }

    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:url"]', "property", "og:url", window.location.href);

    if (image) {
      setMeta('meta[property="og:image"]', "property", "og:image", image);
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);
    }

    setMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex,nofollow" : "index,follow");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;
  }, [title, description, image, noIndex]);

  return null;
};

export default Seo;
