'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { twMerge } from 'tailwind-merge';

// Initialize PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface MenuViewerProps {
  pdfUrl: string;
  /* Leading PDF pages left out of the display. The file itself is untouched,
     and the pages shown are numbered from 1. */
  skipPages?: number;
}

export default function MenuViewer({ pdfUrl, skipPages = 0 }: MenuViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle container resize to make PDF responsive
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth < 768
        ? window.innerWidth - 32
        : Math.min(window.innerWidth - 400, 600);
      setContainerWidth(width);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (numPages === 0) return;

    /* The top-most page in view, not whichever entry fired last: while pages
       load, and on phones, several are in view at once. */
    const visible = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = Number(entry.target.getAttribute('data-page-number'));
          if (entry.isIntersecting) visible.add(pageNum);
          else visible.delete(pageNum);
        });
        if (visible.size) setActivePage(Math.min(...visible));
      },
      {
        root: containerRef.current,
        threshold: 0.3, 
      }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [numPages]);

  /* Never skip every page: a PDF that short is shown whole. */
  const skip = numPages > skipPages ? skipPages : 0;
  const shownPages = numPages - skip;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    pageRefs.current = new Array(numPages).fill(null);
  }

  return (
    <div className="flex w-full max-w-[1000px] mx-auto h-[calc(100vh-140px)] gap-6 items-start relative pb-0 justify-center">

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="w-full md:flex-1 h-full overflow-y-auto scrollbar-hide rounded-2xl border border-black/5 relative p-2 md:p-8"
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col items-center gap-4 md:gap-10 pb-20"
          loading={
            <div className="flex flex-col items-center justify-center h-64 text-[#5B0504]/60 animate-pulse">
              <div className="w-12 h-12 border-4 border-[#e31e24] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading Menu...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-64 text-[#B61815]">
              <p>Failed to load PDF.</p>
              <a href={pdfUrl} download className="mt-4 underline text-sm">Download Instead</a>
            </div>
          }
        >
          {Array.from(new Array(shownPages), (el, index) => (
            <div
              key={`page_container_${index + 1 + skip}`}
              data-page-number={index + 1}
              ref={(el) => { pageRefs.current[index] = el; }}
              className="w-full flex justify-center"
            >
              <Page
                key={`page_${index + 1 + skip}`}
                pageNumber={index + 1 + skip}
                width={containerWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg mb-4 rounded-lg overflow-hidden bg-white"
              />
            </div>
          ))}
        </Document>
      </div>

      {/* Floating Page Indicator for Mobile & Desktop */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/10 z-50 text-sm font-medium shadow-xl whitespace-nowrap">
        Page <span className="text-[#e31e24] font-bold">{activePage}</span> of {shownPages}
      </div>
    </div>
  );
}
