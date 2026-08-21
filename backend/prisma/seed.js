import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultRoles = ['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION', 'VOTER', 'CANDIDATE'];

  console.log('Seeding default roles into database...');

  const roleMap = {};
  for (const roleName of defaultRoles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleMap[roleName] = role;
    console.log(`Role '${role.name}' ready (ID: ${role.id})`);
  }

  // Seed Default System Administrator Account
  const adminEmail = 'admin@votevibes.com';
  const hashedPassword = await bcrypt.hash('adminPassword123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      roleId: roleMap['ADMIN'].id,
    },
  });

  console.log(`Default Seeded Admin User ready: ${adminUser.email} (Role: ADMIN)`);
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
