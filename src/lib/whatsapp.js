// Phone -> wa.me digits. Qatar numbers are 8 local digits behind country code
// 974 (the site's own contact number, 974 4444 5844, is branch "Al Wukair"
// phone 44445844). Anything that isn't a recognisable shape returns null so the
// caller can disable the link rather than open a broken chat — we never pad or
// guess missing digits.
//
// A number outside Qatar is only accepted when it was typed with a + or 00
// international marker. Without that, "44445844 ext 12" would collapse to the
// 10-digit 4444584412 and get dialled as a UK number, which is worse than
// refusing it: admin input is free text and nothing downstream re-checks it.

const QA = "974";

/**
 * @param {string | null | undefined} raw number as typed in the admin panel
 * @param {string} [cc] default country code for bare local numbers
 * @returns {string | null} digits for https://wa.me/<digits>, or null if unusable
 */
export function normalizeWhatsApp(raw, cc = QA) {
  if (!raw) return null;
  const typed = String(raw);
  const markedInternational = /^\s*(\+|00)/.test(typed);
  let d = typed.replace(/\D/g, "").replace(/^0+/, ""); // trunk/intl zeros
  if (!d) return null;

  while (d.startsWith(cc + cc)) d = d.slice(cc.length); // 974974… typed twice

  if (d.startsWith(cc)) {
    const local = d.slice(cc.length);
    return local.length === 8 ? cc + local : null;
  }
  if (d.length === 8) return cc + d; // bare local number
  if (markedInternational && d.length >= 10 && d.length <= 15) return d;
  return null; // unrecognisable — caller disables the row
}

/** Prefer the dedicated WhatsApp number, fall back to the branch phone. */
export function branchWhatsApp(branch) {
  return (
    normalizeWhatsApp(branch?.whatsapp) ?? normalizeWhatsApp(branch?.phone)
  );
}

/** Guidance shown to an admin whose WhatsApp number cannot be dialled. */
export const WA_HELP =
  "That WhatsApp number is not usable. Enter 8 digits for a Qatar number " +
  "(for example 4444 5844), or include the country code with a + for anywhere " +
  "else (for example +91 94955 26159).";
