"use client";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface TimelineBranch {
  name: string;
  phone: string;
  branchNo: string;
}

interface UpcomingBranch {
  name: string;
}

/* Geometry lifted from the reference. The timeline block is treated as a
   701 x 507 canvas; every node and dot below is a percentage of it, so the
   whole composition scales without drifting. */
const BLOCK_W = 701;
const BLOCK_H = 507;

/* Node = badge + card, left-aligned together. Literal class strings so Tailwind
   can see them; physical `left` (not `start`) keeps the composition identical in
   RTL, since the curve itself is not mirrored. */
const NODES = [
  "lg:left-[20.7%] lg:top-[0%] lg:w-[30.7%]",
  "lg:left-[52.8%] lg:top-[36.7%] lg:w-[30.2%]",
  "lg:left-[20.7%] lg:top-[76.5%] lg:w-[30.7%]",
];

/* Dot centres in block coordinates, sitting on the path. */
const DOTS = [
  { x: 399, y: 57 },
  { x: 306, y: 245 },
  { x: 402, y: 448 },
];

/* The winding line: down from dot 1, bulging left through dot 2, back right to
   dot 3, then a short tail. */
const CURVE =
  "M399 57C397 125 307 150 305 232C303 310 358 375 402 448C409 463 400 488 396 505";

export default function BranchesSection() {
  const { t, i18n } = useTranslation("common");

  const branches = t("branches.timeline", {
    returnObjects: true,
  }) as TimelineBranch[];
  const upcomingBranches = t("branches.upcoming", {
    returnObjects: true,
  }) as UpcomingBranch[];
  const branchLabel = t("branches.branchLabel", "Branch");
  const upcomingTitle = t("branches.upcomingTitle", "Upcoming Branches");

  // Helper to get ordinal suffix
  const getOrdinal = (n: string) => {
    const num = parseInt(n, 10);
    if (i18n.language === "ar") return n;
    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (!Array.isArray(branches)) return null;

  return (
    /* Same crimson as the band closing the section above, so the storefront
       overlapping from it lands on a continuous red field. */
    <section
      aria-labelledby="journey-heading"
      className="relative w-full overflow-hidden bg-brand-crimson pb-24 lg:pb-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_62%_62%,rgba(180,20,20,0.55),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1100px] px-6 pt-14 lg:pt-20">
        <h2 data-anim="lift"
          id="journey-heading"
          className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl lg:ms-[53%] lg:text-start lg:text-[52px]"
        >
          {t("branches.sectionTitle", "Our Journey")}
        </h2>

        {/* ---------- Timeline ----------
            Below lg the nodes fall back into a readable stack; from lg they take
            the reference's exact absolute positions. */}
        <div className="relative mt-10 flex flex-col gap-10 lg:mt-6 lg:block lg:aspect-[701/507] lg:gap-0">
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${BLOCK_W} ${BLOCK_H}`}
            fill="none"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          >
            <path
              d={CURVE}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={1.4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {DOTS.map((d) => (
              <circle
                key={`${d.x}-${d.y}`}
                cx={d.x}
                cy={d.y}
                r={7}
                fill="#ffffff"
              />
            ))}
          </svg>

          {branches.map((branch, index) => {
            const node = NODES[index % NODES.length];
            return (
              <motion.div
                key={`${branch.branchNo}-${branch.name}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                className={`relative w-full lg:absolute ${node}`}
              >
                <div>
                  <span className="mb-2 inline-block rounded-md border border-brand-gold bg-[#7C0A10] px-2 py-[3px] text-[10px] font-semibold leading-none text-white sm:text-[11px]">
                    {getOrdinal(branch.branchNo)} {branchLabel}
                  </span>

                  <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.5)] sm:gap-4 sm:px-6">
                    <span
                      aria-hidden="true"
                      className="font-[var(--font-cormorant)] text-[46px] leading-[0.85] text-neutral-900 sm:text-[54px]"
                    >
                      P
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-11 w-px shrink-0 bg-neutral-300 sm:h-12"
                    />
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-tight text-neutral-900 sm:text-[19px]">
                        {branch.name}
                      </p>
                      {branch.phone && (
                        <a
                          href={`tel:${branch.phone}`}
                          className="block text-[24px] font-bold leading-tight text-brand-scarlet transition-opacity hover:opacity-80 sm:text-[29px]"
                        >
                          {branch.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ---------- Upcoming branches (existing content, kept) ---------- */}
        {Array.isArray(upcomingBranches) && upcomingBranches.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <h3 className="text-center text-lg font-semibold text-white/90 sm:text-xl">
              {upcomingTitle}
            </h3>
            <ul className="mt-5 flex flex-wrap justify-center gap-3">
              {upcomingBranches.map((branch) => (
                <li
                  key={branch.name}
                  className="rounded-full border border-white/25 px-4 py-1.5 text-xs text-white/80 sm:text-sm"
                >
                  {branch.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ---------- Bottom decorative shape ---------- */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 z-0 h-[46px] w-full lg:h-[56px]"
      >
        <rect width="1440" height="80" fill="#8B0C12" />
        <path fill="#75080D" d="M1010 0h140l-70 62z" />
      </svg>
    </section>
  );
}
