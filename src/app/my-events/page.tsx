import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { getManagedEvents, getCurrentUser, getRoleDisplayName } from '@/lib/auth';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: Date;
  owner: {
    name: string | null;
    email: string;
  };
  _count: {
    rsvps: number;
  };
  createdAt: Date;
};

export default async function MyEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/api/auth/signin');
  }

  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/api/auth/signin');
  }

  const events = await getManagedEvents() as Event[];

  const isAdminOrStaff = currentUser.role === 'ADMIN' || currentUser.role === 'STAFF';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdminOrStaff ? 'All Events' : 'My Events'}
              </h1>
              <p className="mt-2 text-gray-600">
                {isAdminOrStaff 
                  ? `Manage all events in the system (${getRoleDisplayName(currentUser.role)})` 
                  : 'Manage and track your created events'
                }
              </p>
            </div>
            <Button asChild>
              <Link href="/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        <span className="ml-2">
                          {new Date(event.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </CardDescription>
                      {event.location && (
                        <CardDescription className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </CardDescription>
                      )}
                      {isAdminOrStaff && event.owner && (
                        <CardDescription className="text-sm text-blue-600 font-medium">
                          Created by: {event.owner.name || event.owner.email}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      <Users className="h-3 w-3 mr-1" />
                      {event._count.rsvps}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2">
                    <Button asChild size="sm">
                      <Link href={`/my-events/${event.id}/attendees`}>
                        View Attendees
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/event/${event.id}`}>
                        Preview
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isAdminOrStaff ? 'No events found' : 'No events created yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isAdminOrStaff 
                ? 'No events have been created in the system yet.'
                : "You haven't created any events yet. Get started by creating your first event!"
              }
            </p>
            <Button asChild>
              <Link href="/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}