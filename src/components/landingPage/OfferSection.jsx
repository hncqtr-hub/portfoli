"use client";
import { useTranslation } from 'react-i18next';
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from '@/lib/axios';
import Skeleton from '@/components/ui/Skeleton';

export default function OfferSection() {
  const { t } = useTranslation('common');
  const [current, setCurrent] = useState(0);
  const [offerImages, setOfferImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const defaultSlides = [
    {
      image: "/images/offer1.jpeg",
      title: t('offer.slide1.title'),
      offer: t('offer.slide1.offer'),
      heading: t('offer.slide1.heading'),
      desc: [
        t('offer.slide1.desc1'),
        t('offer.slide1.desc2')
      ],
    },
    {
      image: "/images/offer2.jpeg",
      title: t('offer.slide2.title'),
      offer: t('offer.slide2.offer'),
      heading: t('offer.slide2.heading'),
      desc: [
        t('offer.slide2.desc1'),
        t('offer.slide2.desc2')
      ],
    },
    {
      image: "/images/offer3.jpeg",
      title: t('offer.slide3.title'),
      offer: t('offer.slide3.offer'),
      heading: t('offer.slide3.heading'),
      desc: [
        t('offer.slide3.desc1'),
        t('offer.slide3.desc2')
      ],
    },
  ];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axios.get('/api/hero');
        if (res.data && res.data.offerImages && res.data.offerImages.length > 0) {
          setOfferImages(res.data.offerImages);
        }
      } catch (error) {
        console.error("Failed to fetch offer images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Merge dynamic images with default text
  const slides = loading 
    ? [] 
    : (offerImages.length > 0
    ? offerImages.map((img, index) => {
      // Cycle through default text templates
      const template = defaultSlides[index % defaultSlides.length];
      return {
        ...template,
        image: img
      };
    })
    : defaultSlides);

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 3000); // 3 seconds auto-rotation
    return () => clearInterval(timer);
  }, [current, slides.length]); // Added slides.length dependency

  const next = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Determine standard position: center, left, right
  const getPosition = (index) => {
    if (index === current) return "center";
    if (index === (current - 1 + slides.length) % slides.length) return "left";
    if (index === (current + 1) % slides.length) return "right";
    return "hidden";
  };

  if (loading) {
    return (
      <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-brand-navy">
        <div className="relative z-10 w-full max-w-7xl h-full flex items-center justify-center perspective-1000">
           <div className="flex gap-8 items-center justify-center w-full px-6">
              {/* Left Skeleton Card */}
              <div className="hidden md:block w-[350px] h-[450px] rounded-3xl border border-white/5 bg-white/5 relative overflow-hidden opacity-30 scale-90">
                 <Skeleton className="absolute inset-0" />
              </div>

              {/* Center Skeleton Card */}
              <div className="w-full max-w-[400px] h-[500px] rounded-3xl border border-[#c8b08a]/20 bg-white/5 relative overflow-hidden shadow-2xl">
                 <Skeleton className="absolute inset-0" />
                 <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
                    <Skeleton className="h-8 w-3/4 bg-white/20" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                    <div className="flex gap-2">
                       <Skeleton className="h-2 w-full bg-white/5" />
                       <Skeleton className="h-2 w-full bg-white/5" />
                    </div>
                 </div>
              </div>

              {/* Right Skeleton Card */}
              <div className="hidden md:block w-[350px] h-[450px] rounded-3xl border border-white/5 bg-white/5 relative overflow-hidden opacity-30 scale-90">
                 <Skeleton className="absolute inset-0" />
              </div>
           </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-brand-navy"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background  Ambience */}
      <div className="absolute inset-0 z-0">
        {/* Use current slide for background, ensuring it exists */}
        {slides[current] && (
          <Image
            src={slides[current].image}
            alt="Background"
            fill
            loading="lazy"
            className="object-cover opacity-20 blur-2xl scale-110 transition-all duration-1000"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1021]/80 via-[#0D1021]/50 to-[#0D1021]/90" />
      </div>

      <div className="relative z-10 w-full max-w-7xl h-full flex items-center justify-center perspective-1000">
        {slides.map((slide, index) => {
          const position = getPosition(index);
          const isCenter = position === "center";

          return (
            <div
              key={index}
              className={`absolute transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu
                ${isCenter ? "z-30 scale-100 opacity-100 translate-x-0 brightness-110" : ""}
                ${position === "left" ? "z-10 scale-[0.85] opacity-0 md:opacity-60 -translate-x-0 md:-translate-x-[380px] brightness-75 grayscale-[30%] pointer-events-none md:pointer-events-auto" : ""}
                ${position === "right" ? "z-10 scale-[0.85] opacity-0 md:opacity-60 translate-x-0 md:translate-x-[380px] brightness-75 grayscale-[30%] pointer-events-none md:pointer-events-auto" : ""}
                ${position === "hidden" ? "z-0 opacity-0 scale-50" : ""}
              `}
              style={{
                width: 'min(90%, 400px)',
                height: 'min(500px, 70vh)', // Responsive height
                boxShadow: isCenter ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none'
              }}
            >
              {/* Card Container */}
              <div className={`w-full h-full relative rounded-3xl overflow-hidden border ${isCenter ? 'border-[#c8b08a]/50' : 'border-white/10'} bg-brand-navy`}>

                {/* Full Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title || "Offer"}
                  fill
                  loading="lazy"
                  className={`object-cover transition-transform duration-1000 ${isCenter ? 'scale-110 hover:scale-125 cursor-pointer' : 'scale-100'}`}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Content Section - kept if user wants it back, but commented out per original file */}
                {/* ... */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-40 p-3 md:p-4 rounded-full bg-white/10 hover:bg-[#c8b08a] text-white hover:text-black backdrop-blur-md transition-all shadow-lg border border-white/10 group"
      >
        <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-40 p-3 md:p-4 rounded-full bg-white/10 hover:bg-[#c8b08a] text-white hover:text-black backdrop-blur-md transition-all shadow-lg border border-white/10 group"
      >
        <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Progress/Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-500 ${idx === current ? "w-8 bg-[#c8b08a]" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
