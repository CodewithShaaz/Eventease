// Simple script to promote a user to admin role
// Usage: npx tsx scripts/promote-user.ts <email>

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteUser() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npx tsx scripts/promote-user.ts <email>');
    process.exit(1);
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    console.log('✅ User promoted successfully!');
    console.log('User details:', {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });

  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

promoteUser();
