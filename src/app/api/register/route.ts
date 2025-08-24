import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

interface RegisterRequestBody {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

function validateRegistrationData(body: RegisterRequestBody) {
  const errors: Record<string, string> = {};

  // Name validation
  if (!body.name || typeof body.name !== 'string') {
    errors.name = 'Full name is required and must be a string';
  } else if (body.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (body.name.trim().length > 50) {
    errors.name = 'Name must be less than 50 characters';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.email || typeof body.email !== 'string') {
    errors.email = 'Email address is required and must be a string';
  } else if (!emailRegex.test(body.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!body.password || typeof body.password !== 'string') {
    errors.password = 'Password is required and must be a string';
  } else if (body.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  } else if (body.password.length > 100) {
    errors.password = 'Password must be less than 100 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(body.password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export async function POST(request: Request) {
  let body;
  
  try {
    body = await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      { message: 'Invalid request data. Please check your input.' },
      { status: 400 }
    );
  }

  // Validate the registration data
  const validation = validateRegistrationData(body);
  
  if (!validation.isValid) {
    return NextResponse.json(
      { 
        message: 'Please fix the following errors:',
        errors: validation.errors
      },
      { status: 400 }
    );
  }

  const { name, email, password } = body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email address already exists. Please use a different email or sign in.' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'ATTENDEE', // New users start as attendees (can only monitor events and view home page)
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Account created successfully! Welcome to EventEase.',
        user: newUser
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: 'An account with this email address already exists.' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Invalid email')) {
        return NextResponse.json(
          { message: 'Please provide a valid email address.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        message: 'Failed to create account. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}