'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  ExternalLink,
  Clock
} from 'lucide-react';
import Link from 'next/link';

type RsvpFormProps = {
  eventId: string;
  isEventPassed?: boolean;
};

interface RSVPData {
  name: string;
  email: string;
}

export default function RsvpForm({ eventId, isEventPassed = false }: RsvpFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [checkingRSVP, setCheckingRSVP] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<RSVPData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  // Check if user already RSVPed
  useEffect(() => {
    const checkRSVPStatus = async () => {
      if (!session) {
        setCheckingRSVP(false);
        return;
      }

      try {
        const response = await fetch(`/api/events/${eventId}/rsvp/check`);
        if (response.ok) {
          const { hasRSVPed: userHasRSVPed } = await response.json();
          setHasRSVPed(userHasRSVPed);
        }
      } catch (err) {
        console.error('Error checking RSVP status:', err);
      } finally {
        setCheckingRSVP(false);
      }
    };

    checkRSVPStatus();
  }, [eventId, session]);

  // Update form data when session changes
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setHasRSVPed(true);
      } else {
        setError(data.message || 'Failed to submit RSVP. Please try again.');
      }
    } catch (err) {
      console.error('RSVP submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingRSVP) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-xl text-center">
          {hasRSVPed ? 'You\'re Attending!' : isEventPassed ? 'Event Ended' : 'RSVP to This Event'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              RSVP successful! We look forward to seeing you at the event.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {hasRSVPed ? (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <p className="text-green-700 font-medium mb-4 text-lg">
              You have successfully registered for this event!
            </p>
            <p className="text-gray-600 mb-6">
              You&apos;ll receive event updates and reminders via email.
            </p>
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 px-4 py-2 w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Browse More Events
              </Link>
              {session && (
                <Link href="/create-event" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 px-4 py-2 w-full">
                  Create Your Own Event
                </Link>
              )}
            </div>
          </div>
        ) : isEventPassed ? (
          <div className="text-center">
            <Clock className="mx-auto h-16 w-16 text-orange-400 mb-4" />
            <p className="text-orange-700 font-medium mb-4 text-lg">
              This event has already occurred.
            </p>
            <p className="text-gray-600 mb-6">
              Unfortunately, RSVP is no longer available for past events.
            </p>
            <Link href="/" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 px-4 py-2 w-full">
              Browse Other Events
            </Link>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={error && !formData.name.trim() ? 'border-red-500' : ''}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={error && !formData.email.trim() ? 'border-red-500' : ''}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-primary-foreground shadow-xs h-10 px-4 py-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting RSVP...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    RSVP Now
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-600 text-center">
                By RSVPing, you confirm your attendance at this event.
              </p>
              
              {!session && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-blue-700 text-sm">
                    Have an account?{' '}
                    <Link href="/api/auth/signin" className="font-medium underline">
                      Sign in
                    </Link>{' '}
                    for faster RSVP
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}