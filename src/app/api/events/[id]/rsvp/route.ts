import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface RSVPRequestBody {
  name?: unknown;
  email?: unknown;
}

function validateRSVPData(body: RSVPRequestBody) {
  const errors: Record<string, string> = {};

  // Name validation
  if (!body.name || typeof body.name !== 'string') {
    errors.name = 'Full name is required';
  } else if (body.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (body.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.email || typeof body.email !== 'string') {
    errors.email = 'Email address is required';
  } else if (!emailRegex.test(body.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;
  
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

  // Validate RSVP data
  const validation = validateRSVPData(body);
  
  if (!validation.isValid) {
    return NextResponse.json(
      { 
        message: 'Please fix the following errors:',
        errors: validation.errors
      },
      { status: 400 }
    );
  }

  const { name, email } = body;

  try {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is in the future
    const now = new Date();
    if (event.date <= now) {
      return NextResponse.json(
        { message: 'Cannot RSVP to past events' },
        { status: 400 }
      );
    }

    // Get session (optional - public can RSVP)
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch {
      // Session is optional for RSVP
      console.log('No session found, proceeding with public RSVP');
    }

    let userId = null;

    if (session?.user?.email) {
      // User is authenticated - link RSVP to their account
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      if (user) {
        userId = user.id;
        
        // Check if user already RSVPed
        const existingRSVP = await prisma.rSVP.findUnique({
          where: {
            eventId_userId: {
              eventId: eventId,
              userId: user.id,
            },
          },
        });

        if (existingRSVP) {
          return NextResponse.json(
            { message: 'You have already RSVPed to this event' },
            { status: 409 }
          );
        }
      }
    } else {
      // Public RSVP - check if email already RSVPed by creating/finding a guest user
      let guestUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (!guestUser) {
        // Create a guest user for public RSVPs
        guestUser = await prisma.user.create({
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: '', // No password for guest users
            role: 'EVENT_OWNER', // Default role
          },
        });
      }

      userId = guestUser.id;

      // Check if this email already RSVPed
      const existingRSVP = await prisma.rSVP.findUnique({
        where: {
          eventId_userId: {
            eventId: eventId,
            userId: guestUser.id,
          },
        },
      });

      if (existingRSVP) {
        return NextResponse.json(
          { message: 'This email address has already been used to RSVP to this event' },
          { status: 409 }
        );
      }
    }

    // Create the RSVP
    const rsvp = await prisma.rSVP.create({
      data: {
        eventId: eventId,
        userId: userId!,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            date: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'RSVP submitted successfully! Thank you for registering.',
        rsvp: {
          id: rsvp.id,
          eventTitle: rsvp.event.title,
          attendeeName: rsvp.user.name,
          attendeeEmail: rsvp.user.email,
          createdAt: rsvp.createdAt,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating RSVP:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: 'You have already RSVPed to this event' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { 
        message: 'Failed to submit RSVP. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
