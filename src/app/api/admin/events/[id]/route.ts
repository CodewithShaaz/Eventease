import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, canManageEvent } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  try {
    const currentUser = await getCurrentUser();

    // Check if user has admin or staff permissions, or owns the event
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const canManage = await canManageEvent(eventId);
    if (!canManage) {
      return NextResponse.json(
        { message: 'Unauthorized. You can only delete events you own or have admin/staff permissions.' },
        { status: 403 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete all RSVPs first (due to foreign key constraints)
    await prisma.rSVP.deleteMany({
      where: {
        eventId: eventId,
      },
    });

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json(
      {
        message: 'Event deleted successfully',
        deletedEvent: {
          id: event.id,
          title: event.title,
          rsvpsDeleted: event._count.rsvps,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { 
        message: 'Failed to delete event',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
