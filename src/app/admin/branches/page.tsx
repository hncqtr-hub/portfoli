'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';
import { Plus, Edit2, Trash2, X, MapPin, Phone, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Branch {
    _id: string;
    name: { en: string; ar: string };
    address: { en: string; ar: string };
    phone: string;
    whatsapp: string;
    mapEmbedUrl: string;
    locationUrl: string;
    image: string;
    menuPdf: string;
}

function BranchesContent() {
    const searchParams = useSearchParams();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Branch | null>(null);

    // Form States
    const [name, setName] = useState({ en: '', ar: '' });
    const [address, setAddress] = useState({ en: '', ar: '' });
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [mapEmbedUrl, setMapEmbedUrl] = useState('');
    const [locationUrl, setLocationUrl] = useState('');
    const [menuPdfFile, setMenuPdfFile] = useState<File | null>(null);

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            openModal();
        }
    }, [searchParams]);

    const fetchBranches = async () => {
        try {
            const res = await axios.get('/api/branches');
            setBranches(res.data);
        } catch (error) {
            console.error('Failed to fetch branches:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            data.append('name', JSON.stringify(name));
            data.append('address', JSON.stringify(address));
            data.append('phone', phone);
            data.append('whatsapp', whatsapp);
            data.append('mapEmbedUrl', mapEmbedUrl);
            data.append('locationUrl', locationUrl);
            if (menuPdfFile) {
                if (menuPdfFile.size > 50 * 1024 * 1024) {
                    alert('Menu PDF file size must be less than 50MB');
                    setIsLoading(false);
                    return;
                }
                data.append('menuPdf', menuPdfFile);
            }

            if (editingItem) {
                await axios.put(`/api/branches/${editingItem._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/api/branches', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            resetForm();
            setIsModalOpen(false);
            fetchBranches();
        } catch (error) {
            console.error('Failed to save branch:', error);
            alert(
                (error as any)?.response?.data?.error ||
                'Failed to save branch. Please check the console for details, or try a smaller file.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this branch?')) return;

        try {
            await axios.delete(`/api/branches/${id}`);
            fetchBranches();
        } catch (error) {
            console.error('Failed to delete branch:', error);
        }
    };

    const openModal = (branch?: Branch) => {
        if (branch) {
            setEditingItem(branch);
            setName(branch.name);
            setAddress(branch.address);
            setPhone(branch.phone);
            setWhatsapp(branch.whatsapp || '');
            setMapEmbedUrl(branch.mapEmbedUrl || '');
            setLocationUrl(branch.locationUrl || '');
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setName({ en: '', ar: '' });
        setAddress({ en: '', ar: '' });
        setPhone('');
        setWhatsapp('');
        setMapEmbedUrl('');
        setLocationUrl('');
        setMenuPdfFile(null);
    };

    return (
        <div className="text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Branch Management</h1>
                    <p className="text-gray-400">Manage branches and their menus</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#E31E24] hover:bg-[#c4191e] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Add New Branch
                </button>
            </div>

            {isLoading && !isModalOpen ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map((branch) => (
                        <div key={branch._id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden group">
                            <div className="relative h-48 bg-[#0a0a0a]">
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => openModal(branch)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(branch._id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                <h3 className="font-bold text-lg">{branch.name?.en}</h3>
                                <p className="text-xs text-gray-500">{branch.address?.en}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Phone size={14} />
                                    <span>{branch.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <FileText size={14} className={branch.menuPdf ? "text-[#E31E24]" : "text-gray-600"} />
                                    {branch.menuPdf ? (
                                        <a href={branch.menuPdf} target="_blank" rel="noopener noreferrer" className="text-[#E31E24] hover:underline">
                                            View Menu PDF
                                        </a>
                                    ) : (
                                        <span className="text-gray-600 italic">No Menu Uploaded</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-[#111] border border-[#222] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-[#222]">
                                <h2 className="text-xl font-bold">{editingItem ? 'Edit Branch' : 'Add New Branch'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Name (English)</label>
                                            <input
                                                type="text"
                                                value={name.en}
                                                onChange={(e) => setName({ ...name, en: e.target.value })}
                                                className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#E31E24] focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Name (Arabic)</label>
                                            <input
                                                type="text"
                                                value={name.ar}
                                                onChange={(e) => setName({ ...name, ar: e.target.value })}
                                                className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#E31E24] focus:outline-none text-right"
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Address (English)</label>
                                            <input
                                                type="text"
                                                value={address.en}
                                                onChange={(e) => setAddress({ ...address, en: e.target.value })}
                                                className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#E31E24] focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Address (Arabic)</label>
                                            <input
                                                type="text"
                                                value={address.ar}
                                                onChange={(e) => setAddress({ ...address, ar: e.target.value })}
                                                className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#E31E24] focus:outline-none text-right"
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#E31E24] focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">WhatsApp</label>
                                        <input
                                            type="text"
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#E31E24] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Menu PDF</label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => e.target.files?.[0] && setMenuPdfFile(e.target.files[0])}
                                            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#E31E24] focus:outline-none"
                                        />
                                        {menuPdfFile && (
                                            <p className="text-xs text-blue-500 mt-1">Selected: {menuPdfFile.name}</p>
                                        )}
                                        {editingItem?.menuPdf && !menuPdfFile && (
                                            <p className="text-xs text-green-500 mt-1">Menu PDF currently set. Upload to replace.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Google Maps Embed URL</label>
                                    <textarea
                                        value={mapEmbedUrl}
                                        onChange={(e) => setMapEmbedUrl(e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#E31E24] focus:outline-none h-24 resize-none"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Paste the whole {"<iframe>"} snippet from Google Maps (Share → Embed a map) or Google My Maps (Share → Embed on my site), or just its src URL.</p>
                                </div>
                            </form>

                            <div className="p-6 border-t border-[#222] flex justify-end gap-3 mt-auto">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="bg-[#E31E24] hover:bg-[#c4191e] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    {isLoading ? 'Saving...' : 'Save Branch'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AdminBranchesPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        }>
            <BranchesContent />
        </Suspense>
    );
}
