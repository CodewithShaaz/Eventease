// Script to list all users in the database
// Usage: npx tsx scripts/list-users.ts

import { prisma } from '../src/lib/prisma';

type UserWithCounts = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  _count: {
    events: number;
    rsvps: number;
  };
};

async function listUsers() {
  try {
    const users: UserWithCounts[] = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
            rsvps: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (users.length === 0) {
      console.log('No users found. Create an account first by registering on the website.');
      return;
    }

    users.forEach((user: UserWithCounts, index: number) => {
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Events: ${user._count.events} | RSVPs: ${user._count.rsvps}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('   ---');
    });

    console.log(`\nTotal users: ${users.length}`);
    console.log('\n💡 To promote a user to admin, run:');
    console.log('npx tsx scripts/promote-user.ts <email>');

  } catch (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
