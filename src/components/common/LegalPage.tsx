"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import Footer from "@/components/common/Footer";

interface LegalPageProps {
  /* Locale namespace holding this page's copy, e.g. "privacyPage". */
  tKey: string;
  /* Section keys under `<tKey>.sections`, in the order they are shown. */
  sections: readonly string[];
  /* Maps a section key to the `<tKey>.<value>` key holding its address, for
     sections whose body carries an {{email}} slot. */
  emails?: Readonly<Record<string, string>>;
}

/* Shared shell for the Privacy Policy and Terms of Use pages: breadcrumb,
   heading, rule, lead paragraph and the headed sections, in a centred reading
   column. The two pages differ only in their copy, so they pass a locale key
   rather than repeating this markup.

   The header comes from the root layout, so only the footer is rendered here,
   and it is the standard variant - the franchise layout drops the Legal column
   that links to these pages. */
export default function LegalPage({ tKey, sections, emails = {} }: LegalPageProps) {
  const { t } = useTranslation("common");

  /* Splits the body on the {{email}} slot so the address renders as a real
     mailto link with the sentence intact either side of it. Copy with no slot
     falls through unchanged, keeping both kinds of section on one code path. */
  const withEmail = (body: string, address?: string) => {
    if (!address || !body.includes("{{email}}")) return body;
    const [before, after] = body.split("{{email}}");
    return (
      <>
        {before}
        <a
          href={`mailto:${address}`}
          className="font-semibold text-hnc-red underline underline-offset-2 transition-colors hover:text-[#7C0A10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hnc-red"
        >
          {address}
        </a>
        {after}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-hnc-cream">
      {/* Clears the fixed navbar, whose heights are the NAV_H the header uses. */}
      <main className="mx-auto w-full max-w-[760px] px-6 pt-[76px] pb-16 sm:px-8 md:pt-[110px] md:pb-20 lg:pt-[88px]">
        <div className="pt-10 sm:pt-14 md:pt-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 text-[12px] text-[#6B3A33] sm:text-[13px]">
              <li className="font-semibold text-[#500000]">
                {t(`${tKey}.breadcrumbCurrent`)}
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[#500000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hnc-red"
                >
                  {t(`${tKey}.breadcrumbSite`)}
                </Link>
              </li>
            </ol>
          </nav>

          <h1
            data-anim="lift"
            className="mt-4 text-[32px] font-bold italic leading-[1.1] text-[#500000] sm:mt-5 sm:text-[42px] md:text-[52px]"
            style={{ fontFamily: "var(--font-proza)" }}
          >
            {t(`${tKey}.title`)}
          </h1>

          <div className="mt-5 h-px w-full bg-[#767676]/45 sm:mt-6" />

          <p className="mt-6 text-[14px] leading-[1.75] text-[#232323] sm:mt-8 sm:text-[15px] md:text-[16px]">
            {t(`${tKey}.intro`)}
          </p>

          <div className="mt-8 flex flex-col gap-8 sm:mt-10 sm:gap-10">
            {sections.map((key) => (
              <section key={key}>
                <h2
                  className="text-[19px] font-bold italic leading-[1.25] text-[#550000] sm:text-[22px] md:text-[25px]"
                  style={{ fontFamily: "var(--font-proza)" }}
                >
                  {t(`${tKey}.sections.${key}.heading`)}
                </h2>
                <p className="mt-2.5 text-[14px] leading-[1.75] text-[#232323] sm:mt-3 sm:text-[15px] md:text-[16px]">
                  {withEmail(
                    t(`${tKey}.sections.${key}.body`),
                    emails[key] ? t(`${tKey}.${emails[key]}`) : undefined,
                  )}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer variant="light" />
    </div>
  );
}
