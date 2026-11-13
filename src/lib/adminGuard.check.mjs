// Self-check: every admin API is limited to the Super Admin, and the public
// reads and forms stay open. Run against a running server, from the project
// root:  node src/lib/adminGuard.check.mjs [baseUrl]
// Role tokens are signed with JWT_SECRET (env, else .env.local) the same way
// login signs them; the secret is never printed.
//
// Every request writes nothing whatever the guard decides: POSTs carry bodies
// the handler rejects before creating anything (and no files), PUT/DELETE
// target an id that does not exist, and routes whose Super Admin request would
// write (hero, gallery create, migrate-gallery) are only probed for refusals.
// So it is safe against any database. Responses are checked, never printed.
import { strictEqual as eq } from "node:assert";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const base = process.argv[2] || "http://localhost:3000";
const secret = (
  process.env.JWT_SECRET ?? /^JWT_SECRET=(.*)$/m.exec(readFileSync(".env.local", "utf8"))?.[1]
)?.trim().replace(/^["']|["']$/g, "");
if (!secret) throw new Error("JWT_SECRET not found in the environment or .env.local");
const missing = "000000000000000000000000";

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const token = (role, { key = secret, exp = now + 600 } = {}) => {
  const unsigned = `${b64({ alg: "HS256" })}.${b64({ role, iat: now, exp })}`;
  return `token=${unsigned}.${createHmac("sha256", key).update(unsigned).digest("base64url")}`;
};

const form = (fields = {}) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
};
const json = (o) => JSON.stringify(o);
const badBranch = () =>
  form({
    name: json({ en: "check", ar: "" }),
    address: json({ en: "check", ar: "" }),
    phone: "44440000",
    mapEmbedUrl: "https://maps.app.goo.gl/not-embeddable",
  });

/* [method, path, body, what the Super Admin gets (null = not sent: it would write)] */
const guarded = [
  ["POST", "/api/branches", badBranch, 400],
  ["PUT", `/api/branches/${missing}`, () => form(), 404],
  ["DELETE", `/api/branches/${missing}`, null, 404],
  ["POST", "/api/team", () => form(), 400],
  ["PUT", `/api/team/${missing}`, () => form(), 404],
  ["DELETE", `/api/team/${missing}`, null, 404],
  ["GET", "/api/mixgrill?all=1", null, 200],
  ["POST", "/api/mixgrill", () => form(), 400],
  ["PUT", `/api/mixgrill/${missing}`, () => form(), 404],
  ["DELETE", `/api/mixgrill/${missing}`, null, 404],
  ["GET", "/api/users", null, 200],
  ["POST", "/api/users", () => json({}), 400],
  ["DELETE", `/api/users/${missing}`, null, 404],
  ["GET", "/api/enquiries", null, 200],
  ["DELETE", `/api/enquiries/${missing}`, null, 404],
  ["GET", "/api/careers", null, 200],
  ["DELETE", `/api/careers/${missing}`, null, 404],
  ["POST", "/api/hero", () => form(), null],
  ["POST", "/api/gallery", () => form(), null],
  ["PUT", `/api/gallery/${missing}`, () => form(), 404],
  ["DELETE", `/api/gallery/${missing}`, null, 404],
  ["POST", "/api/franchise-images", () => json({ imageUrl: "data:image/png;base64,AA" }), 400],
  ["PATCH", "/api/franchise-images", () => json({ ids: [missing] }), 409],
  ["PUT", `/api/franchise-images/${missing}`, () => json({ alt: { en: "check" } }), 404],
  ["DELETE", `/api/franchise-images/${missing}`, null, 404],
  ["POST", "/api/cloudinary/sign", () => json({}), 200],
  ["GET", "/api/migrate-gallery", null, null],
];

const send = (method, path, body, cookie) =>
  fetch(`${base}${path}`, { method, body: body?.(), headers: cookie ? { cookie } : {} });

const UNAUTHORIZED = '{"error":"Unauthorized"}';
const FORBIDDEN = '{"error":"Only the Super Admin can make this change."}';
const refused = [
  ["no session", null, 401, UNAUTHORIZED],
  ["forged superAdmin token", token("superAdmin", { key: "not-the-secret" }), 401, UNAUTHORIZED],
  ["expired superAdmin token", token("superAdmin", { exp: now - 60 }), 401, UNAUTHORIZED],
  ["staff (also any account with no role)", token("staff"), 403, FORBIDDEN],
  ["admin", token("admin"), 403, FORBIDDEN],
];

const publicLists = ["/api/branches", "/api/team", "/api/mixgrill", "/api/gallery", "/api/franchise-images"];
const counts = async () => {
  const out = {};
  for (const path of publicLists) {
    const res = await fetch(`${base}${path}`);
    eq(res.status, 200, `GET ${path} must stay public`);
    out[path] = (await res.json()).length;
  }
  eq((await fetch(`${base}/api/hero`)).status, 200, "GET /api/hero must stay public");
  return out;
};

const before = await counts();
for (const [method, path, body, superStatus] of guarded) {
  for (const [label, cookie, status, text] of refused) {
    const res = await send(method, path, body, cookie);
    eq(res.status, status, `${method} ${path} as ${label}`);
    eq(await res.text(), text, `${method} ${path} as ${label}: response body`);
  }
  /* Both spellings the schema allows get past the guard to the handler. */
  if (superStatus !== null) {
    for (const role of ["superAdmin", "superadmin"]) {
      const res = await send(method, path, body, token(role));
      eq(res.status, superStatus, `${method} ${path} as ${role}`);
      await res.arrayBuffer();
    }
  }
}

/* Public forms stay open but validate; only invalid submissions are sent here. */
for (const [label, body] of [
  ["empty", {}],
  ["bad email", { name: "x", email: "not-an-email", message: "x" }],
  ["non-string", { name: { $ne: "" }, email: "a@b.co", message: "x" }],
  ["too long", { name: "x", email: "a@b.co", message: "x".repeat(5001) }],
]) {
  const res = await fetch(`${base}/api/enquiries`, { method: "POST", body: json(body) });
  eq(res.status, 400, `public enquiry POST (${label}) must be validated, not refused`);
}
eq((await fetch(`${base}/api/careers`, { method: "POST", body: form() })).status, 400, "public careers POST stays open");

const after = await counts();
for (const path of publicLists) eq(after[path], before[path], `${path}: record count changed`);

console.log("adminGuard.check.mjs: all checks passed");
