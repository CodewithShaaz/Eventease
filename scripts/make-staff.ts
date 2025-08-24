// Script to set a user as staff role
// Usage: npx tsx scripts/make-staff.ts <email>

import { prisma } from '../src/lib/prisma';

async function makeStaff() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npx tsx scripts/make-staff.ts <email>');
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

    // Update user role to STAFF
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'STAFF' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    console.log('✅ User promoted to staff successfully!');
    console.log('User details:', {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });

  } catch (error) {
    console.error('Error promoting user to staff:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeStaff();
