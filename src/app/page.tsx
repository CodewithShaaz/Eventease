import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Plus, Clock, Users } from 'lucide-react';
import { Suspense } from 'react';

// Enhanced Event type with owner information
type Event = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
  owner: {
    name: string | null;
  } | null;
};

async function getEvents(): Promise<Event[]> {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events. Please try again later.');
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Get started by creating your first event. Share it with others and start building your community!
      </p>
      <Link href="/create-event" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-8">
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Event
      </Link>
    </div>
  );
}

async function EventsList() {
  const events = await getEvents();

  if (events.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="group hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <Link href={`/event/${event.id}`}>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                    {event.title}
                  </CardTitle>
                </Link>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{new Date(event.date).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</span>
              </div>

              {event.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}

              {event.owner?.name && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>Organized by {event.owner.name}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          {event.description && (
            <CardContent>
              <p className="text-gray-700 line-clamp-3">{event.description}</p>
              <Link href={`/event/${event.id}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent hover:text-accent-foreground mt-3 p-0 h-auto text-blue-600 hover:text-blue-800">
                Read more →
              </Link>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to <span className="text-blue-600">EventEase</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing events, connect with your community, and create unforgettable experiences. 
              The easiest way to manage and participate in events.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Button asChild size="lg">
                <Link href="/create-event">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#events">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Events
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
              <p className="text-gray-600 mt-2">Discover what&apos;s happening in your community</p>
            </div>
          </div>
          
          <Suspense fallback={<LoadingSkeleton />}>
            <EventsList />
          </Suspense>
        </div>
      </section>
    </div>
  );
}