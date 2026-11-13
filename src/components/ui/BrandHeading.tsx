"use client";
import React from "react";
import { motion } from "framer-motion";

interface BrandHeadingProps {
  children: React.ReactNode;
  tagline?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  center?: boolean;
  textSize?: string;
}

export const BrandHeading = ({
  children,
  tagline,
  className = "",
  as: Component = "h1",
  center = true,
  textSize = "text-5xl sm:text-6xl md:text-7xl"
}: BrandHeadingProps) => {
  /* Page-level heading on the inner pages. Rides the shared scroll reveal
     rather than its own framer copy, so it matches every other section
     heading and reduced motion is handled in one place. */
  return (
    <div
      data-anim="lift"
      className={`relative flex flex-col ${center ? "items-center text-center" : "items-start text-left"} ${className}`}
    >
      <Component className={`relative z-10 ${textSize} font-semibold uppercase tracking-tight philosopher leading-none drop-shadow-2xl`}>
        <span className="block text-white leading-tight">{children}</span>

        {/* Tagline */}
        {tagline && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="block text-lg sm:text-xl md:text-xl font-light normal-case tracking-normal text-white/80 mt-1 philosopher italic"
          >
            {tagline}
          </motion.span>
        )}

        {/* Decorative elements */}
        <span className="absolute -inset-x-4 -inset-y-2 bg-brand-red/10 blur-3xl -z-10 rounded-full" />
      </Component>

      {/* Brand Accent Line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100px" }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="h-1.5 bg-brand-red rounded-full mt-4"
      />
    </div>
  );
};
