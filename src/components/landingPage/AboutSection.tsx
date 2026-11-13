"use client";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Link from "next/link";
import { rosetteMotifStyle } from "@/components/ui/rosettePattern";

/* The project's original Our Story photograph — portrait, already the crop the
   reference uses. */
const STORY_IMAGE = "/images/02.jpg";

/* Brand name that takes the bold lead-in, per locale. */
const BRAND = { en: "Hot N Cool", ar: "هوت إن كول" };


export default function AboutSection() {
  const { t, i18n } = useTranslation("common");
  const isAr = i18n.language === "ar";

  /* Dedicated Our Story copy — the /about page keeps its own longer
     about.description, so the two stay independent. */
  const displayedText = t("about.story");

  /* Emphasise the first mention of the brand, as the reference does, without
     touching the copy itself. */
  const brand = isAr ? BRAND.ar : BRAND.en;
  const brandAt = displayedText.indexOf(brand);
  const before = brandAt >= 0 ? displayedText.slice(0, brandAt) : displayedText;
  const after = brandAt >= 0 ? displayedText.slice(brandAt + brand.length) : "";

  return (
    /* No overflow-hidden: Order Now deliberately rises above the section to
       straddle the red foot of the hero, as in the reference. */
    <section
      aria-labelledby="our-story-heading"
      className="relative w-full bg-white pt-20 pb-24 md:pt-24 md:pb-28 lg:pb-32"
    >
      {/* Order Now — overlaps the hero/white boundary */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 -translate-y-1/2">
        <div className="mx-auto w-full max-w-[900px] px-6">
          <Link
            href="/menu"
            className="pointer-events-auto inline-flex items-center justify-center bg-[#D8232A] px-10 py-3 text-base font-bold tracking-wide text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-colors duration-300 hover:bg-[#B8161C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D8232A] sm:px-12 sm:text-lg"
          >
            {t("findMore.orderNow", "Order Now")}
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[900px] px-6">
        {/* Kept for semantics/SEO; the reference shows no visible heading */}
        <h2 id="our-story-heading" className="sr-only">
          {t("about.heading", "Our Story")}
        </h2>

        <div className="grid grid-cols-[37fr_52fr] items-center gap-3 sm:gap-6 lg:gap-[8%]">
          {/* Photograph */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] sm:rounded-[26px]"
          >
            <img
              src={STORY_IMAGE}
              alt={t("about.title")}
              className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="whitespace-pre-line text-[11px] leading-[1.45] text-neutral-800 min-[400px]:text-[12px] min-[520px]:text-[14px] sm:text-justify sm:text-[17px] sm:leading-[1.55]">
              {before}
              {brandAt >= 0 && (
                <strong className="font-bold text-neutral-900">{brand}</strong>
              )}
              {after}
            </div>

            {/* Decorative rosette row: six flowers, each turning about its
                own centre.

                One element per flower rather than a repeated background: a
                background image cannot be transformed tile by tile, so a single
                div could only have spun the whole row as one piece. Each cell is
                flex-1 of the row and carries the motif trimmed to its own
                bounds, so the six still meet edge to edge with no gap, and
                `aspect` keeps every cell the asset's own shape. The count is the
                size lever here: with the cells touching, each flower is simply
                the row width divided by the count, so six gives 76px where five
                gave 92px (-17%), and the row's height follows from `aspect`.

                Three draw passes, up from two: the asset's outline is a hairline
                in a 2567px canvas, so a smaller tile puts it back under a pixel
                and it washes out. Repeating the same artwork lifts coverage
                without touching hue - no filter, tint or opacity involved. The spin is CSS
                only - see .rosette-spin in globals.css, which also opts out
                under prefers-reduced-motion. */}
            <div
              aria-hidden="true"
              role="presentation"
              className="mt-4 flex w-full gap-[2%] sm:mt-8"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <span
                  key={i}
                  className="rosette-spin block aspect-[1326/1355] flex-1"
                  style={rosetteMotifStyle(3)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
