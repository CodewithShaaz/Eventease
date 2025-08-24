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

    // Get dashboard statistics
    const [totalEvents, totalUsers, totalRSVPs, activeEventsCount] = await Promise.all([
      // Total events
      prisma.event.count(),
      
      // Total users
      prisma.user.count(),
      
      // Total RSVPs
      prisma.rSVP.count(),
      
      // Active events (future events)
      prisma.event.count({
        where: {
          date: {
            gte: new Date(),
          },
        },
      }),
    ]);

    const stats = {
      totalEvents,
      totalUsers,
      totalRSVPs,
      activeEvents: activeEventsCount,
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch statistics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
