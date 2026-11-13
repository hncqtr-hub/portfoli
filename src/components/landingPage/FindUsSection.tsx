"use client";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { motion } from "framer-motion";
import { rosetteBandStyle } from "@/components/ui/rosettePattern";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* Turbopack hands an image imported from node_modules over as a URL string,
   webpack as { src }; accept either so the pins never lose their icon. */
const assetUrl = (img: string | { src: string }) => (typeof img === "string" ? img : img.src);

/* The map's pins are fixed here, not read from the branch records. */
const locations = [
  { id: 1, name: "Al Wukair", lat: 25.15684696813162, lng: 51.5464890981452 },
  { id: 2, name: "Al Wakrah", lat: 25.152951997186133, lng: 51.5985281693088 },
  { id: 3, name: "Al Jabal", lat: 25.144280365733295, lng: 51.5998358865092 },
  { id: 4, name: "Al Rayyan", lat: 25.297524249339673, lng: 51.42024214418199 },
  { id: 5, name: "Al Khor", lat: 25.680810839681754, lng: 51.52427917301841 },
];

export default function FindUsSection() {
  const { t } = useTranslation("common");
  const mapRef = useRef<HTMLElement>(null);

  /* Leaflet reads `window` as soon as it loads, so it is imported in the
     browser here rather than at the top, which also runs on the server. */
  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !mapRef.current) return;
      // CommonJS package: bundlers hand it over as `default` or as named exports.
      const L = mod.default ?? mod;
      /* Leaflet's default pin finds its images via CSS-relative paths that a
         bundler breaks; point it at the copies the bundler serves instead. */
      const icon = L.icon({
        iconUrl: assetUrl(markerIcon),
        iconRetinaUrl: assetUrl(markerIcon2x),
        shadowUrl: assetUrl(markerShadow),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      // No wheel zoom, so scrolling the page past the map never gets caught.
      map = L.map(mapRef.current, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      // Brand on line 1, branch on line 2 (names are the constants above, so no escaping needed).
      const pins = L.featureGroup(
        locations.map((l) => {
          const label = `Hot N Cool,\n${l.name}`;
          return L.marker([l.lat, l.lng], {
            icon,
            title: label,
            alt: label,
          }).bindPopup(`<strong>Hot N Cool<br>${l.name}</strong>`);
        }),
      ).addTo(map);
      // Frame all five pins rather than a fixed zoom that could hide one.
      map.fitBounds(pins.getBounds(), { padding: [32, 32] });
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  /* Colour only the brand words inside line 2, which works in both locales
     ("Hot n Cool branch" / "فرع الحار والبارد"). */
  const line2 = t("findUs.line2", "Hot n Cool branch");
  const brand = t("findUs.brand", "Hot n Cool");
  const at = line2.indexOf(brand);
  const before = at >= 0 ? line2.slice(0, at) : line2;
  const after = at >= 0 ? line2.slice(at + brand.length) : "";

  return (
    /* Same hnc-red the footer uses, so this section and the footer read as one
       continuous red field with no seam at the join. The rosette band along the
       bottom edge is the only separation, as in the reference. */
    <section
      aria-labelledby="findus-heading"
      className="relative w-full overflow-hidden bg-hnc-red"
    >
      <div className="mx-auto w-full max-w-[900px] px-6 pt-14 md:pt-16 lg:w-[58%] lg:px-0">
        {/* ---------- Heading ---------- */}
        <h2
          data-anim="lift"
          id="findus-heading"
          className="font-proza text-[26px] italic leading-[1.22] sm:text-[30px] lg:ps-[8%] lg:text-[34px]"
        >
          <span className="block text-white">
            {t("findUs.line1", "Find the nearest")}
          </span>
          <span className="block text-white">
            {before}
            {at >= 0 && <span className="text-hnc-cream">{brand}</span>}
            {after}
          </span>
        </h2>

        {/* ---------- Map (Leaflet + OpenStreetMap, fixed pins) ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8 aspect-[2/1] w-full overflow-hidden border border-black/70 bg-neutral-200 md:mt-10"
        >
          {/* `isolate` keeps Leaflet's internal z-indexes (400-1000) inside
              this box, so the map never paints over the fixed navbar. */}
          <section
            ref={mapRef}
            aria-label={t("findUs.mapTitle", {
              name: t("findUs.brand", "Hot n Cool"),
              defaultValue: "Map of {{name}}",
            })}
            className="isolate h-full w-full"
          />
        </motion.div>

        {/* ---------- CTA + supporting line ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <Link
            href="/findMore"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-brand-scarlet px-6 py-2.5 font-proza text-[15px] text-white transition-transform duration-300 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:mt-11"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t("findUs.cta", "View All Outlets")}
          </Link>

          <p className="mt-4 text-center font-proza text-[15px] text-white/85">
            {t("findUs.sub", "See all outlet locations and details")}
          </p>
        </motion.div>
      </div>

      {/* ---------- Decorative band along the bottom edge ---------- */}
      {/* The brand motif from public/images/01-01.png, same source the Our Story
          divider and the chairman strips use. This band previously drew its own
          eight-petal rosette from rounded rects, which is a different flower
          from the six-petal one the rest of the site uses.

          `rosetteBandStyle` sizes the tile off the band height and repeats with
          `round`, so the row lands on a whole number of flowers at every width -
          no sliced motif at either edge. */}
      <div
        aria-hidden="true"
        role="presentation"
        className="mt-10 h-[38px] w-full opacity-20 md:mt-12"
        style={rosetteBandStyle(0.92, 40, "#FFFFFF")}
      />
    </section>
  );
}
