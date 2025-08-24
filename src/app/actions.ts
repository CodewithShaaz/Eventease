'use server';

type Attendee = {
  user: {
    name: string | null;
    email: string;
  };
  createdAt: Date;
};

export async function exportAttendeesToCSV(eventId: string, attendees: Attendee[]): Promise<string> {
  if (attendees.length === 0) {
    return ''; // Return an empty string if no attendees
  }

  // Create CSV header
  const header = 'Name,Email,RSVP Date\n';
  
  // Create CSV rows from your logic
  const rows = attendees.map(attendee => {
    const name = attendee.user.name || 'N/A';
    const email = attendee.user.email;
    const rsvpDate = attendee.createdAt.toLocaleDateString('en-IN');
    
    // Your robust comma-escaping for names
    const escapedName = name.includes(',') ? `"${name}"` : name;
    
    return `${escapedName},${email},${rsvpDate}`;
  }).join('\n');
  
  return header + rows;
}