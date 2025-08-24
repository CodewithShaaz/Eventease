import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Cache stats for 5 minutes to reduce database load
interface StatsData {
  totalEvents: number;
  totalUsers: number;
  totalRSVPs: number;
  activeEvents: number;
  lastUpdated: string;
}

let statsCache: { data: StatsData; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

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

    // Check if we have valid cached data
    const now = Date.now();
    if (statsCache && (now - statsCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json(statsCache.data, { 
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes
        }
      });
    }

    // Get dashboard statistics with optimized queries
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
      lastUpdated: new Date().toISOString(),
    };

    // Cache the results
    statsCache = {
      data: stats,
      timestamp: now,
    };

    return NextResponse.json(stats, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes
      }
    });

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
