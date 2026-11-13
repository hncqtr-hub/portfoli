import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Enquiry from '@/models/Enquiry';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Admin only: these are visitors' names, emails and messages. */
export async function GET() {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    await connectDB();
    const enquiries = await Enquiry.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    return NextResponse.json(enquiries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

/* Public: the contact form posts here without a login, so the input is checked
   for shape and size before anything is stored. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (name.length > 100 || email.length > 254 || message.length > 5000) {
      return NextResponse.json({ error: 'Input is too long' }, { status: 400 });
    }

    await connectDB();
    const newEnquiry = await Enquiry.create({ name, email, message });

    return NextResponse.json(newEnquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return NextResponse.json({ error: 'Failed to create enquiry' }, { status: 500 });
  }
}
