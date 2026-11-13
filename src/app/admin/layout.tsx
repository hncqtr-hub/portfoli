"use client";

import Sidebar from "@/components/admin/Sidebar";
import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import '@/lib/i18n';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { i18n } = useTranslation();

    useEffect(() => {
        if (i18n.language !== 'en') {
            i18n.changeLanguage('en');
        }
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
    }, [i18n]);

    /* data-admin keeps the public site's paragraph font (globals.css) out of the admin. */
    return (
        <div data-admin="" className="flex h-screen bg-[#050505] text-gray-100 overflow-hidden" dir="ltr">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-[#0a0a0a] relative">
                <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
