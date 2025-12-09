import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (email not verified yet)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: 'USER',
        // emailVerified is null by default
      },
    });

    // Generate verification token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

    // Create verification token
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    try {
      await sendVerificationEmail({
        email: user.email,
        verificationUrl,
        userName: user.name || null,
      });
    } catch (emailError) {
      // Log error but don't fail signup - user can request resend later
      console.error('Error sending verification email:', emailError);
    }

    // Return success (don't return password)
    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Check if it's a database connection error
    if (error.message?.includes("Can't reach database server") || error.message?.includes("Connection")) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check your database connection and try again. If using Supabase, make sure your database is not paused.' 
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

