"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BrandHeading } from "@/components/ui/BrandHeading";
import '@/lib/i18n';
import Footer from "@/components/common/Footer";

interface GalleryItem {
  _id: string;
  type: 'image' | 'text';
  src?: string;
  category: string;
  content?: { en: string; ar: string };
  subcontent?: { en: string; ar: string };
  style?: 'large' | 'small';
}

export default function GalleryPage() {
  const { t, i18n } = useTranslation('common');
  const [activeCategory, setActiveCategory] = useState("foods");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: "foods", label: "tabs.foods" },
    { id: "events", label: "tabs.events" },
    { id: "restaurant", label: "tabs.restaurant" }
  ];

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Map category IDs to data categories
  const getCategoryFilter = (id: string) => {
    switch (id) {
      case "foods": return "Foods";
      case "events": return "Events";
      case "restaurant": return "Restaurant";
      default: return "Foods";
    }
  };

  const activeFilter = getCategoryFilter(activeCategory);

  const displayData = items.filter(item => item.category === activeFilter);
  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Hero Section */}
      <div className="relative h-[30vh]  md:h-[50vh] lg:h-[430px] w-full md:w-[767px] lg:w-full bg-black">
        <Image
          src="/images/Baner_our_gallery.jpeg"
          alt="Gallery Hero"
          fill
          className=""
          priority
        />
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-0 z-30 bg-brand-navy/95 backdrop-blur-md py-4 md:py-6 border-b border-brand-red/20 shadow-md shadow-black/20 transition-all duration-300">
        <div className={`max-w-7xl mx-auto flex justify-start md:justify-center gap-3 md:gap-6 lg:gap-8 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap ${isRTL ? 'px-4 md:px-12 lg:px-24' : 'px-4 md:px-8 lg:px-0'}`}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-sm md:text-base lg:text-lg transition-all duration-300 relative px-5 md:px-6 py-2 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${activeCategory === cat.id
                ? "text-white bg-brand-red shadow-lg shadow-brand-red/30"
                : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
            >
              {t(`galleryPage.${cat.label}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-[1440px] mx-auto px-4 py-8 md:py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Filtered View (Masonry via Columns) */}
            <div className="hidden md:block md:columns-2 lg:columns-3 md:gap-4 lg:gap-6 md:space-y-4 lg:space-y-6">
              {displayData.map((item) => (
                <GalleryItem key={item._id} item={item} />
              ))}
            </div>

            {/* Mobile View (Grid) */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {displayData.map((item) => (
                <GalleryItem
                  key={item._id}
                  item={item}
                  className={item.type === 'text' ? 'col-span-2' : ''}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

// Helper Component for Rendering Items
function GalleryItem({ item, className = "" }: { item: GalleryItem, className?: string }) {
  const { i18n } = useTranslation('common');
  const lang = i18n.language as 'en' | 'ar';

  // Get content based on current language, fallback to English if missing
  const content = item.content?.[lang] || item.content?.en;
  const subcontent = item.subcontent?.[lang] || item.subcontent?.en;

  if (item.type === "text") {
    return (
      <div className={`break-inside-avoid p-4 flex flex-col justify-center ${className}`}>
        {item.style === 'large' ? (
          <h2 data-anim="lift" className="text-4xl md:text-5xl philosopher text-brand-red leading-tight drop-shadow-sm">
            {content}
          </h2>
        ) : (
          <div className="mt-4">
            <h3 data-anim="lift" className="text-3xl philosopher text-white mb-3">
              {content}
            </h3>
            {subcontent && (
              <p data-anim="lift" data-anim-step="1" className="text-gray-300 leading-relaxed whitespace-pre-line mina">
                {subcontent}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`break-inside-avoid group relative overflow-hidden rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5 hover:border-brand-red/30 hover:shadow-brand-red/10 transition-all duration-500 ${className}`}>
      <div className="relative w-full">
        {item.src && (
          <img
            src={item.src}
            alt={item.category || "Gallery Image"}
            className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-700 ease-out"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
    </div>
  );
}
