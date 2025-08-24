import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Check if user has admin or staff permissions
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'STAFF')) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin or Staff access required.' },
        { status: 403 }
      );
    }

    // Get all events with owner info and RSVP counts
    const events = await prisma.event.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        message: 'Events retrieved successfully',
        events
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching admin events:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch events',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
