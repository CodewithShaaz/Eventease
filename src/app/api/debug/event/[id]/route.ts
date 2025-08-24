import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found', eventId },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exists: true,
      eventId: event.id,
      title: event.title,
      ownerId: event.ownerId,
      ownerName: event.owner.name,
      ownerEmail: event.owner.email,
      ownerRole: event.owner.role,
      currentUserId: currentUser.id,
      currentUserRole: currentUser.role,
      currentUserEmail: currentUser.email,
      rsvpCount: event._count.rsvps,
      canAccess: event.ownerId === currentUser.id || currentUser.role === 'ADMIN' || currentUser.role === 'STAFF',
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
