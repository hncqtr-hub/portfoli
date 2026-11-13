"use client";
import React, { Suspense } from 'react';
import Footer from "@/components/common/Footer";
import BranchWhatsAppButton from "@/components/common/BranchWhatsAppButton";
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const MenuViewer = dynamic(() => import('../../components/menu/MenuViewer'), { ssr: false });

const MAIN_MENU = '/hot-and-cool-menu.pdf';

function MenuContent() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get('pdf') || MAIN_MENU;

  return (
    <main className="h-screen overflow-y-auto scrollbar-hide bg-hnc-cream relative">

      {/* Scrollable Container */}
      <div className="w-full flex flex-col">

        {/* --- Section 1: Menu Viewer --- */}
        <section className="min-h-screen flex flex-col items-center py-6 px-4 md:px-8 relative z-20 pt-30">

          {/* PDF Viewer Container */}
          {/* The main menu opens on its second page: page 1 is a contact cover.
              Branch menus from Find Us keep all their pages. */}
          <MenuViewer pdfUrl={pdfUrl} skipPages={pdfUrl === MAIN_MENU ? 1 : 0} />
        </section>



      </div>

      <Footer />
      <BranchWhatsAppButton
        className="bottom-8 right-8"
        buttonClassName="group relative flex items-center justify-center rounded-full bg-[#25D366] p-4 text-white shadow-lg shadow-black/50 transition-all hover:scale-110 hover:bg-[#20bd5a]"
      />
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-hnc-cream text-[#5B0504]">Loading...</div>}>
      <MenuContent />
    </Suspense>
  );
}
