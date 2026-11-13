import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Enquiry from '@/models/Enquiry';
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
      return NextResponse.json({ error: 'Enquiry ID is required' }, { status: 400 });
    }

    const deletedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedEnquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Enquiry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
  }
}
