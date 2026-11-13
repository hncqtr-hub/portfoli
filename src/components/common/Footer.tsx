"use client";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

/* Closest existing asset that renders correctly on the red field: navy-filled
   badge with the HOT N COOL arc, Since 1991 and الحار والبارد.
   ponytail: the reference's Express lockup is not in public/images. logooo.png
   has the mascot but its light areas carry ~39% alpha, so the red bleeds
   through it. Drop the real logo in and point SEAL at it. */
const SEAL = "/images/Use_Color_Bg-01.png";

/* ponytail: Facebook has a real profile URL; the rest keep the "#" the previous
   footer used until their URLs are known. An entry only opens in a new tab once
   it has an href, so the placeholders stay in-tab and inert. */
/* Online delivery platforms.

   `logo` points at the artwork that ships in public/images. Each file is a
   square, full-bleed tile with the platform's own brand colour baked in, so it
   fills the rounded tile exactly; `bg`/`fg` stay as the colour behind it while
   it loads, and they match each logo's own field.

   ponytail: Talabat has no file in public/images, so it keeps the letterform
   tile the others used to have. Drop a talabat logo in beside the rest and give
   it a `logo` to finish the row. */
const PLATFORMS: {
  label: string;
  href: string;
  bg: string;
  fg: string;
  mark: string;
  logo?: string;
}[] = [
    { label: "Snoonu", href: "https://snoonu.com/restaurants/hot-n-cool-express-restaurant", bg: "#DB031A", fg: "#FFFFFF", mark: "S", logo: "/images/snoonu_logo.webp" },
    { label: "Talabat", href: "https://www.talabat.com/qatar/hot-n-cool-express", bg: "#FE5900", fg: "#FFFFFF", mark: "t" },
    { label: "Keeta", href: "https://url-eu.mykeeta.com/MJ4gncpz", bg: "#F9DF04", fg: "#1B5E20", mark: "Keeta", logo: "/images/keeta_logo.webp" },
    { label: "Rafeeq", href: "https://www.gorafeeq.com/en/home/restaurants/hot-n-cool-express-restaurant-32103", bg: "#7B1CD8", fg: "#FFFFFF", mark: "R", logo: "/images/gorafeek_logo.webp" },
  ];

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/hotncoolexpress",
    path: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/hotncool.express/",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.89 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@hotncool.express",
    path: "M17.1 11.13c-.1-.05-.2-.09-.3-.13-.18-3.3-1.98-5.18-5-5.2h-.04c-1.8 0-3.3.77-4.23 2.18l1.66 1.14c.69-1.05 1.78-1.27 2.57-1.27h.03c.98 0 1.72.29 2.2.85.35.4.58.97.7 1.68a12.6 12.6 0 0 0-2.84-.14c-2.86.17-4.7 1.84-4.58 4.17.06 1.18.65 2.2 1.66 2.86.85.56 1.94.83 3.08.77 1.5-.08 2.68-.65 3.5-1.7.63-.8 1.02-1.83 1.2-3.12.72.44 1.25 1.01 1.55 1.7.5 1.18.53 3.12-1.05 4.7-1.38 1.38-3.05 1.98-5.57 2-2.8-.02-4.92-.92-6.3-2.67C4.05 17.3 3.38 15 3.35 12c.03-3 .7-5.3 1.99-6.93C6.72 3.32 8.84 2.42 11.64 2.4c2.82.02 4.97.92 6.4 2.68.7.86 1.23 1.95 1.58 3.21l1.95-.52c-.43-1.56-1.1-2.9-2.01-4.02C17.72 1.48 15.05.32 11.65.3h-.01C8.25.32 5.61 1.49 3.8 3.77 2.2 5.8 1.37 8.62 1.34 12v.01c.03 3.37.86 6.19 2.46 8.22 1.81 2.28 4.45 3.45 7.84 3.47h.01c3.02-.02 5.15-.81 6.9-2.56 2.3-2.29 2.23-5.16 1.47-6.92-.54-1.26-1.58-2.29-2.92-2.99Zm-5.2 5.14c-1.26.07-2.57-.5-2.63-1.7-.05-.9.64-1.9 2.71-2.02.24-.1.47-.2.7-.02.75 0 1.46.07 2.1.21-.24 2.98-1.64 3.47-2.88 3.53Z",
  },
  {
    label: "X",
    href: "https://x.com/Hotncoolexpress",
    path: "M18.9 2.6h3.3l-7.2 8.2 8.5 11.2h-6.7l-5.2-6.9-6 6.9H1.3l7.7-8.8L.9 2.6h6.8l4.7 6.3 5.5-6.3Zm-1.2 17.5h1.9L6.4 4.5H4.4l13.3 15.6Z",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@hotncoolexpress",
    path: "M16.6 5.82a4.28 4.28 0 0 1-1.03-2.82h-3.2v12.86a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1 0-5.2c.27 0 .52.05.76.12v-3.3a5.88 5.88 0 0 0-.76-.05A5.85 5.85 0 0 0 4 15.86a5.85 5.85 0 0 0 9.5 4.56 5.85 5.85 0 0 0 2.26-4.6V9.4a7.46 7.46 0 0 0 4.35 1.4V7.6a4.3 4.3 0 0 1-3.5-1.78Z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@hotncoolme",
    path: "M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z",
  },
  {
    label: "Snapchat",
    href: "https://snapchat.com/t/cu597aBc",
    path: "M12.2 2c2.6.01 4.77 2.1 4.86 4.7.03.7 0 1.4-.04 2.1 0 .12.03.18.15.22.3.1.62.12.93.06.3-.6.6.4.83.25.3.27.28.74-.05 1-.28.22-.62.3-.96.38-.5.12-.7.44-.53.93.6 1.7 1.73 2.9 3.4 3.6.3.13.45.3.4.63-.5.32-.3.46-.6.55-.5.15-1.02.2-1.53.3-.3.05-.43.2-.48.5-.3.2-.9.4-.14.6-.8.3-.27.42-.58.36-.5-.1-1-.2-1.5-.2-1.03-.02-1.9.36-2.62 1.08-.32.32-.66.6-1.08.78-1.13.47-2.16.28-3.1-.46-.35-.28-.67-.6-1.04-.86-.7-.48-1.47-.62-2.3-.5-.4.05-.8.13-1.2.2-.3.05-.5-.06-.57-.35-.05-.2-.1-.4-.13-.6-.05-.34-.2-.5-.54-.55-.5-.07-.98-.13-1.46-.27-.32-.1-.55-.25-.6-.6-.03-.3.12-.46.4-.58 1.6-.68 2.73-1.83 3.35-3.46.2-.55.02-.87-.55-1-.3-.07-.62-.15-.88-.35-.36-.27-.4-.74-.08-1.03.22-.2.5-.3.8-.24.33.06.66.04.97-.7.1-.3.13-.9.13-.2-.04-.72-.08-1.44-.04-2.16C7.1 4.05 9.3 2 11.9 2h.3Z",
  },
];

