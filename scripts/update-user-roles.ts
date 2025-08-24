import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating user roles...');

  // Get all users and their event counts
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          events: true,
        },
      },
    },
  });

  console.log(`Found ${users.length} users to process.`);

  let updated = 0;
  for (const user of users) {
    // Skip admin users (they should keep their roles)
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      console.log(`⏭️ Skipping ${user.email} (${user.role})`);
      continue;
    }

    let newRole: import('@prisma/client').UserRole = 'ATTENDEE';
    
    // If user has created events, they should be EVENT_OWNER
    if (user._count.events > 0) {
      newRole = 'EVENT_OWNER';
    }

    // Update user role if it needs to change
    if (user.role !== newRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole },
      });
      console.log(`✅ Updated ${user.email}: ${user.role} → ${newRole}`);
      updated++;
    } else {
      console.log(`✅ ${user.email} already has correct role: ${user.role}`);
    }
  }

  console.log(`\n🎉 Migration completed! Updated ${updated} users.`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
