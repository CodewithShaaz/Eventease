import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  User, 
  Users, 
  Clock, 
  ArrowLeft 
} from 'lucide-react';
import RsvpForm from '@/components/RsvpForm';
import ShareEventButtons from '@/components/ShareEventButtons';

// Fetch a single event by its ID with RSVP count
async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      owner: {
        select: { name: true, email: true },
      },
      _count: {
        select: {
          rsvps: true,
        },
      },
    },
  });

  if (!event) {
    notFound(); // Redirect to a 404 page if event doesn't exist
  }
  return event;
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const event = await getEvent(resolvedParams.id);
  const eventDate = new Date(event.date);
  const isEventPassed = eventDate < new Date();

  // Generate sharing metadata
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/event/${event.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-transparent border border-transparent rounded-md hover:text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Events
        </Link>

        {/* Event Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-xl text-gray-600">Join us for an amazing experience!</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Event Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Event Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium">
                          {eventDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {eventDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                      <p className="font-medium">{event.location}</p>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <User className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium">Organized by</p>
                        <p className="text-sm text-gray-500">{event.owner.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Users className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium">Attendees</p>
                        <p className="text-sm text-gray-500">
                          {event._count.rsvps} {event._count.rsvps === 1 ? 'person' : 'people'} attending
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start text-gray-700">
                      <Clock className="h-5 w-5 mr-3 mt-1 text-blue-600" />
                      <div>
                        <p className="font-medium mb-2">Description</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Status */}
                {isEventPassed && (
                  <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-orange-800 font-medium">This event has ended</span>
                    </div>
                    <p className="text-orange-700 text-sm mt-1">
                      This event took place on {eventDate.toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Share Event */}
                <ShareEventButtons 
                  eventTitle={event.title}
                  eventUrl={eventUrl}
                  eventDate={eventDate}
                />
              </div>

              {/* RSVP Section */}
              <div>
                <RsvpForm eventId={event.id} isEventPassed={isEventPassed} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Calendar className="h-4 w-4 mr-2" />
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}
