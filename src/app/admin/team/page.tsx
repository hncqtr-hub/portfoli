'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from '@/lib/axios';
import { Plus, Edit2, Trash2, X, Loader2, GripVertical } from 'lucide-react';

interface TeamMember {
	_id: string;
	name: { en: string; ar: string };
	role: { en: string; ar: string };
	desc: { en: string; ar: string };
	image?: string;
	order: number;
}

const EMPTY = { en: '', ar: '' };

export default function TeamManagementPage() {
	const [members, setMembers] = useState<TeamMember[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');

	const [name, setName] = useState(EMPTY);
	const [role, setRole] = useState(EMPTY);
	const [desc, setDesc] = useState(EMPTY);
	const [order, setOrder] = useState(0);
	const [imageFile, setImageFile] = useState<File | null>(null);

	const fetchMembers = async () => {
		try {
			const res = await axios.get('/api/team');
			setMembers(Array.isArray(res.data) ? res.data : []);
		} catch {
			setError('Failed to load team members.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchMembers();
	}, []);

	const openCreate = () => {
		setEditingItem(null);
		setName(EMPTY);
		setRole(EMPTY);
		setDesc(EMPTY);
		setOrder(members.length ? Math.max(...members.map((m) => m.order ?? 0)) + 1 : 0);
		setImageFile(null);
		setError('');
		setIsModalOpen(true);
	};

	const openEdit = (m: TeamMember) => {
		setEditingItem(m);
		setName({ en: m.name?.en ?? '', ar: m.name?.ar ?? '' });
		setRole({ en: m.role?.en ?? '', ar: m.role?.ar ?? '' });
		setDesc({ en: m.desc?.en ?? '', ar: m.desc?.ar ?? '' });
		setOrder(m.order ?? 0);
		setImageFile(null); // leaving this empty keeps the current photo
		setError('');
		setIsModalOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.en.trim() || !role.en.trim()) {
			setError('English name and designation are required.');
			return;
		}
		setIsSaving(true);
		setError('');

		const data = new FormData();
		data.append('name', JSON.stringify(name));
		data.append('role', JSON.stringify(role));
		data.append('desc', JSON.stringify(desc));
		data.append('order', String(order));
		if (imageFile) data.append('image', imageFile);

		try {
			if (editingItem) {
				await axios.put(`/api/team/${editingItem._id}`, data, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			} else {
				await axios.post('/api/team', data, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			}
			setIsModalOpen(false);
			await fetchMembers();
		} catch (err: any) {
			setError(err?.response?.data?.error || 'Failed to save team member.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async (m: TeamMember) => {
		if (!confirm(`Delete "${m.name?.en}"? They will no longer appear on the About Us page.`))
			return;
		try {
			await axios.delete(`/api/team/${m._id}`);
			await fetchMembers();
		} catch {
			setError('Failed to delete team member.');
		}
	};

	return (
		<div className="p-6 text-white">
			<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="mb-1 text-3xl font-bold">Our Team Management</h1>
					<p className="text-sm text-gray-400">
						Members shown in the Our Team section of the About Us page, in display order.
					</p>
				</div>
				<button
					type="button"
					onClick={openCreate}
					className="flex items-center gap-2 rounded-lg bg-[#E31E24] px-4 py-2 font-medium text-white transition-colors hover:bg-[#c4191f]"
				>
					<Plus size={18} />
					Add Team Member
				</button>
			</div>

			{error && !isModalOpen && (
				<p className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-400">
					{error}
				</p>
			)}

			{isLoading ? (
				<div className="flex justify-center py-20">
					<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
				</div>
			) : members.length === 0 ? (
				<div className="rounded-xl border border-[#222] bg-[#111] py-16 text-center text-gray-400">
					No team members yet. Use “Add Team Member” to create the first one.
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-[#222] bg-[#111]">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-[#222] text-gray-400">
							<tr>
								<th className="px-4 py-3 font-medium">Order</th>
								<th className="px-4 py-3 font-medium">Photo</th>
								<th className="px-4 py-3 font-medium">Name</th>
								<th className="px-4 py-3 font-medium">Designation</th>
								<th className="px-4 py-3 text-right font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{members.map((m) => (
								<tr key={m._id} className="border-b border-[#1b1b1b] last:border-0">
									<td className="px-4 py-3 text-gray-400">
										<span className="inline-flex items-center gap-1.5">
											<GripVertical size={14} className="text-gray-600" />
											{m.order ?? 0}
										</span>
									</td>
									<td className="px-4 py-3">
										<div className="relative h-12 w-12 overflow-hidden rounded-md bg-[#222]">
											{m.image ? (
												<Image
													src={m.image}
													alt={m.name?.en || ''}
													fill
													sizes="48px"
													className="object-cover"
												/>
											) : (
												<span className="flex h-full w-full items-center justify-center text-lg font-bold text-white/25">
													{(m.name?.en || '?').charAt(0)}
												</span>
											)}
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="font-medium text-white">{m.name?.en}</div>
										{m.name?.ar && (
											<div className="text-xs text-gray-500" dir="rtl">
												{m.name.ar}
											</div>
										)}
									</td>
									<td className="px-4 py-3 text-gray-300">{m.role?.en}</td>
									<td className="px-4 py-3">
										<div className="flex justify-end gap-2">
											<button
												type="button"
												onClick={() => openEdit(m)}
												aria-label={`Edit ${m.name?.en}`}
												className="rounded-md border border-[#333] p-2 text-gray-300 transition-colors hover:bg-[#222] hover:text-white"
											>
												<Edit2 size={15} />
											</button>
											<button
												type="button"
												onClick={() => handleDelete(m)}
												aria-label={`Delete ${m.name?.en}`}
												className="rounded-md border border-[#333] p-2 text-gray-300 transition-colors hover:bg-red-950 hover:text-red-400"
											>
												<Trash2 size={15} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center">
					<div className="w-full max-w-2xl rounded-xl border border-[#222] bg-[#111] p-6">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-xl font-bold">
								{editingItem ? 'Edit Team Member' : 'Add Team Member'}
							</h2>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								aria-label="Close"
								className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-[#222] hover:text-white"
							>
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<Field
									label="Name (English)"
									required
									value={name.en}
									onChange={(v) => setName({ ...name, en: v })}
								/>
								<Field
									label="Name (Arabic)"
									rtl
									value={name.ar}
									onChange={(v) => setName({ ...name, ar: v })}
								/>
								<Field
									label="Designation (English)"
									required
									value={role.en}
									onChange={(v) => setRole({ ...role, en: v })}
								/>
								<Field
									label="Designation (Arabic)"
									rtl
									value={role.ar}
									onChange={(v) => setRole({ ...role, ar: v })}
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<Field
									label="Description (English)"
									textarea
									value={desc.en}
									onChange={(v) => setDesc({ ...desc, en: v })}
								/>
								<Field
									label="Description (Arabic)"
									textarea
									rtl
									value={desc.ar}
									onChange={(v) => setDesc({ ...desc, ar: v })}
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label
										htmlFor="team-order"
										className="mb-1.5 block text-sm font-medium text-gray-300"
									>
										Display order
									</label>
									<input
										id="team-order"
										type="number"
										value={order}
										onChange={(e) => setOrder(Number(e.target.value))}
										className="w-full rounded-lg border border-[#333] bg-[#0b0b0b] px-3 py-2 text-white outline-none focus:border-[#E31E24]"
									/>
									<p className="mt-1 text-xs text-gray-500">
										Lower numbers appear first on the About Us page.
									</p>
								</div>

								<div>
									<label
										htmlFor="team-image"
										className="mb-1.5 block text-sm font-medium text-gray-300"
									>
										Profile image
									</label>
									<input
										id="team-image"
										type="file"
										accept="image/*"
										onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
										className="w-full rounded-lg border border-[#333] bg-[#0b0b0b] px-3 py-2 text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-[#222] file:px-3 file:py-1 file:text-white"
									/>
									<p className="mt-1 text-xs text-gray-500">
										{editingItem
											? 'Leave empty to keep the current photo.'
											: 'Optional — the card falls back to the first letter of the name.'}
									</p>
								</div>
							</div>

							{error && <p className="text-sm text-red-400">{error}</p>}

							<div className="flex justify-end gap-3 pt-2">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="rounded-lg border border-[#333] px-4 py-2 text-gray-300 transition-colors hover:bg-[#222]"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSaving}
									className="flex items-center gap-2 rounded-lg bg-[#E31E24] px-5 py-2 font-medium text-white transition-colors hover:bg-[#c4191f] disabled:opacity-50"
								>
									{isSaving && <Loader2 size={16} className="animate-spin" />}
									{editingItem ? 'Save Changes' : 'Add Member'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

function Field({
	label,
	value,
	onChange,
	required,
	rtl,
	textarea,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	required?: boolean;
	rtl?: boolean;
	textarea?: boolean;
}) {
	const id = `team-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
	const cls =
		'w-full rounded-lg border border-[#333] bg-[#0b0b0b] px-3 py-2 text-white outline-none focus:border-[#E31E24]';
	return (
		<div>
			<label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-300">
				{label}
				{required && <span className="text-[#E31E24]"> *</span>}
			</label>
			{textarea ? (
				<textarea
					id={id}
					rows={3}
					dir={rtl ? 'rtl' : undefined}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={cls}
				/>
			) : (
				<input
					id={id}
					type="text"
					dir={rtl ? 'rtl' : undefined}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={cls}
				/>
			)}
		</div>
	);
}
