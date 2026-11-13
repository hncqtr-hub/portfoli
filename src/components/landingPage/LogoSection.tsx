"use client";
import { useTranslation } from 'react-i18next';
import Image from "next/image";
import { motion } from 'framer-motion';

export default function LogoSection() {
  const { t } = useTranslation('common');
  return (
    <section className="relative w-full bg-brand-navy overflow-hidden py-16 md:py-20">
      {/* Ambient glow */}
      <div
        className="hnc-glow"
        style={{
          background: 'radial-gradient(circle, rgba(227,30,36,0.12), transparent 70%)',
          width: 520,
          height: 520,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="hnc-eyebrow hnc-eyebrow--center">
            {t('logoSection.title')}
          </span>
        </motion.div>

        {/* Hairline above the logo row */}
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="hnc-hairline" />
        </div>

        {/* Logo row */}
        <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center justify-center gap-14 md:mt-12 md:flex-row md:gap-20">

          {/* Logo 1 */}
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/images/abcdn.png"
              alt="Hot N Cool"
              width={240}
              height={240}
              className="mx-auto h-auto w-full max-w-[200px] opacity-90 transition-all duration-300 hover:scale-110 hover:opacity-100 cursor-pointer md:max-w-[240px]"
            />
          </motion.div>

          {/* Logo 2 */}
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Image
              src="/images/HnC_Logo.png"
              alt="Hot N Cool Signature"
              width={260}
              height={260}
              className="mx-auto h-auto w-full max-w-[220px] opacity-90 transition-all duration-300 hover:scale-110 hover:opacity-100 cursor-pointer md:max-w-[260px]"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
