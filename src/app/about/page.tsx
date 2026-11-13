"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import '@/lib/i18n';
import Footer from "@/components/common/Footer";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { motion } from "framer-motion";
import { BrandHeading } from "@/components/ui/BrandHeading";
import axios from "@/lib/axios";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};


/* Rosette strips flanking the chairman banner. Everything here is geometry -
   nothing alters the asset's own colour or alpha. */
const ROSETTE_STRIP =
  "pointer-events-none absolute inset-y-0 bg-[url('/images/01-01.png')] bg-repeat-x " +
  "[background-size:auto_130%] sm:[background-size:auto_110%] lg:[background-size:auto_92%]";

const ROSETTE_SIDES = [
  "hidden start-0 lg:block lg:w-[17.5%] bg-[position:right_center] rtl:bg-[position:left_center]",
  "end-0 w-[28%] sm:w-[54%] lg:w-[42%] bg-[position:left_center] rtl:bg-[position:right_center]",
];

// ─── Team Section ────────────────────────────────────────

interface TeamMember {
  _id: string;
  name: { en: string; ar: string };
  role: { en: string; ar: string };
  desc: { en: string; ar: string };
  image?: string;
  order?: number;
}


function TeamSection() {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* Managed from the admin panel; /api/team already returns them in display
     order and filters out deleted members. */
  useEffect(() => {
    let live = true;
    axios
      .get('/api/team')
      .then((res) => live && setTeamMembers(Array.isArray(res.data) ? res.data : []))
      .catch(() => live && setTeamMembers([]))
      .finally(() => live && setIsLoading(false));
    return () => {
      live = false;
    };
  }, []);

  if (!isLoading && teamMembers.length === 0) return null;

  return (
    <section className="bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[960px] px-6">
        {/* Heading */}
        <motion.div
          className="mb-8 text-center sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight text-[#D01E1A] sm:text-[40px] lg:text-[48px]">
            {isAr ? 'فريقنا' : 'Our Team'}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[13px] text-neutral-600 sm:text-[14px]">
            {isAr
              ? 'تعرف على الأشخاص الذين يقفون وراء نجاح الحار والبارد'
              : "Meet the people behind Hot N Cool's success"}
          </p>
        </motion.div>

        {/* 3 x 2 on desktop. Every value below is measured off the reference:
            card 204 wide with an 81 column gap and 72 row gap, 16px padding, a
            172:111 media block, and a 37px badge sitting flush in the bottom end
            corner with an identical charcoal square offset 10/11px behind it -
            that square is the card's own colour, so it only shows where it
            extends past the card. */}
        <div className="grid [grid-auto-rows:1fr] grid-cols-1 gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-16 lg:grid-cols-3 lg:gap-x-[96px] lg:gap-y-[85px]">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member._id}
              className="relative bg-[#3D3D3D] px-[19px] pb-[47px] pt-[15px] text-start"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              {/* Darker media block. Keeps the existing per-member image when one
                  is set, otherwise the initial, exactly as before. */}
              <div className="relative aspect-[172/111] w-full overflow-hidden bg-[#292929]">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={(isAr ? member.name?.ar : member.name?.en) || member.name?.en || ""}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 240px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-5xl font-bold text-white/15">
                      {((isAr ? member.name?.ar : member.name?.en) || member.name?.en || "?").charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="mt-[6px] text-[18px] font-bold leading-[1.15] text-white">
                {(isAr ? member.name?.ar : member.name?.en) || member.name?.en}
              </h3>
              <p className="mt-[6px] text-[11px] leading-[1.45] text-white">
                {(isAr ? member.role?.ar : member.role?.en) || member.role?.en}
              </p>
              {/* Justified, as the reference's description lines share a right edge.
                  The extra end padding keeps that edge clear of the badge. */}
              <p className="pe-[12px] text-justify text-[11px] leading-[1.48] text-white">
                {(isAr ? member.desc?.ar : member.desc?.en) || member.desc?.en}
              </p>

              <div className="absolute bottom-0 end-0 h-[44px] w-[44px]">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 translate-x-[12px] translate-y-[13px] bg-[#3D3D3D] rtl:-translate-x-[12px]"
                />
                <span className="relative flex h-full w-full items-center justify-center bg-white text-[31px] font-bold leading-none text-[#292929]">
                  {index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


export default function AboutPage() {
  const { t } = useTranslation('common');

  /* Hero entrance: eyebrow, then title, then the line under it. */

  // role is stored as one string ("<title>, <company>"); the reference shows it
  // on two lines, so split on the comma rather than adding new content keys.
  const chairmanTitleWords = t('about.chairmanMessage.title').trim().split(/\s+/);
  const chairmanTitleLead = chairmanTitleWords[0];
  const chairmanTitleTail = chairmanTitleWords.slice(1).join(' ');

  const chairmanRole = t('about.chairmanMessage.role')
    .split(/[,،]\s*/)
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col text-white bg-brand-navy">
      {/* Header is handled by RootLayout */}

      {/* Main Content Wrapper */}
      <main className="flex-grow flex flex-col w-full relative overflow-x-hidden">




        {/* Hero / banner. Background is CSS, not a photo: the old banner asset was
            deleted and nothing in public/images carries the reference's dark-red
            lamp-lit atmosphere. Colours are the brand swatches in images/color. */}
        <section
          aria-labelledby="about-banner-heading"
          className="relative isolate mt-[76px] w-full overflow-hidden aspect-[467/210] min-h-[320px] max-h-[600px] md:mt-[110px] lg:mt-[88px]"
        >
          {/* Red smoke plate + the scrim that keeps cream text legible.
              A plain CSS background, not next/image: it is decorative, full-bleed
              and already a hand-sized 30KB webp, so the optimizer adds nothing.
              Generated into public/images because no shipped asset carried the
              reference's lamp-lit atmosphere; colours are the brand swatches in
              public/images/color. */}
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%),' +
                "url('/images/aboutus-banner.jpg')",
            }}
          />
          {/* Pendant lamps, right side. Drawn rather than cropped so they stay
              sharp and never distort; blurred to sit behind the text like the
              reference's shallow depth of field. */}
          {/* <svg
            aria-hidden="true"
            viewBox="0 0 467 210"
            preserveAspectRatio="xMaxYMin slice"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full blur-[1.5px] rtl:-scale-x-100"
          >
            <defs>
              <linearGradient id="ab-shade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A1A0B" />
                <stop offset="45%" stopColor="#7A5C1E" />
                <stop offset="88%" stopColor="#C9971F" />
                <stop offset="100%" stopColor="#8A6A22" />
              </linearGradient>
              <radialGradient id="ab-mouth">
                <stop offset="0%" stopColor="#FFF0C4" />
                <stop offset="60%" stopColor="#F7C25C" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#F7C25C" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ab-halo">
                <stop offset="0%" stopColor="#FFBE74" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#FFBE74" stopOpacity="0" />
              </radialGradient>
            </defs> */}
          {/* far lamp - smaller and dimmer, deeper in the haze */}
          {/* <g opacity="0.6">
              <circle cx="292" cy="78" r="34" fill="url(#ab-halo)" />
              <line x1="292" y1="0" x2="292" y2="56" stroke="#1C0A06" strokeWidth="1.4" />
              <path d="M272 76 a20 21 0 0 1 40 0 z" fill="url(#ab-shade)" />
              <ellipse cx="292" cy="77" rx="19" ry="7" fill="url(#ab-mouth)" />
            </g>
                 {/* near lamp - larger and brighter, at the right as in the reference */}
          {/* <g opacity="0.95">
              <circle cx="380" cy="96" r="48" fill="url(#ab-halo)" />
              <line x1="380" y1="0" x2="380" y2="66" stroke="#1C0A06" strokeWidth="1.8" />
              <path d="M350 95 a30 31 0 0 1 60 0 z" fill="url(#ab-shade)" />
              <ellipse cx="380" cy="96" rx="28" ry="10" fill="url(#ab-mouth)" />
            </g>
          </svg>  */}

          {/* Content. Logical padding so RTL mirrors it without extra rules.
              Proza Libre (public/font/proza-libre) is the shipped display face -
              the humanist italic the reference title uses. */}
          <div className="relative flex h-full w-full flex-col justify-center ps-[6%] pe-[4%] sm:ps-[12%] lg:ps-[22%]">
            <p
              data-hero-motion=""
              className="anim-hero-label mb-[4%] text-[11px] italic text-white sm:text-[13px] lg:text-[15px]"
            >
              {t('about.banner.subtitle')}
            </p>

            <h1
              data-hero-motion=""
              id="about-banner-heading"
              className="anim-hero-lines flex flex-col items-start gap-[4px] sm:gap-[6px] lg:gap-[8px]"
              style={{ fontFamily: 'var(--font-proza)' }}
            >
              {(['line1', 'line2', 'line3'] as const).map((k) => (
                <span
                  key={k}
                  className="inline-block bg-hnc-cream px-[0.22em] py-[0.01em] text-[22px] italic leading-[0.86] text-[#650A13] rtl:py-[0.04em] rtl:leading-[1.3] sm:text-[32px] lg:text-[46px]"
                >
                  {t(`about.banner.${k}`)}
                </span>
              ))}
            </h1>

            <p
              data-hero-motion=""
              className="anim-hero-sub mt-[9px] max-w-[26ch] text-[9px] leading-[1.55] text-white/85 sm:mt-[13px] sm:max-w-[30ch] sm:text-[11px] lg:mt-[20px] lg:max-w-[34ch] lg:text-[12px]"
            >
              {t('about.banner.desc')}
            </p>
          </div>
        </section>

        {/* SECTION: About Us. Proportions measured off the reference: image column
            38% of the content box, copy 57%, 5.5% gutter; heading top aligns with
            image 1, copy bottom with image 2. */}
        <section className="relative border-y-2 border-[#5E0F12] bg-white py-16 md:py-20 lg:py-24">
          {/* Order Now — straddles the red banner edge above, as in the reference */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 -translate-y-2/3">
            <div className="mx-auto w-full max-w-[900px] px-6 lg:px-0">
              <Link
                href="/menu"
                className="pointer-events-auto inline-flex items-center justify-center bg-[#D8232A] px-10 py-3 text-base font-bold tracking-wide text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-colors duration-300 hover:bg-[#B8161C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D8232A] sm:px-12 sm:text-lg"
              >
                {t('findMore.orderNow', 'Order Now')}
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[900px] px-6 lg:px-0">
            <div className="grid items-start gap-8 sm:grid-cols-[111fr_165fr] sm:gap-[5.5%]">
              {/* Image column — two stacked cards, reference aspects 111:137 and 111:94 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="me-auto flex w-full max-w-[300px] flex-col gap-4 sm:max-w-none lg:gap-5"
              >
                <div className="relative aspect-[111/137] w-full overflow-hidden rounded-[18px] lg:rounded-[22px]">
                  <Image
                    src="/images/01.jpg"
                    alt={t('about.title')}
                    fill
                    sizes="(max-width: 1024px) 100vw, 343px"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-[111/94] w-full overflow-hidden rounded-[18px] lg:rounded-[22px]">
                  <Image
                    src="/images/0333.jpg"
                    alt={t('about.title')}
                    fill
                    sizes="(max-width: 1024px) 100vw, 343px"
                    className="object-cover"
                  />
                </div>
              </motion.div>

              {/* Copy */}
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-start text-[34px] font-extrabold uppercase leading-[0.95] tracking-[-0.015em] text-brand-crimson sm:text-[46px] lg:text-[56px]">
                  {t('about.title')}
                </h2>

                <div className="mt-4 whitespace-pre-line text-justify text-[15px] leading-[1.55] text-neutral-700 sm:text-[17px] lg:mt-6">
                  {t('about.description')}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION: Chairman profile strip. Compact full-width banner; the rosette
            is the project's existing hnc-rosette motif, masked away behind the
            centred profile group as in the reference. */}
        <section className="relative w-full overflow-hidden bg-[#650A13]">
          {/* Two strips of rosettes, one either side of the profile group, so the
              centre is kept clear by LAYOUT rather than by a mask. The PNG is
              drawn exactly as authored: no opacity, filter, mask, tint or blend
              touches it, so its own colour and transparency are what render.
              `repeat-x` holds it to a single row and the vertical `center` keeps
              that row centred; each strip anchors its tiling to the edge nearest
              the content, so whole motifs sit beside the portrait and only the
              outer page edges crop. Sizing is a share of the banner height, so a
              shorter banner on phones gives fewer, proportionally larger motifs
              instead of a denser mat. Aspect ratio is never touched - only the
              background height is set, the width follows.

              Widths are per breakpoint because the profile group moves: it is
              inset 19% at lg but sits hard against the padding below that, so
              the leading strip only exists at lg and the trailing strip starts
              after wherever the text actually ends. */}
          {ROSETTE_SIDES.flatMap((side, i) =>
            /* Each side is drawn twice. The asset's outline is a hairline in a
               2567px canvas, so at this size it resolves to a part-covered pixel
               and reads washed out; compositing the identical image over itself
               raises that coverage toward the colour the PNG actually holds.
               Because both layers are the same artwork, every channel moves in
               the same proportion - the hue is untouched, and no filter, tint or
               blend mode is involved. */
            [0, 1].map((layer) => (
              <div
                key={`rosette-${i}-${layer}`}
                aria-hidden="true"
                className={`${ROSETTE_STRIP} ${side}`}
              />
            )),
          )}

          <div className="relative flex w-full items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:gap-6 lg:ps-[19%] lg:py-[14px]">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/10 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
              <Image
                src="/images/06.jpg.jpeg"
                alt={t('about.chairmanMessage.name')}
                fill
                sizes="80px"
                className="scale-[1.2] object-cover object-top"
              />
            </div>

            <div className="min-w-0 text-start">
              <p className="text-[19px] font-bold leading-tight text-hnc-cream sm:text-[26px] lg:text-[36px]">
                {t('about.chairmanMessage.name')}
              </p>
              {chairmanRole.map((line) => (
                <p
                  key={line}
                  className="text-[11px] leading-snug text-hnc-cream/80 sm:text-[12px] lg:text-[13px]"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: Chairman's Message. Speech bubble measured off the reference:
            box 302:188, text 70% of it, image 21% overflowing the right edge by 5%,
            tail at 62% with a vertical right edge. */}
        <section className="relative border-t-2 border-[#650A13] bg-white pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
          <div className="mx-auto w-full max-w-[640px] px-6 md:max-w-[700px] lg:max-w-[720px]">
            <h2
              data-anim="clip"
              className="text-start text-[32px] font-extrabold italic leading-[0.98] tracking-tight sm:text-[42px] lg:text-[52px]"
            >
              <span className="block text-[#1A1A1A]">{chairmanTitleLead}</span>
              <span className="block text-[#D01E1A]">{chairmanTitleTail}</span>
            </h2>

            <div className="relative mt-5 lg:mt-7">
              <div className="rounded-[16px] border border-[#F5D7D7] bg-white px-4 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-6">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="min-w-0 flex-1 space-y-3 text-[13px] leading-[1.5] text-neutral-700 sm:text-[14px] lg:text-[15px]">
                    {(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] as const).map((k) =>
                      t(`about.chairmanMessage.${k}`) ? (
                        <p key={k}>{t(`about.chairmanMessage.${k}`)}</p>
                      ) : null,
                    )}
                    {t('about.chairmanMessage.footer') ? (
                      <p className="pt-1 font-bold uppercase tracking-wide text-brand-red">
                        {t('about.chairmanMessage.footer')}
                      </p>
                    ) : null}
                  </div>

                  <div className="relative -me-[7%] aspect-[63/91] w-[23%] shrink-0 overflow-hidden rounded-xl lg:-me-[11%]">
                    <Image
                      src="/images/chairman-message.jpg"
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Tail. Open path: the top edge is filled but not stroked, so it
                  joins the box seamlessly; shifted 1px up to cover its border. */}
              <svg
                aria-hidden="true"
                viewBox="0 0 30 30"
                className="absolute start-[62%] top-[calc(100%-1px)] aspect-square w-[10%] rtl:-scale-x-100"
              >
                <path
                  d="M0 0 L30 30 L30 0"
                  fill="#ffffff"
                  stroke="#F5D7D7"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* SECTION: What We Stand For. Measured off the reference: content 59.5%
            of the section, split 42% text / 8% gutter / 50% image. The heading sits
            above the grid so the image's top lines up with the copy's first line,
            as it does in the reference. */}
        <section className="bg-hnc-cream py-14 sm:py-16 lg:py-20">
          <div className="mx-auto w-full max-w-[620px] px-6">
            <h2
              data-anim="slide"
              className="whitespace-pre-line text-start text-[34px] font-extrabold italic leading-[0.92] tracking-tight text-[#D01E1A] rtl:leading-[1.18] sm:text-[40px] lg:text-[50px]"
            >
              {t('about.valuableReality.heading')}
            </h2>

            <div className="mt-6 grid items-start gap-8 sm:grid-cols-[42fr_50fr] sm:gap-[8%] lg:mt-8">
              <motion.p
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="whitespace-pre-line text-justify text-[14px] leading-[1.55] text-neutral-700 sm:text-[15px] lg:text-[16px]"
              >
                {t('about.valuableReality.body')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative ms-auto aspect-[135/150] w-full max-w-[300px] overflow-hidden rounded-[18px] sm:ms-0 sm:max-w-none lg:rounded-[24px]"
              >
                <Image
                  src="/images/what_we_stand.jpg"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) 100vw, 410px"
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION: Mission & Vision. Measured off the approved reference: two
            355px columns with a 44px gap, body justified at 18/29.7, headings at
            62px. Fixed gap, not a percentage - the percentage was what made the
            columns drift apart as the viewport grew. */}
        <section className="border-t-2 border-[#650A13] bg-white py-12 sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-[802px] px-6">
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-[44px]">
              {(['mission', 'vision'] as const).map((k) => (
                <motion.div
                  key={k}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <h2 className="text-start text-[34px] font-extrabold leading-[1.05] tracking-tight text-[#D01E1A] sm:text-[40px] lg:text-[48px]">
                    {t(`about.${k}.title`)}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-start text-[12px] leading-[1.65] text-neutral-700 sm:text-justify sm:text-[15px] lg:mt-5 lg:text-[18px]">
                    {t(`about.${k}.body`)}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* closing divider, aligned to the content area rather than the viewport */}
            <div className="mt-10 border-t border-neutral-200 lg:mt-12" />
          </div>
        </section>

        {/* SECTION: Our Team */}
        <TeamSection />

        {/* SECTION 1: Contact (Existing) */}
        {/* <section className="flex flex-col md:flex-row w-full min-h-screen relative"> */}
        {/* Left Side: Image & Contact Details */}
        {/* <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-screen"> */}
        {/* Background Image */}
        {/* <div className="absolute inset-0 w-full h-full">
              <Image
                src="/images/AVOCADO_JUICE.png"
                alt="Contact Background"
                fill
                className="object-cover"
                priority
              /> */}
        {/* Dark Overlay */}
        {/* <div className="absolute inset-0 bg-black/50" />
            </div> */}

        {/* Content Overlay */}
        {/* <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20 md:pt-0">
              <BrandHeading as="h1" center={false} className="mb-8">
                {t('contactPage.title')}
              </BrandHeading>

              <div className="space-y-6 text-gray-300 text-sm md:text-base lg:text-lg font-light leading-relaxed max-w-md">
                <div>
                  <p className="font-semibold text-white uppercase tracking-wider mb-2">
                    {t('contactPage.addressTitle')}
                  </p>
                  <p className="whitespace-pre-line opacity-80">
                    {t('contactPage.address')}
                  </p>
                </div> */}

        {/* <div>
                  <p className="opacity-80">
                    {t('contactPage.phone')}
                  </p>
                </div> */}

        {/* Social Icons */}
        {/* <div className="flex gap-4 pt-4">
                  <Link href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-black hover:bg-gray-200 transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg> */}
        {/* </Link>
                  <Link href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-black hover:bg-gray-200 transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div> */}

        {/* Right Side: Form */}
        {/* <div className="w-full md:w-1/2 bg-brand-navy flex flex-col items-center justify-center p-8 md:p-12 lg:p-20">
            <ContactForm t={t} />
          </div> */}
        {/* </section> */}
      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}

// Zod Schema
// const contactSchema = z.object({
//   name: z.string().min(1, "Name is required").max(20, "Name cannot exceed 20 characters"),
//   email: z.string().min(1, "Email is required").email("Invalid email address"),
//   message: z.string().min(1, "Message is required").max(100, "Message cannot exceed 100 characters"),
// });

// type ContactFormData = z.infer<typeof contactSchema>;

// function ContactForm({ t }: { t: any }) {
//   const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm<ContactFormData>({
//     resolver: zodResolver(contactSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       message: ""
//     }
//   });

//   const nameValue = watch("name", "");
//   const messageValue = watch("message", "");

//   const onSubmit = async (data: ContactFormData) => {
//     setStatus('loading');

//     try {
//       const res = await fetch('/api/enquiries', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//       });

//       if (!res.ok) throw new Error('Failed to submit');

//       setStatus('success');
//       reset();
//       setTimeout(() => setStatus('idle'), 3000);
//     } catch (error) {
//       console.error(error);
//       setStatus('error');
//       setTimeout(() => setStatus('idle'), 3000);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-8 mt-8 md:mt-0">
//       {/* Name Field */}
//       <div className="group relative">
//         <input
//           type="text"
//           {...register("name")}
//           maxLength={20}
//           placeholder={t('contactPage.form.name')}
//           className={`w-full bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-white/20'} py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors text-lg`}
//         />
//         <div className="flex justify-between mt-1">
//           {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
//           <div className="text-right text-xs text-gray-500 ml-auto">
//             {nameValue.length}/20
//           </div>
//         </div>
//       </div>
//       {/* Email Field */}
//       <div className="group relative">
//         <input
//           type="email"
//           {...register("email")}
//           placeholder={t('contactPage.form.email')}
//           className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-white/20'} py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors text-lg`}
//         />
//         {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
//       </div>
//       {/* Message Field */}
//       <div className="group relative">
//         <input
//           type="text"
//           {...register("message")}
//           maxLength={100}
//           placeholder={t('contactPage.form.message')}
//           className={`w-full bg-transparent border-b ${errors.message ? 'border-red-500' : 'border-white/20'} py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors text-lg`}
//         />
//         <div className="flex justify-between mt-1">
//           {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
//           <div className="text-right text-xs text-gray-500 ml-auto">
//             {messageValue.length}/100
//           </div>
//         </div>
//       </div>

//       {/* Status Messages */}
//       {status === 'success' && (
//         <p className="text-green-500 text-center">Message sent successfully! We will contact you soon.</p>
//       )}
//       {status === 'error' && (
//         <p className="text-red-500 text-center">Failed to send message. Please try again.</p>
//       )}

//       {/* Submit Button */}
//       <div className="pt-8">
//         <button
//           type="submit"
//           disabled={status === 'loading'}
//           className="w-full bg-gray-900 text-white hover:bg-red-800 hover:text-white py-4 rounded-full font-bold text-lg transition-all duration-300 disabled:opacity-50 shadow-lg"
//         >
//           {status === 'loading' ? 'Sending...' : t('contactPage.form.submit')}
//         </button>
//       </div>
//     </form>
//   );
// }
