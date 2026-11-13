// Admin-entered map link -> a URL that is safe to put in an <iframe src>.
//
// Admins paste a few different things into this field:
//   1. an embed URL               https://www.google.com/maps/embed?pb=...    OK
//   2. a Google My Maps embed URL https://www.google.com/maps/d/embed?mid=... OK
//   3. the whole <iframe> snippet  from either "Embed" option                src is extracted
//   4. a share link               https://maps.app.goo.gl/...                refused
//
// A share link is the common mistake: it looks right, saves fine, and then
// renders an empty box because Google serves those pages with an
// X-Frame-Options that forbids framing. Returning null for it lets the caller
// hide the map and lets the API tell the admin why, instead of shipping a
// blank rectangle to the public site.
//
// Only Google's own embed paths (1 and 2) over https are allowed through, so
// this field cannot be used to frame arbitrary third-party content.

/**
 * @param {string | null | undefined} raw value as typed in the admin panel
 * @returns {string | null} an embeddable https URL, or null if unusable
 */
export function normalizeMapEmbed(raw) {
  if (!raw) return null;
  const typed = String(raw).trim();
  if (!typed) return null;

  let candidate;
  if (typed.startsWith("<")) {
    candidate = iframeSrc(typed);
    if (!candidate) return null;
  } else {
    // A bare URL never contains these; HTML or a stray quote around one does.
    if (/[\s<>"]/.test(typed)) return null;
    candidate = typed;
  }

  let url;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  const isGoogleHost =
    host === "google.com" ||
    host === "maps.google.com" ||
    /^(www|maps)\.google(\.[a-z]{2,3})+$/.test(host);
  if (!isGoogleHost) return null;

  // The framable endpoints: /maps/embed (and /maps/embed/v1/...), and Google
  // My Maps' /maps/d/embed or /maps/d/u/<n>/embed, which needs the map's mid.
  const path = url.pathname;
  const isMapsEmbed = path === "/maps/embed" || path.startsWith("/maps/embed/");
  const isMyMapsEmbed = /^\/maps\/d(\/u\/\d+)?\/embed$/.test(path) && Boolean(url.searchParams.get("mid"));
  if (!isMapsEmbed && !isMyMapsEmbed) return null;

  return url.toString();
}

/* The src of a pasted snippet, or null unless the paste is exactly one
   <iframe ...></iframe> with a single quoted src and no event handler or
   srcdoc. Only this URL is kept; the pasted HTML is never stored or rendered. */
function iframeSrc(html) {
  const m = /^<iframe\b([^<>]*)>\s*<\/iframe>$/i.exec(html);
  if (!m) return null;
  const srcs = [];
  for (const [, name, dq, sq, bare] of m[1].matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g)) {
    const attr = name.toLowerCase();
    if (attr.startsWith("on") || attr === "srcdoc") return null;
    if (attr === "src") {
      // Unquoted or valueless: not what Google copies.
      if (bare !== undefined || (dq === undefined && sq === undefined)) return null;
      srcs.push(dq ?? sq);
    }
  }
  if (srcs.length !== 1) return null;
  // Snippets copied from an HTML source can carry &amp; for the query's &.
  return srcs[0].trim().replace(/&amp;/g, "&");
}

/** True when the value is usable as an iframe source. */
export function isEmbeddableMap(raw) {
  return normalizeMapEmbed(raw) !== null;
}

/** Guidance shown to an admin whose map link cannot be embedded. */
export const MAP_HELP =
  "That map link cannot be embedded. In Google Maps choose Share -> Embed a map " +
  "(or in Google My Maps, Share -> Embed on my site), " +
  "then paste the whole <iframe> snippet or just its src URL " +
  "(https://www.google.com/maps/embed?...). A maps.app.goo.gl share link will not work.";
