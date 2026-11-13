"use client";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Link from "next/link";

/* Full-section artwork: background, pill, supporting line, both titles, platter
   and steam are all baked into the file. The Order Now button is deliberately
   absent from it so it can stay a real, tappable element on top.
   Its 1140x643 aspect matches the section's previous 1042x587, so the section
   height is unchanged.

   This is now the fallback only: it is what shows before the slides arrive and
   if an admin has not configured any, so the Home page never renders an empty
   band. */
const SECTION_ARTWORK = "/images/Home_copy.jpeg";

const AUTOPLAY_MS = 5000;

interface Localised { en?: string; ar?: string }
interface Slide {
  _id: string;
  imageUrl: string;
  title?: Localised;
  description?: Localised;
  ctaText?: Localised;
  ctaHref?: string;
}

export default function DishShowcaseSection() {
  const { t, i18n } = useTranslation("common");
  const isAr = i18n.language === "ar";
  const pick = (v?: Localised) => (isAr ? v?.ar || v?.en : v?.en) || "";

  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    /* Active slides only, already ordered by the API. */
    fetch("/api/mixgrill")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setSlides(data);
      })
      .catch(() => {
        /* Leave `slides` empty so the original artwork keeps showing. */
      });
    return () => { cancelled = true; };
  }, []);

  const count = slides.length;
  const go = useCallback(
    (next: number) => { if (count) setIndex(((next % count) + count) % count); },
    [count],
  );

  /* Autoplay only once there is more than one slide, and never while the
     pointer is over the section or the tab is hidden. One timeout per slide:
     any change of slide, auto or manual, or the end of a hover clears it and
     starts a fresh full interval, so only one timer ever runs. */
  useEffect(() => {
    if (count < 2 || paused) return;
    let id: number;
    const tick = () => {
      if (document.hidden) id = window.setTimeout(tick, AUTOPLAY_MS);
      else setIndex((index + 1) % count);
    };
    id = window.setTimeout(tick, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [index, count, paused]);

  /* Keeps the index valid if slides are removed while the page is open. */
  useEffect(() => { if (count && index >= count) setIndex(0); }, [count, index]);

  const current = count ? slides[index] : null;
  const imageSrc = current ? current.imageUrl : SECTION_ARTWORK;
  const heading = current
    ? pick(current.title) || t("about.mixGrill.title", "Mix Grill")
    : t("about.mixGrill.title", "Mix Grill");
  const blurb = current
    ? pick(current.description) ||
      t("about.mixGrill.quote", "A delicious mix of grilled flavors, all on one plate..!")
    : t("about.mixGrill.quote", "A delicious mix of grilled flavors, all on one plate..!");
  /* The button is optional per slide, and deliberately so: a slide's artwork
     often already has one drawn into it, and overlaying a second one on top
     reads as a duplicate. So a slide only gets the real, tappable button when
     an admin has given it button text. The original static artwork has no
     button of its own, so the fallback keeps showing one. */
  const slideCta = current ? pick(current.ctaText) : "";
  const showCta = current ? Boolean(slideCta) : true;
  const ctaLabel = slideCta || t("findMore.orderNow", "Order Now");
  const ctaHref = current?.ctaHref || "/menu";

  const arrow =
    "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-10 sm:w-10";

  return (
    <section
      aria-labelledby="mixgrill-heading"
      aria-roledescription={count > 1 ? "carousel" : undefined}
      /* matches the artwork's own background so the letterbox edges are invisible */
      className="relative w-full overflow-hidden bg-[#90191d]"
      /* Mouse only: phones fire a compatibility mouseenter on every tap and
         no mouseleave, which used to stop autoplay after tapping an arrow. */
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setPaused(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setPaused(false); }}
    >
      {/* Full-bleed. This used to be `mx-auto max-w-[1280px] aspect-[1140/643]`,
          which boxed the slider into a centred 1280px rectangle and left the
          section's maroon showing down both sides on anything wider.

          From md up the height is the viewport minus the fixed navbar, so the
          section fills the screen it is scrolled to without pushing a
          scrollbar's worth of extra page past it. A fixed height rather than a
          ratio, so the section cannot resize as slides rotate.

          Phones keep a banner-shaped box instead. The artwork is roughly 2.4:1
          and a phone viewport is about 1:2, so filling that height would crop
          away everything either side of the food - on this artwork that is both
          titles and the whole supporting line. Width still goes edge to edge,
          which is what the full-bleed change is for. */}
      <div className="relative aspect-[1140/643] w-full md:aspect-auto md:h-[calc(100svh-110px)] lg:h-[calc(100svh-88px)]">
        <motion.img
          key={imageSrc}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          src={imageSrc}
          alt={heading}
          /* `cover`, not `contain`: contain fits the whole artwork inside the
             box and pads the rest with the section's maroon, which is the
             letterboxing this section is meant to be rid of. Cover keeps the
             image's own aspect - it crops rather than stretches - so the
             artwork reaches all four edges undistorted.

             On phones it is `contain`, because there the box is already the
             artwork's own shape: contain shows all of it with no crop, and any
             slide of a different ratio pads against a background sampled from
             the artwork rather than losing its copy. */
          className="absolute inset-0 block h-full w-full object-contain object-center md:object-cover"
        />

        {/* The artwork carries this copy visually; kept here so it stays in the
            accessibility tree and stays localised. */}
        <h2 id="mixgrill-heading" className="sr-only">
          {current
            ? heading
            : `${t("about.mixGrill.title", "Mix Grill")} — ${t("about.mixGrill.titleAr", "مشاوي مشكلة")}`}
        </h2>
        <p className="sr-only" aria-live="polite">
          {blurb}
        </p>

        {/* Order Now — always sits on the artwork's empty lower-left, so the
            button reads left of the platter at every width and the section stays
            exactly as tall as the artwork. Physical left/top, not logical: the
            artwork is a fixed raster that does not mirror, so the button must
            land on the same part of it in Arabic. */}
        <div
          className={
            "absolute left-[8%] top-[72%] min-[400px]:left-[11%] sm:left-[14%] sm:top-[73%] lg:left-[17.3%] lg:top-[75%] " +
            (showCta ? "" : "hidden")
          }
        >
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-1 rounded-full bg-brand-scarlet py-1 ps-2.5 pe-0.5 text-white min-[400px]:gap-1.5 min-[400px]:ps-3 min-[400px]:pe-1 sm:gap-2 sm:ps-5 lg:gap-3 lg:py-1.5 lg:ps-7 lg:pe-1.5 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span className="text-[9px] leading-none min-[400px]:text-[10px] sm:text-sm lg:text-lg">
              {ctaLabel}
            </span>
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white min-[400px]:h-5 min-[400px]:w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-brand-scarlet transition-transform duration-300 group-hover:translate-x-0.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-2.5 w-2.5 rtl:rotate-180 min-[400px]:h-3 min-[400px]:w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
              >
                <path d="M5 12h13m0 0-5-5m5 5-5 5" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Controls appear only when there is something to move between, so a
            single slide looks exactly like the section always has. */}
        {count > 1 && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4">
              <button
                type="button"
                onClick={() => go(index - 1)}
                className={arrow}
                aria-label={t("slider.prev", "Previous slide")}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className={arrow}
                aria-label={t("slider.next", "Next slide")}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 sm:bottom-5">
              {slides.map((slide, i) => (
                <button
                  key={slide._id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${t("slider.goTo", "Go to slide")} ${i + 1}`}
                  aria-current={i === index}
                  className={
                    "h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white " +
                    (i === index ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/80")
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
