"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Store,
    LogOut,
    Menu,
    X,
    Briefcase,
    Users,
    Home,
    Settings,
    Handshake
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role);
        }
    }, []);

    const menuItems = [
        {
            name: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Home Page",
            href: "/admin/home",
            icon: Home,
        },
        {
            name: "Franchise",
            href: "/admin/franchise",
            icon: Handshake,
        },
        {
            name: "Branches",
            href: "/admin/branches",
            icon: Store,
        },
        {
            name: "Our Team",
            href: "/admin/team",
            icon: Users,
        },
        {
            name: "Careers",
            href: "/admin/careers",
            icon: Briefcase,
        },
        // Only show Staff for superadmin
        // ...(['superadmin', 'superAdmin'].includes(userRole || '') ? [{
        //     name: "Staff",
        //     href: "/admin/staff",
        //     icon: Users,
        // }] : []),
    ];

    if (userRole === 'superadmin' || userRole === 'superAdmin') {
        menuItems.push({
            name: "Settings",
            href: "/admin/settings",
            icon: Settings,
        });
    }

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            router.push('/auth/signin');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#111] text-white rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-[#050505] border-r border-[#222] transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo / Brand */}
                    <div className="h-20 flex items-center px-8 border-b border-[#222]">
                        <h1 className="text-xl font-bold text-white tracking-wider">
                            ADMIN <span className="text-[#E31E24]">PANEL</span>
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive
                                            ? "bg-[#E31E24]/10 text-[#E31E24]"
                                            : "text-gray-400 hover:bg-[#111] hover:text-white"
                                        }
                  `}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <item.icon
                                        size={20}
                                        className={isActive ? "text-[#E31E24]" : "text-gray-500 group-hover:text-white transition-colors"}
                                    />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-[#222]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
                        >
                            <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                        <div className="mt-4 px-4">
                            <p className="text-xs text-gray-600">v1.0.0 • Hot & Cool</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
