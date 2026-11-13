import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TeamMember from '@/models/TeamMember';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';
import { uploadToGridFS } from '@/lib/gridfs';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const { id } = await props.params;
    const formData = await request.formData();

    const nameStr = formData.get('name') as string;
    const roleStr = formData.get('role') as string;
    const descStr = formData.get('desc') as string;
    const orderRaw = formData.get('order') as string;
    const imageFile = formData.get('image') as File | null;

    const name = nameStr ? JSON.parse(nameStr) : null;
    const role = roleStr ? JSON.parse(roleStr) : null;
    const desc = descStr ? JSON.parse(descStr) : null;

    if (name && !name.en?.trim()) {
      return NextResponse.json({ error: 'English name is required' }, { status: 400 });
    }
    if (role && !role.en?.trim()) {
      return NextResponse.json(
        { error: 'English designation is required' },
        { status: 400 },
      );
    }

    await connectDB();

    const update: Record<string, unknown> = {};
    if (name) update.name = name;
    if (role) update.role = role;
    if (desc) update.desc = desc;
    if (orderRaw !== null && orderRaw !== '' && Number.isFinite(Number(orderRaw))) {
      update.order = Number(orderRaw);
    }
    /* Only overwrite the photo when a new file actually arrives, so saving the
       form without picking one keeps the existing image. */
    if (imageFile && imageFile.size > 0) {
      update.image = await uploadToGridFS(imageFile);
    }

    const member = await TeamMember.findByIdAndUpdate(id, update, { new: true });
    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 },
    );
  }
}

/* Soft delete, matching branches: the row stays so its uploaded image is never
   orphaned, and the public GET filters it out. */
export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const { id } = await props.params;
    await connectDB();
    const member = await TeamMember.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 },
    );
  }
}
