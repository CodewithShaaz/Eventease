'use client';

// Use the standard '@' path alias
import { exportAttendeesToCSV } from '@/app/actions';

type Attendee = {
  user: {
    name: string | null;
    email: string;
  };
  createdAt: Date;
};

type ExportButtonProps = {
  eventId: string;
  attendees: Attendee[];
};

export default function ExportButton({ eventId, attendees }: ExportButtonProps) {
  const handleExport = async () => {
    const csvContent = await exportAttendeesToCSV(eventId, attendees);

    if (!csvContent) {
      alert('There are no attendees to export.');
      return;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${eventId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
    >
      Export to CSV
    </button>
  );
}