import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

// Enhanced validation functions
interface EventRequestBody {
  title?: unknown;
  description?: unknown;
  location?: unknown;
  date?: unknown;
}

function validateEventData(body: EventRequestBody) {
  const errors: Record<string, string> = {};

  // Title validation
  if (!body.title || typeof body.title !== 'string') {
    errors.title = 'Title is required and must be a string';
  } else if (body.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  } else if (body.title.trim().length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  // Description validation
  if (body.description !== null && body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (body.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
  }

  // Location validation
  if (body.location !== null && body.location !== undefined) {
    if (typeof body.location !== 'string') {
      errors.location = 'Location must be a string';
    } else if (body.location.length > 200) {
      errors.location = 'Location must be less than 200 characters';
    }
  }

  // Date validation
  if (!body.date || typeof body.date !== 'string') {
    errors.date = 'Date is required and must be a valid date string';
  } else {
    const eventDate = new Date(body.date);
    const now = new Date();
    
    if (isNaN(eventDate.getTime())) {
      errors.date = 'Date must be a valid date';
    } else if (eventDate <= now) {
      errors.date = 'Event date must be in the future';
    } else {
      // Check if date is too far in the future (2 years)
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      
      if (eventDate > twoYearsFromNow) {
        errors.date = 'Event date cannot be more than 2 years in the future';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch events. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let session;
  
  try {
    // Get the current user session
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { message: 'Authentication error. Please try signing in again.' },
      { status: 401 }
    );
  }

  // Check if the user is authenticated
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { message: 'You must be signed in to create events.' },
      { status: 401 }
    );
  }

  let body;
  
  try {
    // Parse request body
    body = await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      { message: 'Invalid request data. Please check your input.' },
      { status: 400 }
    );
  }

  // Validate the event data
  const validation = validateEventData(body);
  
  if (!validation.isValid) {
    return NextResponse.json(
      { 
        message: 'Please fix the following errors:',
        errors: validation.errors
      },
      { status: 400 }
    );
  }

  try {
    // Find the user in the database from the session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User account not found. Please try signing in again.' },
        { status: 404 }
      );
    }

    // Check if user has permission to create events (not ATTENDEE role)
    if (user.role === 'ATTENDEE') {
      return NextResponse.json(
        { message: 'Access denied. Attendees can only monitor events and view the home page. Event creation is restricted to Event Owners, Staff, and Administrators.' },
        { status: 403 }
      );
    }

    // Sanitize and prepare data
    const eventData = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      location: body.location?.trim() || null,
      date: new Date(body.date),
    };

    // Create the event in the database
    const newEvent = await prisma.event.create({
      data: {
        ...eventData,
        owner: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Event created successfully!',
        event: newEvent
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: 'An event with this title already exists for this date.' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { message: 'User account issue. Please try signing out and signing in again.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        message: 'Failed to create event. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}