interface FooterProps {
  className?: string;
  /* Accepted for API compatibility with the About / Careers / Find-us pages;
     the previous implementation ignored it too. */
  variant?: "light" | "dark";
  /* The Franchise page swaps the Legal and Office columns for a two-column
     Popular Searches block; every other page keeps the standard set. */
  layout?: "default" | "franchise";
}

export default function Footer({ className = "", layout = "default" }: FooterProps) {
  const { t } = useTranslation("common");
  const isFranchise = layout === "franchise";

  /* Franchise reference shows only Qatar + Company before Popular Searches. */
  const popularHeading = t("footer.popular.heading", "Popular Searches");
  const popularItems = t("footer.popular.items", { returnObjects: true }) as string[];
  const popular = Array.isArray(popularItems) ? popularItems : [];
  const popularCols = [popular.slice(0, Math.ceil(popular.length / 2)), popular.slice(Math.ceil(popular.length / 2))];

  /* footer.address already reads "OFFICE-04 / Building 01 / Janoub Square /
     Al-Wukair" — the reference's fourth column verbatim. */
  const addressLines = t("footer.address").split("\n").filter(Boolean);
  const officeHeading = addressLines[0] ?? "";
  const officeRest = addressLines.slice(1);

  /* ponytail: /franchise still has no page, so that link keeps the "#" the
     previous footer used. Privacy and Terms now point at real routes. */
  const allColumns = [
    {
      heading: t("footer.nav.qatar", "Qatar"),
      links: [
        { label: t("header.menu", "Menu"), href: "/menu" },
        { label: t("footer.nav.locations", "Locations"), href: "/findMore" },
        { label: t("footer.nav.contact", "Contact Us"), href: "/about" },
      ],
    },
    {
      heading: t("footer.nav.company", "Company"),
      links: [
        { label: t("footer.nav.story", "Story"), href: "/about" },
        { label: t("footer.nav.franchise", "Franchise"), href: "/franchise" },
      ],
    },
    {
      heading: t("footer.nav.legal", "Legal"),
      links: [
        { label: t("footer.privacy"), href: "/privacy-policy" },
        { label: t("footer.terms"), href: "/terms-of-use" },
      ],
    },
  ];

  /* Franchise drops Legal; the standard footer keeps all three. */
  const columns = isFranchise ? allColumns.slice(0, 2) : allColumns;

  return (
    <footer
      className={twMerge(
        "relative w-full overflow-hidden bg-hnc-red pt-14 pb-20 md:pt-16 md:pb-24",
        className,
      )}
    >
      {/* Subtle lift toward the lower right, as in the reference */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_72%_78%,rgba(206,40,46,0.55),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto w-[90%] max-w-[1240px] sm:w-[86%]">
        {/* ---------- Seal + social row ---------- */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:gap-9">
          <Link href="/" className="shrink-0">
            {/* The PNG is square but the lockup only fills the middle of it
                (16% pad left, 22.7% right, 7.8% top and bottom — measured off
                the file's alpha). Those margins cancel that padding at the
                190px size so the layout box equals the visible ink and the
                seal lines up with the divider and the social row. */}
            <img
              src={SEAL}
              alt="Hot N Cool"
              className="w-[150px] object-contain md:-mt-[15px] md:-mb-[15px] md:-ms-[14px] md:-me-[43px] md:w-[190px] md:max-w-none"
            />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:justify-start lg:gap-[21px]">
            {SOCIALS.map((social) => (
              <Link
                key={social.label}
                href={social.href ?? "#"}
                aria-label={social.label}
                {...(social.href
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0D1021] transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-brand-gold focus-visible:bg-brand-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold lg:h-[38px] lg:w-[38px]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[18px] w-[18px]"
                >
                  <path d={social.path} />
                </svg>
              </Link>
            ))}
          </div>

          {/* ---------- Online Delivery Platforms ---------- */}
          {/* Sits opposite the seal on the upper right, as in the reference:
              heading above a rounded outline holding the platform tiles. */}
          <div className="flex w-full flex-col items-center gap-3 md:ms-auto md:w-auto md:items-end">
            <p className="font-proza text-[13px] font-semibold text-white md:text-[15px]">
              {t("footer.delivery", "Online Delivery Platforms")}
            </p>
            <ul className="flex items-center gap-2 rounded-[18px] border border-white/40 px-2.5 py-2 sm:gap-3 sm:px-3 md:rounded-[22px]">
              {PLATFORMS.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    aria-label={p.label}
                    className="flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-[12px] transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-[54px] sm:w-[54px] md:rounded-[14px]"
                    style={{ backgroundColor: p.bg, color: p.fg }}
                  >
                    {p.logo ? (
                      <Image
                        src={p.logo}
                        alt=""
                        aria-hidden="true"
                        width={54}
                        height={54}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className={
                          p.mark.length > 1
                            ? "font-proza text-[11px] font-extrabold leading-none sm:text-[13px]"
                            : "font-proza text-[26px] font-extrabold leading-none sm:text-[30px]"
                        }
                      >
                        {p.mark}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Divider ---------- */}
        <hr className="mt-8 border-t border-white/85 md:mt-7" />

        {/* ---------- Four columns ----------
            The reference leaves the right quarter empty, so the grid is capped
            rather than stretched across the container. */}
        <div className="mt-10 grid w-full max-w-full grid-cols-2 gap-x-8 gap-y-10 md:mt-12 md:grid-cols-4 md:gap-x-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="font-proza text-[13px] uppercase tracking-wide text-white/55">
                {col.heading}
              </p>
              <ul className="mt-5 space-y-[18px]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-proza text-[14px] uppercase text-white transition-opacity hover:opacity-75"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Popular Searches — the Franchise reference's two-column keyword list,
              occupying the space the Legal and Office columns use elsewhere. */}
          {isFranchise && (
            <div className="col-span-2 md:col-span-2">
              <p className="font-proza text-[13px] uppercase tracking-wide text-white/55">
                {popularHeading}
              </p>
              <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-[18px] sm:grid-cols-2">
                {popularCols.map((group, gi) => (
                  <ul key={gi} className="space-y-[18px]">
                    {group.map((item, ii) => (
                      <li
                        key={`${gi}-${ii}`}
                        className="font-proza text-[14px] text-white"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          )}

          {/* Office column — existing footer.address, unchanged */}
          {!isFranchise && (
            <div>
              <p className="font-proza text-[13px] uppercase tracking-wide text-white">
                {officeHeading}
              </p>
              <address className="mt-4 space-y-[10px] font-proza text-[14px] not-italic text-white/90">
                {officeRest.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          )}

        </div>
      </div>
    </footer>
  );
}
