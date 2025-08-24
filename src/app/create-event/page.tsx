'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Update the import path if the file is named 'alerts.tsx' or located elsewhere
// Example: If the file is 'alert.tsx' in 'components/ui', ensure it exists
import { Alert, AlertDescription } from '@/components/ui/alert';
// If your file is named 'alerts.tsx', use:
// import { Alert, AlertDescription } from '@/components/ui/alerts';
import { Calendar, MapPin, FileText, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  general?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
  });

  // Redirect to sign in if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Calendar className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              You need to be signed in to create events. Please sign in to continue.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/api/auth/signin">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has permission to create events (not ATTENDEE role)
  if (status === 'authenticated' && session?.user?.role === 'ATTENDEE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Attendees can only monitor events and view the home page. Event creation is restricted to Event Owners, Staff, and Administrators.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/my-events">My Events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Event title must be at least 3 characters long';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Event title must be less than 100 characters';
    }

    // Description validation
    if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Location validation
    if (formData.location.trim().length > 200) {
      newErrors.location = 'Location must be less than 200 characters';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Event date and time is required';
    } else {
      const eventDate = new Date(formData.date);
      const now = new Date();
      
      if (eventDate <= now) {
        newErrors.date = 'Event date must be in the future';
      }
      
      // Check if date is too far in the future (2 years)
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      
      if (eventDate > twoYearsFromNow) {
        newErrors.date = 'Event date cannot be more than 2 years in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          location: formData.location.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          location: '',
          date: '',
        });
        
        // Redirect after showing success message
        setTimeout(() => {
          router.push('/my-events');
        }, 2000);
      } else {
        setErrors({ 
          general: data.message || 'Failed to create event. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setErrors({ 
        general: 'An unexpected error occurred. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Share your event with the community and start gathering attendees</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Event Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Success Message */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Event created successfully! Redirecting to your events...
                </AlertDescription>
              </Alert>
            )}

            {/* General Error */}
            {errors.general && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Event Title *
                </Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Enter a compelling event title"
                  value={formData.title} 
                  onChange={handleChange}
                  className={`text-base ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.title}
                  </p>
                )}
                <p className="text-gray-500 text-sm">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Description
                </Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe your event, what to expect, and any important details..."
                  value={formData.description} 
                  onChange={handleChange}
                  className={`min-h-[120px] text-base ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
                <p className="text-gray-500 text-sm">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </Label>
                <Input 
                  id="location" 
                  name="location" 
                  placeholder="Where will this event take place?"
                  value={formData.location} 
                  onChange={handleChange}
                  className={`text-base ${errors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.location && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.location}
                  </p>
                )}
                <p className="text-gray-500 text-sm">
                  {formData.location.length}/200 characters
                </p>
              </div>

              {/* Date Field */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-base font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Date and Time *
                </Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="datetime-local" 
                  value={formData.date} 
                  onChange={handleChange}
                  className={`text-base ${errors.date ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.date && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-lg py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  asChild
                  className="px-8"
                  disabled={isLoading}
                >
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Need help? <Link href="#" className="text-blue-600 hover:underline">View our event creation guide</Link>
          </p>
        </div>
      </div>
    </div>
  );
}