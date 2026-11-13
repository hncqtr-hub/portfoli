import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Basic validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user exists
        // Soft-deleted accounts cannot sign in; deleting a user must revoke access.
        const user = await User.findOne({ email, isDeleted: { $ne: true } });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Validate password (plain text comparison as per current setup - should use bcrypt in production)
        if (user.password !== password) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const userRole = user.role || 'staff';
        const token = await signJWT({ userId: user._id, email: user.email, role: userRole });

        // Set HttpOnly cookie
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return NextResponse.json(
            { message: 'Login successful', user: { email: user.email, name: user.name, role: userRole } },
            { status: 200 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
