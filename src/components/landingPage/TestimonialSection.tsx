"use client";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface Testimonial {
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  text: string;
  textAr: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Fatima Hassan",
    nameAr: "فاطمة حسن",
    role: "Food Blogger",
    roleAr: "مدوّنة طعام",
    text: "As a food blogger, I've tried restaurants all over Qatar. Hot N Cool stands out for its consistency and quality. Whether it's breakfast or a late-night snack, they never disappoint. Highly recommend their combo meals!",
    textAr: "كمدوّنة طعام، جربت مطاعم في جميع أنحاء قطر. هوت إن كول يتميز بثباته وجودته. سواء كان إفطاراً أو وجبة خفيفة في وقت متأخر من الليل، لا يخيبون ظنك أبداً. أنصح بشدة بوجباتهم المجمعة!",
    rating: 5,
  },
  {
    name: "Ahmed Al-Thani",
    nameAr: "أحمد آل ثاني",
    role: "Regular Customer",
    roleAr: "عميل دائم",
    text: "Hot N Cool has been my go-to restaurant for years. The flavors are authentic, the service is always warm, and every visit feels like coming home. Their grills and fresh juices are simply unmatched!",
    textAr: "هوت إن كول هو مطعمي المفضل منذ سنوات. النكهات أصيلة، والخدمة دافئة دائماً، وكل زيارة تشعرك وكأنك في بيتك. مشاوياتهم وعصائرهم الطازجة لا مثيل لها!",
    rating: 5,
  },
  {
    name: "Mohammed Al-Kuwari",
    nameAr: "محمد الكواري",
    role: "Family Diner",
    roleAr: "زبون عائلي",
    text: "My family loves Hot N Cool! The kids enjoy the variety of options and we appreciate the affordable prices. The staff is always friendly and the food arrives fresh every single time. A true gem in Qatar's food scene.",
    textAr: "عائلتي تحب هوت إن كول! الأطفال يستمتعون بتنوع الخيارات ونحن نقدر الأسعار المعقولة. الموظفون ودودون دائماً والطعام يصل طازجاً في كل مرة. جوهرة حقيقية في مشهد الطعام القطري.",
    rating: 5,
  },
  {
    name: "Sara Al-Mansouri",
    nameAr: "سارة المنصوري",
    role: "Office Worker",
    roleAr: "موظفة مكتب",
    text: "Perfect for quick lunch breaks! The delivery is always on time via Talabat, and the portions are generous. Hot N Cool understands what working professionals need — fast, tasty, and affordable meals.",
    textAr: "مثالي لاستراحات الغداء السريعة! التوصيل دائماً في الوقت المحدد عبر طلبات، والحصص سخية. هوت إن كول يفهم ما يحتاجه المحترفون — وجبات سريعة، لذيذة، وبأسعار معقولة.",
    rating: 5,
  },
];

export default function TestimonialSection() {
  const { t, i18n } = useTranslation("common");
  const isAr = i18n.language === "ar";

  return (
    <section
      aria-labelledby="reviews-heading"
      className="relative w-full bg-white"
    >
      {/* Burgundy strip across the very top, per the reference */}
      <div aria-hidden="true" className="h-10 w-full bg-hnc-red md:h-[52px]" />

      <div className="mx-auto w-full max-w-[760px] px-6 pt-16 pb-20 md:pt-20 md:pb-24">
        {/* ---------- Two-line italic heading ---------- */}
        <h2 data-anim="clip"
          id="reviews-heading"
          className="font-proza italic leading-[1.1]"
        >
          <span className="block text-[26px] text-neutral-900 sm:text-[30px]">
            {t("reviews.brand", "Hot n Cool")}
          </span>
          <span className="block text-[38px] font-bold text-hnc-red sm:text-[46px]">
            {t("reviews.title", "Reviews")}
          </span>
        </h2>

        {/* ---------- 2 x 2 review grid ---------- */}
        <div className="mt-10 grid grid-cols-1 gap-x-[8.7%] gap-y-14 sm:grid-cols-2 md:mt-12 md:gap-y-16">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className={isAr ? "text-right" : "text-left"}
            >
              <header className="flex items-start gap-3">
                {/* outlined placeholder, as in the reference */}
                <span
                  aria-hidden="true"
                  className="mt-[2px] h-8 w-8 shrink-0 rounded-full border-[1.5px] border-neutral-800"
                />
                <div className="min-w-0">
                  <p className="font-proza text-[16px] font-bold leading-tight text-hnc-red">
                    {isAr ? item.nameAr : item.name}
                  </p>
                  <p className="mt-0.5 font-proza text-[13px] leading-tight text-hnc-red/75">
                    {isAr ? item.roleAr : item.role}
                  </p>

                  <div className={`mt-1.5 flex gap-0.5 ${isAr ? "justify-end" : ""}`}>
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <svg
                        key={`${item.name}-star-${i}`}
                        className="h-4 w-4 text-brand-gold"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </header>

              {/* divider spans the full column, unlike the indented header */}
              <hr className="mt-3 border-t-2 border-neutral-800" />

              <p className="mt-4 text-justify font-proza text-[14px] leading-[1.6] text-neutral-700">
                {isAr ? item.textAr : item.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
