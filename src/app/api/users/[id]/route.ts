import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { denyUnlessSuperAdmin, getAdminSession } from '@/lib/adminGuard';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const { id } = await params;
    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    /* Login skips soft-deleted accounts, so deleting your own would lock you out. */
    if (user.email === (await getAdminSession())?.email) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    // Soft delete
    user.isDeleted = true;
    await user.save();

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
