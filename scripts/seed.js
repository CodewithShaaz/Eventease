import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventease.com' },
    update: {},
    create: {
      email: 'admin@eventease.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash('aA12345', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'john@test.com' },
    update: {},
    create: {
      email: 'john@test.com',
      name: 'John Staff',
      password: staffPassword,
      role: 'STAFF',
    },
  });

  // Create test attendees (users who only RSVP, don't create events)
  const attendeePassword = await bcrypt.hash('password123', 12);
  const attendee1 = await prisma.user.upsert({
    where: { email: 'attendee1@test.com' },
    update: { role: 'ATTENDEE' }, // Update existing user to ATTENDEE
    create: {
      email: 'attendee1@test.com',
      name: 'Test Attendee 1',
      password: attendeePassword,
      role: 'ATTENDEE',
    },
  });

  const attendee2 = await prisma.user.upsert({
    where: { email: 'attendee2@test.com' },
    update: { role: 'ATTENDEE' }, // Update existing user to ATTENDEE
    create: {
      email: 'attendee2@test.com',
      name: 'Test Attendee 2',
      password: attendeePassword,
      role: 'ATTENDEE',
    },
  });

  // Create event owner (user who creates events)
  const ownerPassword = await bcrypt.hash('owner123', 12);
  const eventOwner = await prisma.user.upsert({
    where: { email: 'owner@test.com' },
    update: {},
    create: {
      email: 'owner@test.com',
      name: 'Event Owner',
      password: ownerPassword,
      role: 'EVENT_OWNER',
    },
  });

  // Create a test event
  const event = await prisma.event.create({
    data: {
      title: 'Sample Event',
      description: 'This is a sample event for testing',
      location: 'Test Location',
      date: new Date('2025-09-15T19:00:00Z'),
      ownerId: eventOwner.id,
    },
  });

  // Create RSVPs for attendees
  await prisma.rSVP.createMany({
    data: [
      {
        eventId: event.id,
        userId: attendee1.id,
      },
      {
        eventId: event.id,
        userId: attendee2.id,
      },
    ],
  });

  console.log('✅ Seed completed!');
  console.log('👤 Admin:', admin.email);
  console.log('� Staff:', staff.email);
  console.log('�👥 Attendees:', attendee1.email, attendee2.email);
  console.log('🎭 Event Owner:', eventOwner.email);
  console.log('🎉 Event:', event.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
