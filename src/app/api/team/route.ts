import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TeamMember from '@/models/TeamMember';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';
import { uploadToGridFS } from '@/lib/gridfs';

/* Public: the About Us page reads this. Sorted by `order` so admins control the
   sequence, with createdAt as the tiebreak for members sharing an order. */
export async function GET() {
  try {
    await connectDB();
    const members = await TeamMember.find({ isDeleted: { $ne: true } }).sort({
      order: 1,
      createdAt: 1,
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const formData = await request.formData();
    const nameStr = formData.get('name') as string;
    const roleStr = formData.get('role') as string;
    const descStr = formData.get('desc') as string;
    const orderRaw = formData.get('order') as string;
    const imageFile = formData.get('image') as File | null;

    const name = nameStr ? JSON.parse(nameStr) : { en: '', ar: '' };
    const role = roleStr ? JSON.parse(roleStr) : { en: '', ar: '' };
    const desc = descStr ? JSON.parse(descStr) : { en: '', ar: '' };

    if (!name.en?.trim() || !role.en?.trim()) {
      return NextResponse.json(
        { error: 'English name and designation are required' },
        { status: 400 },
      );
    }

    await connectDB();

    let image = '';
    if (imageFile && imageFile.size > 0) {
      image = await uploadToGridFS(imageFile);
    }

    const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : 0;

    const member = await TeamMember.create({ name, role, desc, image, order });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 },
    );
  }
}
