import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export async function GET() {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    await connectDB();
    // Exclude password field from the response
    const users = await User.find({ isDeleted: { $ne: true } }).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const body = await request.json();
    /* `role` is deliberately not read from the request: new accounts get the
       schema default, which has no admin rights. Super Admin is never granted
       through the API. */
    const { name, email, password, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, Email and Password are required' }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password, // Note: In a real app, hash this password!
      phoneNumber: phone,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
