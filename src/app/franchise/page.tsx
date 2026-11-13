"use client";

import React, { useEffect, useRef, useState } from "react";
import { ROSETTE_INK, rosetteBorderStyle } from "@/components/ui/rosettePattern";
import Image from "next/image";
import { loaderFor } from "@/lib/cloudinaryLoader";
import axios from "@/lib/axios";
import { Instagram, Facebook } from "lucide-react";
import { useTranslation } from "react-i18next";
import '@/lib/i18n';
import Footer from "@/components/common/Footer";

/* Gallery photographs are managed in Admin -> Franchise, in position order:
   wide top, tall left, then the two stacked on the right. The API starts out
   holding the bundled shots that used to be hardcoded here. */
interface GalleryPhoto {
  _id: string;
  imageUrl: string;
  alt?: { en?: string; ar?: string };
}

/* One gallery box. It stays empty while the photos load, so the block keeps
   its size. No alt text means decorative, as the bundled photos always were. */
function GalleryFrame({ photo, isAr, sizes, className }: {
  photo?: GalleryPhoto;
  isAr: boolean;
  sizes: string;
  className: string;
}) {
  const alt = (isAr ? photo?.alt?.ar || photo?.alt?.en : photo?.alt?.en) || '';
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {photo && (
        <Image
          key={photo.imageUrl}
          src={photo.imageUrl}
          alt={alt}
          aria-hidden={alt ? undefined : true}
          fill
          sizes={sizes}
          loader={loaderFor(photo.imageUrl)}
          className="object-cover"
        />
      )}
    </div>
  );
}

/* The four figures live in the locale files so they stay editable per language;
   nothing here is admin-managed yet. */
const STAT_KEYS = ['founded', 'restaurants', 'years', 'next'] as const;

/* Same 8-fold rosette the Chairman strip uses, at separator size. */

