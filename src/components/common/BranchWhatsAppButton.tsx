"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import axios from "@/lib/axios";
import { branchWhatsApp } from "@/lib/whatsapp";

interface Branch {
  _id: string;
  name: { en: string; ar: string };
  address: { en: string; ar: string };
  phone: string;
  whatsapp?: string;
}

const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/* Floating WhatsApp button. Clicking it opens a branch picker instead of going
   straight to a chat; the number dialled is whatever the admin panel holds for
   the branch the visitor picks. Branches whose stored number is not a usable
   WhatsApp number are listed but not clickable, so a dead wa.me link is never
   opened.

   The panel is absolutely positioned off the button rather than laid out in a
   flex column with it: `items-end` is direction-relative, so in Arabic (dir=rtl)
   it would drag the button to the far side of the panel, and a wrapper sized to
   the panel would also swallow taps next to the button that should dismiss it. */
export default function BranchWhatsAppButton({
  className,
  buttonClassName,
}: {
  className?: string;
  buttonClassName?: string;
}) {
  const { t, i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [failed, setFailed] = useState(false);
  const requested = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const lang = i18n.language === "ar" ? "ar" : "en";

  /* Not tied to `open`: closing the popup mid-flight used to discard a reply
	   that had already arrived, so re-opening restarted the skeleton. */
  const load = useCallback(() => {
    requested.current = true;
    setFailed(false);
    setBranches(null);
    axios
      .get("/api/branches")
      .then((res) => setBranches(Array.isArray(res.data) ? res.data : []))
      .catch(() => setFailed(true));
  }, []);

  // Fetched on first open, so the page does not pay for it on every visit.
  useEffect(() => {
    if (open && !requested.current) load();
  }, [open, load]);

  // Escape, and pointer events outside the button+panel, close it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const status = failed
    ? t("whatsapp.error", "Could not load branches.")
    : !branches
      ? t("whatsapp.loading", "Loading branches")
      : branches.length === 0
        ? t("whatsapp.empty", "No branches available right now.")
        : t("whatsapp.loaded", "Branches loaded");

  return (
    <div
      ref={rootRef}
      className={`fixed z-[60] ${className ?? "bottom-6 right-6"}`}
    >
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t("whatsapp.title", "Chat with a branch")}
          tabIndex={-1}
          className="absolute bottom-full right-0 mb-3 flex max-h-[calc(100dvh-7rem)] w-[min(86vw,340px)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 focus:outline-none"
        >
          <div className="flex shrink-0 items-start justify-between gap-3 bg-hnc-red px-4 py-3 text-white">
            <div>
              <p className="font-proza text-[15px] font-bold leading-tight">
                {t("whatsapp.title", "Chat with a branch")}
              </p>
              <p className="font-proza text-[12px] leading-tight text-white/80">
                {t("whatsapp.subtitle", "Pick a branch to open WhatsApp")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label={t("whatsapp.close", "Close")}
              className="-me-1 shrink-0 rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Always present, so the loaded list and the error are both announced. */}
          <p className="sr-only" aria-live="polite">
            {status}
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {failed ? (
              <div className="px-4 py-6 text-center">
                <p className="font-proza text-[13px] text-neutral-600">
                  {t("whatsapp.error", "Could not load branches.")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    load();
                    panelRef.current?.focus(); // this button is about to unmount
                  }}
                  className="mt-2 font-proza text-[13px] font-semibold text-hnc-red underline underline-offset-2"
                >
                  {t("whatsapp.retry", "Try again")}
                </button>
              </div>
            ) : !branches ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded-lg bg-neutral-100"
                  />
                ))}
              </div>
            ) : branches.length === 0 ? (
              <p className="px-4 py-6 text-center font-proza text-[13px] text-neutral-600">
                {t("whatsapp.empty", "No branches available right now.")}
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {branches.map((branch) => {
                  const digits = branchWhatsApp(branch);
                  const name = branch.name?.[lang] || branch.name?.en || "";
                  const address =
                    branch.address?.[lang] || branch.address?.en || "";

                  return (
                    <li key={branch._id}>
                      {digits ? (
                        <a
                          href={`https://wa.me/${digits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-hnc-cream focus-visible:bg-hnc-cream focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-hnc-red"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-proza text-[14px] font-semibold text-neutral-800">
                              {name}
                            </span>
                            {address ? (
                              <span className="block truncate font-proza text-[12px] text-neutral-500">
                                {address}
                              </span>
                            ) : null}
                          </span>
                          <WhatsAppGlyph className="h-5 w-5 shrink-0 text-[#25D366]" />
                        </a>
                      ) : (
                        <div
                          className="flex items-center gap-3 px-4 py-3 opacity-60"
                          aria-disabled="true"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-proza text-[14px] font-semibold text-neutral-700">
                              {name}
                            </span>
                            <span className="block truncate font-proza text-[12px] text-neutral-500">
                              {t(
                                "whatsapp.unavailable",
                                "WhatsApp not available",
                              )}
                            </span>
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={
          buttonClassName ??
          "group relative flex items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl md:p-4"
        }
        aria-label={t("whatsapp.open", "Chat with us on WhatsApp")}
        title={t("whatsapp.open", "Chat with us on WhatsApp")}
      >
        {!open ? (
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-white px-3 py-1 text-sm font-medium text-gray-800 opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 md:block">
            {t("whatsapp.tooltip", "Chat with us!")}
          </span>
        ) : null}
        <WhatsAppGlyph className="h-6 w-6 md:h-8 md:w-8" />
      </button>
    </div>
  );
}
