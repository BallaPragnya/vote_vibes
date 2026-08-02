import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultRoles = ['ADMIN', 'VOTER', 'CANDIDATE'];

  console.log('Seeding default roles into database...');

  for (const roleName of defaultRoles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    console.log(`Role '${role.name}' ready (ID: ${role.id})`);
  }

  console.log('Role seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during role seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
