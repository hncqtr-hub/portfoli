import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { verifyJWT, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { currentPassword, newEmail } = body;

        // Validation
        if (!currentPassword || !newEmail) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Get token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify token
        const payload: any = await verifyJWT(token);
        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();

        // Find user
        let user;
        if (payload.userId && typeof payload.userId === 'string' && payload.userId.length === 24) {
             user = await User.findById(payload.userId);
        } else if (payload.email) {
             user = await User.findOne({ email: payload.email });
        }
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if new email is same as old
        if (user.email === newEmail) {
             return NextResponse.json(
                { error: 'New email cannot be the same as current email' },
                { status: 400 }
            );
        }

        // Check current password
        if (user.password !== currentPassword) {
            return NextResponse.json(
                { error: 'Incorrect current password' },
                { status: 400 }
            );
        }

        // Check if new email is already in use
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        // Update email
        user.email = newEmail;
        await user.save();

        // Generate new token with updated email
        const userRole = user.role || 'staff';
        // Ensure userId is a string to avoid serialization issues
        const newToken = await signJWT({ userId: user._id.toString(), email: user.email, role: userRole });

        // Update cookie
        cookieStore.set('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return NextResponse.json(
            { message: 'Email updated successfully', user: { email: user.email, name: user.name, role: userRole } },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Email change error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