/* Counts a stat's digits up from 0 the first time it scrolls into view, keeping
   whatever is written around them (`74+`, `450K+`, Arabic `+74`). A value with
   no digits (GCC) never matches and stays as written. SSR, no-JS and
   reduced-motion visitors only ever get the final value; otherwise it drops to
   0 on mount, while still off screen or under data-anim's opacity 0, so the
   swap is never seen. Observer options match RevealObserver so count and fade
   start together. */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState<number | null>(null);
  const m = value.match(/^(\D*)(\d+)(\D*)$/);
  const target = m ? Number(m[2]) : null;

  useEffect(() => {
    const el = ref.current;
    if (
      target === null ||
      !el ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          /* a rAF timestamp can predate `start`, which would count below 0 */
          const p = Math.min(Math.max(now - start, 0) / 1200, 1);
          /* ease-out cubic; the last frame drops back to the literal value */
          setN(p < 1 ? Math.round(target * (1 - (1 - p) ** 3)) : null);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        tick(start);
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );
    setN(0);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  if (!m || n === null) return <span ref={ref}>{value}</span>;
  /* While counting, the invisible final value alone sizes the box and the count
     is laid over it out of flow - the Digital Presence blocks are sized by their
     content, and proportional digits make e.g. `308K+` wider than `320K+`. */
  return (
    <span ref={ref} className="relative inline-block">
      <span className="invisible">{value}</span>
      <span className="absolute inset-0 whitespace-nowrap">{`${m[1]}${n}${m[3]}`}</span>
    </span>
  );
}

export default function FranchisePage() {
  const { t, i18n } = useTranslation('common');
  const isAr = !!i18n.language?.startsWith('ar');

  /* Hero entrance: eyebrow, then title, then the line under it. */
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  /* null while loading; an error hides the gallery rather than show stale photos. */
  const [gallery, setGallery] = useState<GalleryPhoto[] | null>(null);

  useEffect(() => {
    axios
      .get('/api/franchise-images')
      .then((res) => setGallery(Array.isArray(res.data) ? res.data.slice(0, 4) : []))
      .catch((error) => {
        console.error('Failed to fetch franchise gallery:', error);
        setGallery([]);
      });
  }, []);

  /* Same admin-controlled source FindUsSection and the Find Us page use. */
  useEffect(() => {
    axios
      .get('/api/branches')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const withMap = list.find((b: { isDeleted?: boolean; mapEmbedUrl?: string }) => !b.isDeleted && b.mapEmbedUrl);
        if (withMap?.mapEmbedUrl) setMapEmbedUrl(withMap.mapEmbedUrl);
      })
      .catch((error) => console.error('Failed to fetch branches:', error));
  }, []);

  return (
    <div className="min-h-screen bg-hnc-cream">
      {/* Hero. Measured off the reference (a 2x downscale of a 937px capture):
          aspect 456/224, copy column at 16% of the width. */}
      <section className="relative mt-[76px] w-full overflow-hidden border-t border-[#8A3B3A] aspect-[456/224] min-h-[380px] max-h-[560px] md:mt-[110px] lg:mt-[88px]">
        <Image
          src="/images/franchise_hero.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* keeps the cream copy readable over the warm interior */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25" />

        <div className="relative flex h-full w-full flex-col justify-center ps-[8%] pe-[6%] sm:ps-[12%] md:ps-[16%]">
          <p data-hero-motion=""
            className="anim-hero-label absolute top-[9%] text-[9px] font-semibold text-hnc-cream/85 sm:text-[11px] md:text-[13px]"
          >
            {t('franchise.label')}
          </p>

          <h1 data-hero-motion=""
            className="anim-hero-title whitespace-pre-line text-[26px] font-bold italic leading-[1.1] text-hnc-cream sm:mt-5 sm:text-[38px] md:text-[52px]"
            style={{ fontFamily: 'var(--font-proza)' }}
          >
            {t('franchise.heading')}
          </h1>

          <p data-hero-motion=""
            className="anim-hero-sub mt-4 max-w-[34ch] text-[10px] italic leading-[1.45] text-white/90 sm:mt-5 sm:text-[12px] md:max-w-[42ch] md:text-[14px]"
            style={{ fontFamily: 'var(--font-proza)' }}
          >
            {t('franchise.text')}
          </p>
        </div>
      </section>

      {/* Statistics bar */}
      <section className="w-full bg-hnc-cream">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-5 gap-y-4 px-5 py-4 sm:flex-nowrap sm:justify-between sm:gap-x-3 sm:py-[14px]">
          {STAT_KEYS.map((k, i) => (
            <React.Fragment key={k}>
              {i > 0 && (
                /* .rosette-spin (globals.css) already opts out for reduced motion */
                <span
                  aria-hidden="true"
                  className="rosette-spin block h-[18px] w-[18px] shrink-0 sm:h-[22px] sm:w-[22px]"
                  style={{ ...rosetteBorderStyle(1, 40, ROSETTE_INK), animationDuration: '5s' }}
                />
              )}
              <div className="min-w-0 flex-1 text-center">
                <p
                  data-anim="accent"
                  className="text-[22px] font-bold leading-none text-[#5B0504] sm:text-[28px] md:text-[34px]"
                >
                  <CountUp value={t(`franchise.stats.${k}.value`)} />
                </p>
                <p className="mt-1 text-[9px] leading-tight text-[#6B3A33] sm:text-[11px] md:text-[12px]">
                  {t(`franchise.stats.${k}.label`)}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>


      {/* Our Locations. Measured off the reference (803x770): heading band 215px
          with the copy inset 16%, then a full-bleed map of aspect 803/471. */}
      <section className="w-full bg-white">
        <div className="ps-[8%] pe-[6%] pb-10 pt-8 sm:ps-[12%] sm:pb-14 sm:pt-10 md:ps-[16%] md:pb-[72px] md:pt-[51px]">
          <p
            className="text-[11px] italic text-[#4A4A4A] sm:text-[12px]"
            style={{ fontFamily: 'var(--font-proza)' }}
          >
            {t('franchise.locations.label')}
          </p>
          <h2
            data-anim="lift"
            data-anim-step="1"
            className="mt-6 text-[26px] font-bold italic leading-none text-[#500000] sm:mt-8 sm:text-[32px] md:mt-[37px] md:text-[37px]"
            style={{ fontFamily: 'var(--font-proza)' }}
          >
            {t('franchise.locations.title')}
          </h2>
        </div>

        {/* Full-bleed map, in Google's own colours. */}
        <div className="relative aspect-[803/471] max-h-[560px] min-h-[260px] w-full overflow-hidden">
          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              title={t('franchise.locations.title')}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-[12px] text-neutral-500">
              {t('findMore.loadingMap')}
            </div>
          )}
        </div>
      </section>


      {/* The Experience. Measured off the reference (797x581): copy inset 17%,
          divider 63% wide, maroon band opens at 76% of the section height. */}
      <section className="w-full bg-white">
        <div className="ps-[8%] pe-[6%] pb-14 pt-10 sm:ps-[12%] sm:pb-20 sm:pt-12 md:ps-[17%] md:pb-[108px] md:pt-[70px]">
          <p
            className="text-[11px] italic text-[#545454] sm:text-[12px] md:text-[13px]"
            style={{ fontFamily: 'var(--font-proza)' }}
          >
            {t('franchise.experience.label')}
          </p>

          <div className="mt-2 flex items-start gap-2 sm:mt-3 md:mt-[6px]">
            <h2
              data-anim="clip"
              className="text-[28px] font-bold italic leading-none text-[#550000] sm:text-[34px] md:text-[42px]"
              style={{ fontFamily: 'var(--font-proza)' }}
            >
              {t('franchise.experience.title')}
            </h2>
            <span
              aria-hidden="true"
              className="mt-0.5 block h-[18px] w-[18px] shrink-0 sm:h-[22px] sm:w-[22px] md:h-[28px] md:w-[28px]"
              style={rosetteBorderStyle(1, 40, ROSETTE_INK)}
            />
          </div>

          <div className="mt-2 h-px w-[88%] bg-[#767676] sm:mt-3 md:mt-[26px] md:w-[82%]" />

          <h3
            data-anim="lift"
            data-anim-step="1"
            className="mt-5 whitespace-pre-line text-[20px] font-bold italic leading-[1.3] text-[#1A1A1A] sm:mt-7 sm:text-[25px] md:mt-8 md:text-[30px]"
            style={{ fontFamily: 'var(--font-proza)' }}
          >
            {t('franchise.experience.sub')}
          </h3>

          <p
            data-anim="lift"
            data-anim-step="2"
            className="mt-4 whitespace-pre-line text-[12px] leading-[1.5] text-[#232323] sm:mt-5 sm:text-[13px] md:mt-6 md:text-[15px]">
            {t('franchise.experience.desc')}
          </p>
        </div>

        {/* Digital Presence */}
        <div className="w-full bg-hnc-red">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-6 ps-[10%] pe-[8%] py-8 sm:px-[15%] md:px-[25%] md:py-[28px]">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-white/90 sm:text-[16px] md:text-[19px]">
                {t('franchise.experience.digital.label')}
              </p>
              <p
                className="mt-1.5 whitespace-pre-line text-[20px] font-bold italic leading-[1.15] text-hnc-cream sm:mt-2 sm:text-[25px] md:text-[29px]"
                style={{ fontFamily: 'var(--font-proza)' }}
              >
                {t('franchise.experience.digital.title')}
              </p>
            </div>

            {([
              ['instagram', Instagram],
              ['facebook', Facebook],
            ] as const).map(([key, Icon]) => (
              <div key={key} className="shrink-0 text-center">
                <span className="mx-auto flex h-[40px] w-[40px] items-center justify-center rounded-full border border-white/85 sm:h-[46px] sm:w-[46px] md:h-[50px] md:w-[50px]">
                  <Icon className="h-[20px] w-[20px] text-white sm:h-[23px] sm:w-[23px] md:h-[25px] md:w-[25px]" strokeWidth={1.6} />
                </span>
                <p className="mt-3 text-[15px] font-bold leading-none text-white sm:text-[16px] md:text-[17px]">
                  <CountUp value={t(`franchise.experience.digital.${key}.value`)} />
                </p>
                <p className="mt-1.5 text-[11px] leading-none text-white/85 md:text-[12px]">
                  {t(`franchise.experience.digital.${key}.label`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Gallery. Measured off the reference (692x851): content 77% of the width,
          top image 532x319, lower row 301 + 22 gutter + 210 with the two right
          images stacked. The left image spans both, so justify-between on the
          right column reproduces the 21px gap without hardcoding it.
          With fewer than four photos the block closes up: three lets the last
          one fill the right column, two stacks a second wide photo, one keeps
          only the top, and none hides the section. */}
      {gallery?.length !== 0 && (
        <section className="w-full bg-hnc-cream py-10 sm:py-14 md:py-[70px]">
          <div className="mx-auto w-[80%] max-w-[880px] sm:w-[68%]">
            <GalleryFrame
              photo={gallery?.[0]}
              isAr={isAr}
              sizes="(max-width: 768px) 88vw, 1000px"
              className="aspect-[532/319] rounded-[14px] sm:rounded-[20px]"
            />

            {gallery?.length === 2 ? (
              <GalleryFrame
                photo={gallery[1]}
                isAr={isAr}
                sizes="(max-width: 768px) 88vw, 1000px"
                className="mt-[6.2%] aspect-[532/319] rounded-[14px] sm:rounded-[20px]"
              />
            ) : gallery?.length !== 1 && (
              <div className="mt-[6.2%] grid grid-cols-[301fr_210fr] gap-[4.1%]">
                <GalleryFrame
                  photo={gallery?.[1]}
                  isAr={isAr}
                  sizes="(max-width: 768px) 50vw, 570px"
                  className="aspect-[301/282] rounded-[13px] sm:rounded-[19px]"
                />

                <div className="flex flex-col justify-between">
                  {gallery?.length === 3 ? (
                    <GalleryFrame
                      photo={gallery[2]}
                      isAr={isAr}
                      sizes="(max-width: 768px) 36vw, 400px"
                      className="flex-1 rounded-[13px] sm:rounded-[19px]"
                    />
                  ) : (
                    [2, 3].map((i) => (
                      <GalleryFrame
                        key={i}
                        photo={gallery?.[i]}
                        isAr={isAr}
                        sizes="(max-width: 768px) 36vw, 400px"
                        className="aspect-[210/131] rounded-[13px] sm:rounded-[19px]"
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <Footer variant="light" layout="franchise" />
    </div>
  );
}
