// components/BranchesList.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import '@/lib/i18n';
import Footer from "@/components/common/Footer";
import { Phone, ArrowRight } from 'lucide-react';
import axios from '@/lib/axios';
import { normalizeWhatsApp } from '@/lib/whatsapp';
import { normalizeMapEmbed } from '@/lib/mapEmbed';
import { WhatsAppGlyph } from '@/components/ui/WhatsAppGlyph';
import Link from 'next/link';
import Image from 'next/image';
import { BrandHeading } from "@/components/ui/BrandHeading";

interface Branch {
    _id: string;
    name: { en: string; ar: string };
    address: { en: string; ar: string };
    phone: string;
    whatsapp: string;
    mapEmbedUrl: string;
    locationUrl: string;
    image: string;
    menuPdf: string;
}

export default function BranchesList() {
    const { t, i18n } = useTranslation('common');

    /* Hero entrance: eyebrow, then title, then the line under it. */
    const [branches, setBranches] = useState<Branch[]>([]);
    console.log(branches);
    const [isLoading, setIsLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await axios.get('/api/branches');
                setBranches(res.data);
            } catch (error) {
                console.error('Failed to fetch branches:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBranches();
    }, []);

    const toggleBranch = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const formatAddress = (text: string) => {
        if (!text) return null;
        return text.split(',').map((part, index, arr) => (
            <span key={index}>
                {part.trim()}
                {index < arr.length - 1 && <>,<br /></>}
            </span>
        ));
    };

    return (
        <div className="min-h-screen bg-brand-navy">
            {/* Hero. Measured off the reference: content 65% of the width, pin at
                60-81% x 13-71%, bottom notch apex at 17.1%. #810706 is the red of
                find_us_hero.jpg, the colour the hero actually shows. The image has
                its own notch and a white strip baked into its bottom 8.7%; below sm
                the cover scale is height-driven so that strip comes into view, and
                the extra layer repaints the bottom 9% in the same red. */}
            <section
                className="relative mt-[76px] w-full overflow-hidden border-t border-[#8A3B3A] bg-[#810706] bg-[url('/images/find_us_hero.jpg')] bg-cover bg-no-repeat [background-position:center_45%] max-sm:[background-image:linear-gradient(to_top,#810706_9%,transparent_9%),url('/images/find_us_hero.jpg')] md:mt-[110px] lg:mt-[88px]"
            >
                <div className="mx-auto w-full max-w-[1020px] px-6 py-10 sm:py-14 lg:py-[108px]">
                    <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,1fr)_42%] sm:gap-10">
                        <div className="text-start">
                            <p data-hero-motion=""
                                className="anim-hero-label text-[11px] font-semibold text-hnc-cream/75 sm:text-[12px] lg:text-[13px]"
                            >
                                {t('findMore.hero.label')}
                            </p>

                            <h1 data-hero-motion=""
                                className="anim-hero-title mt-5 text-hnc-cream sm:mt-7 lg:mt-8"
                                style={{ fontFamily: 'var(--font-proza)' }}
                            >
                                <span className="block whitespace-pre-line text-[30px] font-bold italic leading-[1.06] sm:text-[40px] lg:text-[50px]">
                                    {t('findMore.hero.lead')}
                                </span>
                                <span className="mt-0.5 block text-[21px] font-bold italic leading-[1.1] sm:text-[27px] lg:text-[34px]">
                                    {t('findMore.hero.sub')}
                                </span>
                            </h1>

                            <p data-hero-motion=""
                                className="anim-hero-sub mt-5 max-w-[34ch] text-[12px] italic leading-[1.45] text-hnc-cream/70 sm:mt-6 sm:text-[13px] lg:text-[15px]"
                                style={{ fontFamily: 'var(--font-proza)' }}
                            >
                                {t('findMore.hero.text')}
                            </p>
                        </div>

                        {/* Hero image. The container's width classes are the ones the
                            column already used, so the hero's height and layout are
                            unchanged; aspect-[1142/774] matches the asset exactly and
                            object-cover fills the box without ever stretching it. */}
                    </div>
                </div>
            </section>

            {/* Cream band carrying the reference's downward notch (apex 17.1%). */}
            <div className="relative w-full bg-hnc-cream">
                <svg
                    aria-hidden="true"
                    viewBox="0 0 1000 60"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 top-0 h-[30px] w-full rtl:-scale-x-100 sm:h-[52px] lg:h-[84px]"
                >
                    <polygon points="110,0 171,60 228,0" fill="#810706" />
                </svg>
                <div className="h-[56px] sm:h-[72px] lg:h-[96px]" />
            </div>

            {/* Branch list. Proportions measured off the reference: panel 70% /
                map 29% with a 1.8% gutter. Every value comes from the admin API. */}
            <div className="bg-hnc-cream">
                <div className="mx-auto max-w-[836px] px-5 pb-14 pt-6 sm:px-6 sm:pb-16">
                    {isLoading ? (
                        <div className="py-20 text-center text-neutral-500">{t('findMore.loadingMap')}</div>
                    ) : branches.length === 0 ? (
                        <div className="py-20 text-center text-neutral-500">{t('findMore.title')}</div>
                    ) : (
                        <div className="space-y-8 sm:space-y-12 md:space-y-[58px]">
                            {branches.map((branch) => {
                                const lang = i18n.language === 'ar' ? 'ar' : 'en';
                                const branchName = branch.name ? branch.name[lang] : '';
                                const branchAddress = branch.address ? branch.address[lang] : '';
                                /* The branch's own WhatsApp field only - never the
                                   phone as a fallback. Falling back meant a branch
                                   with no WhatsApp still rendered the green button,
                                   labelled with an undefined `whatsapp` and so with
                                   no number on it at all. */
                                const waDigits = normalizeWhatsApp(branch.whatsapp);
                                const waHref = waDigits ? `https://wa.me/${waDigits}` : null;
                                const waLabel = (branch.whatsapp || '').trim();
                                /* Normalised at render too, not just on save: rows
                                   stored before the API validated this field still
                                   hold a pasted <iframe> snippet, and that works
                                   once the src is pulled out of it. */
                                const mapSrc = normalizeMapEmbed(branch.mapEmbedUrl);

                                return (
                                    <div key={branch._id}>
                                        <h3 data-anim="slide" className="mb-1.5 ps-4 text-start text-[20px] font-bold leading-tight text-[#2F2F2F] sm:mb-2 sm:ps-5 sm:text-[26px] md:ps-[28px] md:text-[32px]">
                                            {branchName}
                                        </h3>

                                        {/* From sm up the card stretches to the map's height with
                                            its buttons pinned to the bottom, so every row lines up
                                            as in the reference. A branch without a usable map keeps
                                            an empty slot of the same size, so all cards share one
                                            width and height. Stacked on phones, with room under the
                                            card for the Menu/WhatsApp buttons that straddle its edge. */}
                                        <div className="grid gap-7 sm:grid-cols-[69.5fr_28.5fr] sm:gap-[2%]">
                                            <div className="relative">
                                                <div className="flex h-full flex-col rounded-[20px] border border-[#6B6552] px-4 pb-7 pt-3.5 sm:ps-[4.6%] sm:pe-[8.8%] md:rounded-[25px] md:pb-[34px] md:pt-[18px]">
                                                    {branchAddress ? (
                                                        <p className="mb-2.5 text-[13px] leading-[1.38] text-neutral-600 sm:text-[16px] md:text-[19px] md:leading-[1.3]">
                                                            {formatAddress(branchAddress)}
                                                        </p>
                                                    ) : null}

                                                    <div className="mt-auto flex items-stretch gap-[3.2%]">
                                                        {branch.phone ? (
                                                            <a
                                                                href={`tel:${branch.phone.replace(/\s/g, '')}`}
                                                                className="flex h-[38px] min-w-0 max-w-[67.8%] flex-1 items-center gap-2 rounded-[8px] bg-[#B61815] ps-[6px] pe-2.5 transition-colors hover:bg-[#9C1412] sm:h-[42px] md:h-[48px] md:ps-[10px]"
                                                            >
                                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-hnc-cream sm:h-[30px] sm:w-[30px] md:h-[35px] md:w-[35px]">
                                                                    <span className="flex h-[74%] w-[74%] items-center justify-center rounded-full border-[1.5px] border-[#B61815]">
                                                                        <Phone className="h-3 w-3 text-[#B61815] md:h-[14px] md:w-[14px]" />
                                                                    </span>
                                                                </span>
                                                                <span className="w-full text-center text-[17px] font-bold text-white min-[360px]:text-[19px] sm:text-[24px] md:text-[33px]">
                                                                    {branch.phone}
                                                                </span>
                                                            </a>
                                                        ) : null}

                                                        {waHref ? (
                                                            <a
                                                                href={waHref}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex w-[29%] shrink-0 items-center justify-center rounded-[8px] bg-[#E82722] px-2 text-center text-[12px] leading-tight text-white transition-colors hover:bg-[#CF1D19] sm:text-[14px] md:text-[17px]"
                                                            >
                                                                {t('findMore.orderNow')}
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 items-center justify-between gap-3 px-4 sm:ps-[5.1%] sm:pe-[8.8%]">
                                                    {branch.menuPdf ? (
                                                        <Link
                                                            href={`/menu?pdf=${encodeURIComponent(branch.menuPdf)}`}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-[#2F2F2F] px-2.5 py-[3px] text-[11px] text-white transition-colors hover:bg-black sm:text-[12px] md:h-[22px] md:min-w-[95px] md:justify-center md:px-3 md:text-[13px]"
                                                        >
                                                            {t('findMore.menu')}
                                                            <ArrowRight strokeWidth={2.5} className="h-3 w-3 rtl:-scale-x-100 md:h-3.5 md:w-3.5" />
                                                        </Link>
                                                    ) : (
                                                        <span />
                                                    )}

                                                    {waHref ? (
                                                        <a
                                                            href={waHref}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#73B515] px-3 py-1 text-[14px] text-white transition-colors hover:bg-[#639D12] sm:min-w-[34%] sm:text-[16px] md:h-[38px] md:gap-3 md:text-[20px]"
                                                        >
                                                            <WhatsAppGlyph className="h-4 w-4 sm:h-5 sm:w-5 md:h-[26px] md:w-[26px]" />
                                                            {/* ltr so a leading + stays in front in Arabic */}
                                                            <span dir="ltr">{waLabel}</span>
                                                        </a>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {mapSrc ? (
                                                <div className="aspect-[227/188] w-full overflow-hidden rounded-[20px] sm:self-stretch md:rounded-[25px]">
                                                    <iframe
                                                        src={mapSrc}
                                                        title={`${branchName} ${t('findMore.map', 'map')}`}
                                                        width="100%"
                                                        height="100%"
                                                        style={{ border: 0 }}
                                                        allowFullScreen
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                    />
                                                </div>
                                            ) : (
                                                <div aria-hidden="true" className="hidden aspect-[227/188] sm:block sm:self-stretch" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer variant="light" />
        </div>
    );
}
