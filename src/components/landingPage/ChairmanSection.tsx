"use client";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

/* Real Hot N Cool storefront (Al Wukair, branch 58) — the closest existing asset
   to the branded building in the reference. */
const BUILDING_IMAGE = "/images/al-wukair.jpeg";

/* The reference sets the opening clause of the closing paragraph in bold. */
const LEAD_WORDS = 6;

export default function ChairmanSection() {
  const { t } = useTranslation("common");

  const headline = t("about.chairmanMessage.headline", "A Dream Served\n24 Hours\nWith Passion");
  const p1 = t("about.chairmanMessage.p1");
  const p2 = t("about.chairmanMessage.p2");
  const p3 = t("about.chairmanMessage.p3");

  const p3Words = p3.split(" ");
  const p3Lead = p3Words.slice(0, LEAD_WORDS).join(" ");
  const p3Rest = p3Words.slice(LEAD_WORDS).join(" ");

  return (
    /* No overflow-hidden: the profile card deliberately rises above the section
       to overlap the white foot of the Combo section, as in the reference. */
    <section
      aria-labelledby="chairman-heading"
      className="relative w-full bg-brand-blue pb-16 lg:pb-20"
    >
      {/* Red accent along the bottom edge; the storefront overlaps it */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-0 h-16 bg-brand-crimson lg:h-20"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-16 lg:px-10 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[30%_1fr_1fr] lg:items-start lg:gap-12">
          {/* ---------- Storefront + profile card ---------- */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="-mt-28 rounded-2xl bg-[#141F66] px-5 py-4 shadow-[0_20px_45px_-18px_rgba(0,0,0,0.7)] lg:-mt-32"
            >
              <p className="font-proza text-base font-semibold text-white sm:text-lg">
                {t("about.chairmanMessage.name")}
              </p>
              <p className="mt-1 font-proza text-[11px] leading-snug text-white/70 sm:text-xs">
                {t("about.chairmanMessage.role")}
              </p>
            </motion.div>

            {/* Negative bottom margin equals the red band, so the storefront
                sits across it and stops flush with the section edge. The zoom
                crops the sky and forecourt down to the signage. */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 -mb-16 w-full overflow-hidden rounded-2xl lg:-mb-20"
              style={{ aspectRatio: "3 / 4" }}
            >
              <img
                src={BUILDING_IMAGE}
                alt="A Hot N Cool branch storefront in Qatar"
                className="h-full w-full scale-[1.5] object-cover object-[50%_58%]"
              />
            </motion.div>
          </div>

          {/* ---------- Headline + opening paragraph ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
          >
            <h2
              id="chairman-heading"
              className="whitespace-pre-line font-proza text-3xl font-semibold leading-[1.2] text-white sm:text-4xl lg:text-[38px]"
            >
              {headline}
            </h2>

            {p1 && (
              <p className="mt-6 text-justify font-proza text-[13px] leading-[1.85] text-white/75 lg:mt-8">
                {p1}
              </p>
            )}
          </motion.div>

          {/* ---------- Continuing columns ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:pt-10"
          >
            {p2 && (
              <p className="text-justify font-proza text-[13px] leading-[1.85] text-white/75">
                {p2}
              </p>
            )}
            {p3 && (
              <p className="mt-5 text-justify font-proza text-[13px] leading-[1.85] text-white/75">
                <strong className="font-semibold text-white">{p3Lead}</strong>{" "}
                {p3Rest}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
