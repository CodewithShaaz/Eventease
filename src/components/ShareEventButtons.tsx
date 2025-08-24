'use client';

import { ExternalLink, User } from 'lucide-react';

interface ShareEventButtonsProps {
  eventTitle: string;
  eventUrl: string;
  eventDate: Date;
}

export default function ShareEventButtons({ eventTitle, eventUrl, eventDate }: ShareEventButtonsProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    // You could add a toast notification here
  };

  const emailSubject = encodeURIComponent(`Check out this event: ${eventTitle}`);
  const emailBody = encodeURIComponent(
    `I thought you might be interested in this event:\n\n${eventTitle}\n${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}\n\n${eventUrl}`
  );

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-3">Share This Event</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Copy Link
        </button>
        <a
          href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <User className="h-4 w-4 mr-2" />
          Email
        </a>
      </div>
    </div>
  );
}
