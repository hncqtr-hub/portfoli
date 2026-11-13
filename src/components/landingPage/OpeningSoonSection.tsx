"use client";
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Image from "next/image";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Skeleton from '@/components/ui/Skeleton';

export default function OpeningSoonSection() {
  const { t } = useTranslation('common');
  const [images, setImages] = useState(['', '', '']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get('/api/hero');
        if (res.data && res.data.openingSoonImages) {
          const newImages = ['', '', ''];
          res.data.openingSoonImages.forEach((img: string, i: number) => {
            if (i < 3) newImages[i] = img || '';
          });
          setImages(newImages);
        }
      } catch (error) {
        console.error("Failed to fetch opening soon images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <section className="relative w-full bg-brand-navy py-10 overflow-hidden pt-0 md:pt-24 lg:pt-0">
      {/* Background Image (Bottom Part) removed */}

      {/* Dark top section updated to brand-navy */}
      <div className="bg-brand-navy pt-16 pb-37 md:pb-40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0"

        >

          {/* Left text */}
          <motion.div
            className="text-white"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl philosopher mb-4">
              {t('openingSoon.title')}
            </h2>

            <p className="junge opacity-80 max-w-sm text-sm md:text-base">
              {t('openingSoon.description')}
            </p>
          </motion.div>

          {/* Button */}
          {/* <button className="bg-white/20 text-white px-5 py-2 rounded-full mina hover:bg-white/30 transition self-end md:self-auto">
            {t('openingSoon.cta')}
          </button> */}
        </div>
      </div>

      {/* Cards */}
      <div
        className="max-w-7xl mx-auto px-6 -mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
      >

        {loading ? (
          [1, 2, 3].map((_, i) => (
            <div key={i} className="relative h-[300px] md:h-[480px] rounded-3xl overflow-hidden border border-white/5 bg-white/5">
               <Skeleton className="absolute inset-0" />
               <div className="absolute inset-0 p-6 flex flex-col justify-end gap-3">
                  <Skeleton className="h-6 w-2/3 bg-white/10" />
                  <Skeleton className="h-3 w-1/2 bg-white/5" />
               </div>
            </div>
          ))
        ) : (
          images.map(
            (img, i) => (
              <motion.div
                key={i}
                className="relative h-[300px] md:h-[480px] rounded-3xl overflow-hidden shadow-lg group cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                <Image
                  src={img || `/images/opening${i + 1}.png`}
                  alt="Building"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </motion.div>
            )
          )
        )}

      </div>
    </section>
  );
}
