'use client';
import HeroSection from '../components/landingPage/HeroSection';
import AboutSection from '../components/landingPage/AboutSection';
import DishShowcaseSection from '../components/landingPage/DishShowcaseSection';
import ComboSection from '../components/landingPage/ComboSection';
import FindUsSection from '../components/landingPage/FindUsSection';
import WelcomeSection from '../components/landingPage/WelcomeSection';
import BranchesSection from '../components/landingPage/BranchesSection';
import ChairmanSection from '../components/landingPage/ChairmanSection';
import TestimonialSection from '../components/landingPage/TestimonialSection';
import OfferSection from '../components/landingPage/OfferSection';
import OpeningSoonSection from '../components/landingPage/OpeningSoonSection';
import LogoSection from '../components/landingPage/LogoSection';
import Footer from '../components/common/Footer';
import BranchWhatsAppButton from '../components/common/BranchWhatsAppButton';



interface HomePageProps {
  initialHeroSettings?: {
    bannerImageUrl: string;
    mobileBannerImageUrl?: string;
  } | null;
}

export default function HomePage({ initialHeroSettings }: HomePageProps) {
  return (
    <>
      <main className="">
        <HeroSection initialSettings={initialHeroSettings} />
        <AboutSection />
        <DishShowcaseSection />
        <ComboSection />
        {/* <ChairmanSection /> */}
        {/* <BranchesSection /> */}
        {/* <WelcomeSection /> */}
        <TestimonialSection />
        <FindUsSection />
        {/* <OpeningSoonSection /> */}
        {/* <LogoSection /> */}
      </main>
      <Footer />
      <BranchWhatsAppButton />
    </>
  )
}