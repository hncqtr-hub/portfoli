// Self-check for mapEmbed.js. Run:  node src/lib/mapEmbed.check.mjs
import { strictEqual as eq } from "node:assert";
import { normalizeMapEmbed } from "./mapEmbed.js";

const EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3";

// accepted
eq(normalizeMapEmbed(EMBED), EMBED);                       // plain embed url
eq(normalizeMapEmbed("  " + EMBED + "  "), EMBED);         // stray whitespace
eq(normalizeMapEmbed(`<iframe src="${EMBED}" width="600"></iframe>`), EMBED); // pasted snippet
eq(normalizeMapEmbed(`<iframe  loading="lazy"  src='${EMBED}'></iframe>`), EMBED); // single quotes, attrs first
eq(normalizeMapEmbed("https://maps.google.com/maps/embed?pb=x"),
   "https://maps.google.com/maps/embed?pb=x");
eq(normalizeMapEmbed("https://www.google.co.uk/maps/embed?pb=x"),
   "https://www.google.co.uk/maps/embed?pb=x");
eq(normalizeMapEmbed("https://www.google.com/maps/embed/v1/place?key=k&q=Doha"),
   "https://www.google.com/maps/embed/v1/place?key=k&q=Doha");

// Google My Maps: the URL and the snippet "Embed on my site" copies, stored as the bare URL
const MYMAPS = "https://www.google.com/maps/d/u/0/embed?mid=1Bw7NivHLB_Cy1ibxlEWrJV8D2LM5Q1Q&ehbc=2E312F";
eq(normalizeMapEmbed(MYMAPS), MYMAPS);
eq(normalizeMapEmbed(`<iframe src="${MYMAPS}" width="640" height="480"></iframe>`), MYMAPS);
eq(normalizeMapEmbed(`<iframe src="${MYMAPS.replace("&", "&amp;")}" width="640" height="480"></iframe>`), MYMAPS);
eq(normalizeMapEmbed("https://www.google.com/maps/d/embed?mid=abc"), "https://www.google.com/maps/d/embed?mid=abc");
// Google Maps' full "Embed a map" snippet, attributes and line breaks as copied
eq(normalizeMapEmbed(`\n<iframe src="${EMBED}" width="600" height="450" style="border:0;" allowfullscreen=""\n loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>\n`), EMBED);

// refused — these all render an empty box or are unsafe
eq(normalizeMapEmbed("https://maps.app.goo.gl/xgLrJfxEs46iXQT29"), null); // share link
eq(normalizeMapEmbed("https://goo.gl/maps/abc"), null);
eq(normalizeMapEmbed("https://www.google.com/maps/place/Doha"), null);    // place page, not framable
eq(normalizeMapEmbed("http://www.google.com/maps/embed?pb=x"), null);     // not https
eq(normalizeMapEmbed("https://evil.example.com/maps/embed?pb=x"), null);  // wrong host
eq(normalizeMapEmbed("https://google.com.evil.test/maps/embed"), null);   // lookalike host
eq(normalizeMapEmbed("javascript:alert(1)"), null);
eq(normalizeMapEmbed("not a url"), null);
eq(normalizeMapEmbed("https://www.google.com/maps/embedfoo?pb=x"), null);  // not the embed path
eq(normalizeMapEmbed("https://www.google.com/maps/d/embed"), null);        // My Maps without a mid
eq(normalizeMapEmbed("https://www.google.com/maps/d/viewer?mid=abc"), null); // My Maps viewer, not embed
eq(normalizeMapEmbed("https://www.google.com/maps/d/edit?mid=abc"), null);
eq(normalizeMapEmbed("https://www.google.com/maps/d/u/x/embed?mid=abc"), null);
eq(normalizeMapEmbed("http://www.google.com/maps/d/embed?mid=abc"), null);  // not https
eq(normalizeMapEmbed("https://evil.example/maps/d/embed?mid=abc"), null);

// refused — pasted HTML that is not exactly one clean Google <iframe>
eq(normalizeMapEmbed(`<iframe src="javascript:alert(1)"></iframe>`), null);
eq(normalizeMapEmbed(`<iframe src="https://evil.example/maps/embed?pb=x"></iframe>`), null);
eq(normalizeMapEmbed(`<iframe src="${EMBED}" onload="alert(1)"></iframe>`), null);   // event handler
eq(normalizeMapEmbed(`<iframe src="${EMBED}" ONLOAD='x'></iframe>`), null);
eq(normalizeMapEmbed(`<iframe srcdoc="<script>alert(1)</script>" src="${EMBED}"></iframe>`), null);
eq(normalizeMapEmbed(`<iframe src="${EMBED}"></iframe><script>alert(1)</script>`), null); // extra HTML
eq(normalizeMapEmbed(`<p>map</p><iframe src="${EMBED}"></iframe>`), null);
eq(normalizeMapEmbed(`<iframe src="${EMBED}"></iframe><iframe src="${EMBED}"></iframe>`), null); // two frames
eq(normalizeMapEmbed(`<iframe src="${EMBED}" src="https://evil.example/"></iframe>`), null);       // two srcs
eq(normalizeMapEmbed(`<iframe src="${EMBED}">`), null);                       // not closed
eq(normalizeMapEmbed(`<iframe src="${EMBED}"><b>x</b></iframe>`), null);      // content inside
eq(normalizeMapEmbed(`<iframe src=${EMBED}></iframe>`), null);                // unquoted src
eq(normalizeMapEmbed(`<iframe src></iframe>`), null);                         // valueless src
eq(normalizeMapEmbed(`<iframe width="600"></iframe>`), null);                 // no src
eq(normalizeMapEmbed(`<script>alert(1)</script>`), null);
eq(normalizeMapEmbed(`<img src="${EMBED}">`), null);
// refused — a "bare URL" wrapped in HTML or quotes
eq(normalizeMapEmbed(`${EMBED}"><script>alert(1)</script>`), null);
eq(normalizeMapEmbed(`"${EMBED}"`), null);
eq(normalizeMapEmbed(`${EMBED} onload=alert(1)`), null);
eq(normalizeMapEmbed(""), null);
eq(normalizeMapEmbed(null), null);
eq(normalizeMapEmbed(undefined), null);

console.log("mapEmbed.check.mjs: all checks passed");
