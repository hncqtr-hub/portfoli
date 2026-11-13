// Self-check for whatsapp.js. Kept out of whatsapp.js itself so no node-only
// import ends up in the client bundle.  Run:  node src/lib/whatsapp.check.mjs
import { strictEqual as eq } from "node:assert";
import { branchWhatsApp, normalizeWhatsApp } from "./whatsapp.js";

// accepted
eq(normalizeWhatsApp("44445844"), "97444445844"); // bare local
eq(normalizeWhatsApp("+974 4444 5844"), "97444445844"); // formatted intl
eq(normalizeWhatsApp("00974 4444 5844"), "97444445844"); // 00 prefix
eq(normalizeWhatsApp("0974 4444 5844"), "97444445844"); // single trunk zero
eq(normalizeWhatsApp("044445844"), "97444445844"); // trunk zero on local
eq(normalizeWhatsApp("97497444445844"), "97444445844"); // doubled cc
eq(normalizeWhatsApp("97444445844"), "97444445844"); // already full
eq(normalizeWhatsApp("+971 50 123 4567"), "971501234567"); // UAE, left alone

// rejected — must be null, never a plausible-looking wrong number
eq(normalizeWhatsApp("444441186"), null); // 9 digits: not a QA number
eq(normalizeWhatsApp("5552222"), null); // too short
eq(normalizeWhatsApp("9741234"), null); // cc + short local
eq(normalizeWhatsApp("44445844 ext 12"), null); // would dial +44 (UK)
eq(normalizeWhatsApp("44445844 x101"), null);
eq(normalizeWhatsApp("44445844-1186"), null); // two numbers in one field
eq(normalizeWhatsApp("4444 5844 / 4444"), null);
eq(normalizeWhatsApp("971971501234567"), null); // doubled non-QA cc, unmarked
eq(normalizeWhatsApp("abc"), null);
eq(normalizeWhatsApp("0"), null);
eq(normalizeWhatsApp(""), null);
eq(normalizeWhatsApp(null), null);
eq(normalizeWhatsApp(undefined), null);

// branch fallback
eq(branchWhatsApp({ whatsapp: "", phone: "44445844" }), "97444445844");
eq(branchWhatsApp({ whatsapp: "444441186", phone: "44445844" }), "97444445844");
eq(
  branchWhatsApp({ whatsapp: "44445844 Ext 12", phone: "44445844" }),
  "97444445844",
); // junk must not shadow a good phone
eq(branchWhatsApp({ phone: "1231254" }), null);
eq(branchWhatsApp(undefined), null);

console.log("whatsapp.check.mjs: all checks passed");
