"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* One observer for every scroll-revealed heading and caption on the site.
   Elements opt in with `data-anim`; the class lands once and the element is
   dropped from the observer, so scrolling back up never replays it.

   Re-runs on navigation because the App Router swaps the tree in place, which
   leaves a new page's elements unobserved otherwise. Anything already past
   the fold is caught on the first callback, which fires as soon as it is
   observed. */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    /* No early return when this is empty: a page whose only headings come from
       a fetch (Find Us) has none yet, and the MutationObserver below is what
       picks them up when they arrive. */
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-anim]:not(.is-in)"),
    );

    /* No observer support: show everything rather than leave it at opacity 0. */
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      /* Held back slightly from the bottom edge so a heading starts moving
         just after it is properly on screen, not while it is still a sliver. */
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    els.forEach((el) => io.observe(el));

    /* Gallery and Find Us build their headings from a fetch that lands after
       this effect has run. Without this those nodes would never be observed,
       and since the start state is opacity 0 they would simply stay invisible. */
    const mo = new MutationObserver((records) => {
      records.forEach((rec) => {
        rec.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const fresh = node.matches("[data-anim]")
            ? [node]
            : Array.from(node.querySelectorAll<HTMLElement>("[data-anim]"));
          fresh.forEach((el) => {
            if (!el.classList.contains("is-in")) io.observe(el);
          });
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
