"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";
import '@/lib/i18n';
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { BrandHeading } from "@/components/ui/BrandHeading";

// Zod Schema
const careerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(20, "First name cannot exceed 20 characters"),
  lastName: z.string().min(1, "Last name is required").max(20, "Last name cannot exceed 20 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 digits").max(20, "Phone number cannot exceed 20 characters").regex(/^[+]?[\d\s-]{8,}$/, "Invalid phone number format"),
  message: z.string().min(1, "Message is required").max(500, "Message cannot exceed 500 characters"),
  resume: z
    .any()
    .refine((files) => files?.length > 0, "Resume is required")
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const fileType = files[0]?.type;
      return ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(fileType);
    }, "Only PDF, DOC, and DOCX files are allowed"),
});

type CareerFormData = z.infer<typeof careerSchema>;

export default function CareersPage() {
  const { t, i18n } = useTranslation('common');

  /* Hero entrance: eyebrow, then title, then the line under it. */
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    }
  });

  const resumeFiles = watch("resume");

  const onSubmit = async (data: CareerFormData) => {
    setStatus('loading');

    const formData = new FormData();
    formData.append('name', `${data.firstName} ${data.lastName}`.trim());
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    // the API requires a non-empty position; this form does not collect one
    formData.append('position', 'General Application');
    formData.append('message', data.message);
    if (data.resume && data.resume[0]) {
      formData.append('resume', data.resume[0]);
    }

    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to submit application');

      setStatus('success');
      reset();
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy text-white">
      {/* Hero. Measured off the reference (a 2x downscale of a 937px capture):
          hero aspect 467/282, content column starts at 17% of the width, and the
          bottom notch is the same shape the Find Us hero uses. */}
      <section className="relative z-10 w-full border-t border-[#8A3B3A] aspect-[467/282] min-h-[420px] max-h-[750px]">
        {/* Photo layer runs --notch past the hero's bottom and is clipped to the
            hero box plus the downward notch (apex at 17.6%, mirrored in RTL), so
            the photo continues into the arrow over the cream band below. */}
        <div
          className="absolute inset-x-0 top-0 bottom-[calc(var(--notch)*-1)] [--apex:17.6%] [--notch:30px] rtl:[--apex:82.4%] sm:[--notch:52px] md:[--notch:84px]"
          style={{
            clipPath:
              'polygon(0 0, 100% 0, 100% calc(100% - var(--notch)), calc(var(--apex) + 5.3%) calc(100% - var(--notch)), var(--apex) 100%, calc(var(--apex) - 5.2%) calc(100% - var(--notch)), 0 calc(100% - var(--notch)))',
          }}
        >
          {/* event1-banner.jpeg is event1.jpeg with its bottom 26% removed - that
              band is the black tablecloth skirt below the buffet (mean luma 45-73
              against 130-215 across the subjects), and on a phone it could not be
              cropped away in CSS: at 390px the cover scale is height-driven, so the
              photo's full height is on screen and object-position has no vertical
              slack to work with. The cut lands on the table edge at 74%, keeping
              the team (48-72%) and the dishes whole.

              Anchored to the bottom so the crop always trims tent ceiling from the
              top and never the team or the table edge. The original asset is
              untouched in public/images. */}
          <Image
            src="/images/career_hero.jpg"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="h-full w-full  object-bottom "
          />
          {/* keeps the text legible without flattening the photograph */}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative flex h-full w-full flex-col justify-center ps-[8%] pe-[6%] sm:ps-[13%] md:ps-[17%]">
          <p data-hero-motion=""
            className="anim-hero-label text-[9px] font-medium text-white/85 sm:text-[11px] md:text-[13px]"
          >
            {t('careersPage.hero.label')}
          </p>

          <h1 data-hero-motion=""
            className="anim-hero-title mt-4 whitespace-pre-line text-[34px] font-bold italic leading-[1.02] text-hnc-cream sm:mt-6 sm:text-[52px] md:mt-7 md:text-[74px]"
            style={{ fontFamily: 'var(--font-proza)' }}
          >
            {t('careersPage.hero.lead')}
          </h1>

          <p data-hero-motion=""
            className="anim-hero-sub mt-4 max-w-[30ch] text-[10px] leading-[1.5] text-white/85 sm:mt-5 sm:text-[12px] md:max-w-[36ch] md:text-[13px]"
          >
            {t('careersPage.hero.text')}
          </p>

          <a
            href="#apply"
            className="mt-6 inline-block w-fit text-[12px] italic text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline sm:mt-8 sm:text-[15px] md:mt-10 md:text-[18px]"
            style={{ fontFamily: 'var(--font-proza)' }}
          >
            {t('careersPage.hero.cta')}
          </a>
        </div>
      </section>

      {/* Cream band; the hero's photo notch overlaps its top. */}
      <div className="h-[48px] w-full bg-hnc-cream sm:h-[64px] md:h-[90px]" />

      {/* Contact form. Reference proportions kept, scaled up ~1.2x: form 520px
          wide, inputs 58px tall with a 20px gutter, message 112px. */}
      <div id="apply" className="w-full bg-hnc-cream px-5 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-[520px]">
          <h2 data-anim="lift" className="mx-auto mb-14 w-fit rounded-[16px] border border-dashed border-[#8A5A4A] px-12 py-[18px] text-center text-[28px] font-bold text-[#5B0504] sm:mb-16 sm:text-[36px]">
            {t('careersPage.form.heading')}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
              {([
                ['firstName', 'firstName', 'text', 20],
                ['lastName', 'lastName', 'text', 20],
                ['email', 'email', 'email', undefined],
                ['phone', 'phone', 'tel', 20],
              ] as const).map(([id, labelKey, type, maxLength]) => (
                <div key={id}>
                  <label htmlFor={id} className="mb-1.5 ms-3 block text-start text-[14px] text-[#5B0504] sm:text-[15px]">
                    {t(`careersPage.form.${labelKey}`)}
                  </label>
                  <input
                    id={id}
                    type={type}
                    maxLength={maxLength}
                    {...register(id)}
                    aria-invalid={errors[id] ? 'true' : 'false'}
                    className={`h-[54px] sm:h-[58px] w-full rounded-[10px] border bg-transparent px-4 text-[15px] text-[#3A2A1E] outline-none transition-colors focus:border-[#5B0504] ${errors[id] ? 'border-[#E8130D]' : 'border-[#6B6552]'
                      }`}
                  />
                  {errors[id] && (
                    <p className="mt-1 ms-3 text-[12px] text-[#E8130D]">{errors[id]?.message as string}</p>
                  )}
                </div>
              ))}

              <div className="sm:col-span-2">
                <label htmlFor="message" className="mb-1.5 ms-3 block text-start text-[14px] text-[#5B0504] sm:text-[15px]">
                  {t('careersPage.form.message')}
                </label>
                <textarea
                  id="message"
                  rows={3}
                  {...register('message')}
                  aria-invalid={errors.message ? 'true' : 'false'}
                  className={`h-[100px] sm:h-[112px] w-full resize-y rounded-[10px] border bg-transparent px-4 py-3 text-[15px] text-[#3A2A1E] outline-none transition-colors focus:border-[#5B0504] ${errors.message ? 'border-[#E8130D]' : 'border-[#6B6552]'
                    }`}
                />
                {errors.message && (
                  <p className="mt-1 ms-3 text-[12px] text-[#E8130D]">{errors.message.message as string}</p>
                )}
              </div>
            </div>

            {/* Resume: a real <input type="file"> kept visually hidden behind the
                label, so the native picker and keyboard focus both still work. */}
            <div className="mt-14 sm:mt-16">
              <p className="mb-3 ms-10 text-start text-[14px] text-[#5B0504] sm:text-[15px]">
                {t('careersPage.form.resume')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-[44px]">
                <label
                  htmlFor="resume"
                  className="inline-flex h-[38px] w-[142px] sm:h-[42px] sm:w-[176px] cursor-pointer items-center justify-center gap-2 bg-[#5B0504] text-[13px] font-medium text-white transition-colors hover:bg-[#420302] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#5B0504]"
                >
                  {t('careersPage.form.chooseFile')}
                  <UploadCloud className="h-4 w-4 text-[#E8130D]" />
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    {...register('resume')}
                    className="sr-only"
                  />
                </label>
                <span className="inline-flex h-[38px] w-[142px] sm:h-[42px] sm:w-[176px] items-center justify-center bg-[#E7DBB1] px-2 text-center text-[13px] text-[#5B0504]">
                  <span className="truncate">
                    {resumeFiles && resumeFiles.length > 0
                      ? resumeFiles[0].name
                      : t('careersPage.form.noFileChosen')}
                  </span>
                </span>
              </div>
              {errors.resume && (
                <p className="mt-2 text-center text-[12px] text-[#E8130D]">{errors.resume.message as string}</p>
              )}
            </div>

            <div className="mt-16 text-center sm:mt-20">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-[44px] w-[132px] rounded-[3px] bg-[#E8130D] text-[14px] font-bold text-white transition-colors hover:bg-[#c9100b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? t('careersPage.form.submitLoading') : t('careersPage.form.submit')}
              </button>

              {status === 'success' && (
                <p className="mt-3 text-[13px] text-[#1F7A1F]">{t('careersPage.form.success')}</p>
              )}
              {status === 'error' && (
                <p className="mt-3 text-[13px] text-[#E8130D]">{t('careersPage.form.error')}</p>
              )}
            </div>
          </form>
        </div>
      </div>

      <Footer variant="dark" />
    </div >
  );
}
