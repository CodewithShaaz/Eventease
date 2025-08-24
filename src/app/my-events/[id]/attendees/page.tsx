import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ExportButton from '@/components/ExportButton';

type RSVP = {
  id: string;
  createdAt: string | Date;
  user: {
    name?: string | null;
    email: string;
  };
};

async function getEventWithAttendees(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      rsvps: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!event || event.ownerId !== userId) {
    notFound();
  }
  
  return event;
}

export default async function AttendeesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect('/api/auth/signin');
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    redirect('/api/auth/signin');
  }

  const resolvedParams = await params;
  const event = await getEventWithAttendees(resolvedParams.id, user.id);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <Link href="/my-events" className="text-sm text-muted-foreground hover:underline mb-4 block">&larr; Back to My Events</Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Attendees for &quot;{event.title}&quot;</CardTitle>
              <CardDescription>{event.rsvps.length} person/people have RSVP&apos;d</CardDescription>
            </div>
            <ExportButton eventId={event.id} attendees={event.rsvps} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">RSVP Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.rsvps.length > 0 ? (
                  event.rsvps.map((rsvp: RSVP) => (
                    <TableRow key={rsvp.id}>
                      <TableCell className="font-medium">{rsvp.user.name || 'N/A'}</TableCell>
                      <TableCell>{rsvp.user.email}</TableCell>
                      <TableCell className="text-right">{new Date(rsvp.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No one has RSVP&apos;d yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}