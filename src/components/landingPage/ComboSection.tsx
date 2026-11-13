"use client";
import { useTranslation } from "react-i18next";
import { ROSETTE_INK_GOLD, rosetteBorderStyle } from "@/components/ui/rosettePattern";
import { motion } from "framer-motion";
import Link from "next/link";

/* Existing project asset — the red curved upward arrow (668x474, transparent). */
const ARROW_IMAGE = "/images/03.png";

/* All three route to the menu, the project's only ordering destination. */
const CTA_HREF = "/menu";

export default function ComboSection() {
  const { t } = useTranslation("common");

  const heading = t("combo.story.heading", "From a Small Beginning\nto a Growing Legacy");
  const ctas = t("combo.story.ctas", { returnObjects: true }) as string[];

  return (
    /* Cream field with the thin red rule across the top edge */
    <section
      aria-labelledby="legacy-heading"
      className="relative w-full overflow-hidden border-t-[3px] border-hnc-red bg-hnc-cream py-14 md:py-16 lg:pb-[120px] lg:pt-[100px]"
    >
      {/* Text block. Measured off the reference: content 239/457 of the section
          width, two 107-wide columns with a 25 gutter, heading flush with the
          left column rather than centred. */}
      <div className="relative z-10 mx-auto w-full max-w-[800px] px-6">
        {/* ---------- Heading ---------- */}
        <h2 data-anim="slide"
          id="legacy-heading"
          className="whitespace-pre-line text-start font-proza text-3xl font-bold italic leading-[1.08] text-hnc-red sm:text-4xl lg:text-[41px]"
        >
          {heading}
        </h2>

        {/* ---------- Two story columns ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 grid items-start gap-8 md:grid-cols-2 md:gap-[48px] lg:mt-[56px] lg:gap-[76px]"
        >
          <p className="whitespace-pre-line font-proza text-[13px] leading-[1.75] text-neutral-700 sm:text-justify sm:text-[15px] lg:text-[19px]">
            {t("combo.story.left")}
          </p>
          {/* The right cell carries its paragraph and the arrow together, so the
              arrow sits directly under that copy instead of being pushed to the
              foot of the taller left column. */}
          <div>
            <p className="whitespace-pre-line font-proza text-[13px] leading-[1.75] text-neutral-700 sm:text-justify sm:text-[15px] lg:text-[19px]">
              {t("combo.story.right")}
            </p>

            {/* Same asset, same rendered width - only its anchor changed. */}
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.15 }}
              src={ARROW_IMAGE}
              alt=""
              aria-hidden="true"
              className="pointer-events-none mx-auto mt-8 block h-auto w-[52%] max-w-[230px] object-contain sm:w-[40%] md:me-0 md:ms-auto md:mt-10 md:w-[71%] md:max-w-[240px]"
            />
          </div>
        </motion.div>

      </div>

      {/* ---------- Full-bleed flower divider ---------- */}
      {/* The reference runs the pattern the whole width of the section, not just
          the content column, at roughly a 28px pitch. */}
      <div
        aria-hidden="true"
        role="presentation"
        className="relative z-10 mt-10 h-[34px] w-full md:mt-14 md:h-[46px]"
        style={rosetteBorderStyle(32, 26, ROSETTE_INK_GOLD)}
      />

      {/* ---------- CTA row ---------- */}
      {/* Buttons span wider than the text block in the reference: 84-wide each
          with 40 gutters across 333 of the 457 section width. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 mx-auto mt-8 flex w-full max-w-[1100px] flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between lg:mt-[50px]"
      >
        {(Array.isArray(ctas) ? ctas : []).map((label) => (
          <Link
            key={label}
            href={CTA_HREF}
            className="group flex w-full items-center justify-between gap-6 bg-hnc-red py-2 ps-6 pe-2 font-proza text-white transition-opacity duration-300 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hnc-red sm:w-[220px] lg:h-[50px] lg:w-[265px]"
          >
            <span className="text-sm font-semibold sm:text-base">{label}</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-black/20 transition-transform duration-300 group-hover:translate-x-0.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 rtl:rotate-180"
              >
                <path d="M5 12h13m0 0-5-5m5 5-5 5" />
              </svg>
            </span>
          </Link>
        ))}
      </motion.div>
    </section>
  );
}
