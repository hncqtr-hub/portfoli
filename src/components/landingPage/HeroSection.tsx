"use client";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useTranslation } from "react-i18next";
import Link from "next/link";

interface HeroSectionProps {
  initialSettings?: {
    bannerImageUrl: string;
    mobileBannerImageUrl?: string;
  } | null;
}

/* Shown only until the admin-managed banner arrives, or if none is set. */
const FALLBACK_BANNER = "/images/img_rectangle_2.png";

export default function HeroSection({ initialSettings }: HeroSectionProps) {
  const { t } = useTranslation("common");

  const [bannerImageUrl, setBannerImageUrl] = useState(
    initialSettings?.bannerImageUrl || "",
  );
  const [mobileBannerImageUrl, setMobileBannerImageUrl] = useState(
    initialSettings?.mobileBannerImageUrl || "",
  );
  // i18next only knows the visitor's language on the client, so text keeps the
  // server-rendered value until mount (same guard Header uses).
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /* Admin -> Cloudinary -> POST /api/hero -> HeroSettings -> SSR props.
     This client fetch is only the fallback when SSR returned nothing. */
  useEffect(() => {
    if (initialSettings) return;
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/hero");
        if (res.data) {
          if (res.data.bannerImageUrl) setBannerImageUrl(res.data.bannerImageUrl);
          if (res.data.mobileBannerImageUrl)
            setMobileBannerImageUrl(res.data.mobileBannerImageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch hero banner:", error);
      }
    };
    fetchSettings();
  }, [initialSettings]);

  const desktopSrc = bannerImageUrl || FALLBACK_BANNER;
  const heading = mounted ? t("hero.brand", "Hot n Cool") : "Hot n Cool";

  return (
    /* Sits directly under the fixed navbar and fills the rest of the viewport,
       so navbar + hero equal one screen exactly as in the reference. */
    <section
      aria-labelledby="hero-heading"
      /* Offset + height mirror the navbar's own heights, so navbar + hero
         together fill exactly one viewport. */
      className="relative mt-[76px] h-[calc(100svh-36px)] min-h-[520px] w-full overflow-hidden bg-[#2B0506] md:mt-[110px] md:h-[calc(100svh-62px)] lg:mt-[88px] lg:h-[calc(100svh-32px)]"
    >
      {/* Layer 1 — the admin-managed banner, never hardcoded */}
      <picture>
        {mobileBannerImageUrl && (
          <source media="(max-width: 640px)" srcSet={mobileBannerImageUrl} />
        )}
        <img
          key={`${bannerImageUrl}-${mobileBannerImageUrl}`}
          src={desktopSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>

      {/* Layer 2 — scrim behind the copy. The banner is whatever the admin
          uploaded, and a light one leaves the heading unreadable at phone
          widths, where the text sits right on top of the image. Desktop keeps
          its original bare-image look. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:hidden"
      />

      {/* Layer 4 — foreground copy, aligned left as in the reference */}
      <div className="relative z-10 flex h-full w-full flex-col justify-end pb-[17%] sm:pb-[12%] lg:pb-[9%]">
        <div className="mx-auto w-full max-w-[1320px] px-6 sm:px-8 lg:px-10">
          <div className="lg:ps-[16%]">
            <h1
              data-hero-motion=""
              id="hero-heading"
              className="anim-hero-title text-4xl font-bold leading-[1.05] text-[#F6E7C4] sm:text-5xl lg:text-[64px]"
            >
              {heading}
            </h1>

            <p
              data-hero-motion=""
              className="anim-hero-sub mt-4 max-w-[46ch] text-sm leading-[1.6] text-white/90 sm:text-[15px] lg:mt-5"
            >
              {mounted
                ? t("hero.tagline1")
                : "Grills, Juices & Sandwiches, Fast, Fresh & Always Nearby"}
              <br />
              {mounted
                ? t("hero.tagline2")
                : "Proudly Serving Locations, Across Qatar Open 24/7"}
            </p>

            {/* The Order Now CTA lives in the Our Story section below, where it
                straddles this section's bottom edge — see AboutSection. */}
          </div>
        </div>
      </div>
    </section>
  );
}
