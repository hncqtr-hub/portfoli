import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CareerApplication from '@/models/CareerApplication';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const deletedApplication = await CareerApplication.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Application deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting career application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
