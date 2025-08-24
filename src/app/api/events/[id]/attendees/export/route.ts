import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canExportAttendees } from '@/lib/auth';

interface RSVPWithUser {
  id: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  try {
    // Check if user can export attendees for this event
    const canExport = await canExportAttendees(eventId);
    if (!canExport) {
      return NextResponse.json(
        { message: 'Unauthorized. You can only export attendees for events you own or have admin/staff permissions.' },
        { status: 403 }
      );
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    // Get all RSVPs for this event with user details
    const rsvps = await prisma.rSVP.findMany({
      where: {
        eventId: eventId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Generate CSV content
    const csvHeaders = ['Name', 'Email', 'RSVP Date', 'RSVP Time'];
    const csvRows = rsvps.map((rsvp: RSVPWithUser) => {
      const rsvpDate = new Date(rsvp.createdAt);
      return [
        rsvp.user.name || 'No name provided',
        rsvp.user.email,
        rsvpDate.toLocaleDateString(),
        rsvpDate.toLocaleTimeString(),
      ];
    });

    // Combine headers and rows
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: string[]) => 
        row.map((field: string) => 
          // Escape commas and quotes in CSV fields
          `"${String(field).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const csvWithBOM = '\uFEFF' + csvContent;

    // Set response headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_')}_attendees.csv"`);
    headers.set('Cache-Control', 'no-cache');

    return new NextResponse(csvWithBOM, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error exporting attendees:', error);
    return NextResponse.json(
      { 
        message: 'Failed to export attendees',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
