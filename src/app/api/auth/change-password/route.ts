import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validation
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
             return NextResponse.json(
                { error: 'New password must be at least 6 characters long' },
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
        const payload = await verifyJWT(token);
        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();

        // Find user
        // Find user by email from payload since ID might cause casting issues if not handled correctly
        // Although payload.userId should be valid, let's double check or use email as fallback/primary
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

        // Check current password (plain text comparison per current implementation)
        if (user.password !== currentPassword) {
            return NextResponse.json(
                { error: 'Incorrect current password' },
                { status: 400 }
            );
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return NextResponse.json(
            { message: 'Password updated successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
