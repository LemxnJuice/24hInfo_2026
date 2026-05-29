import bcrypt from 'bcrypt';
import prisma from '../src/prisma';

async function main() {
  const adminEmail = 'admin@example.com';
  const userEmail = 'user@example.com';

  const adminPass = await bcrypt.hash('Admin123!', 10);
  const userPass = await bcrypt.hash('User123!', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, password: adminPass, name: 'Admin', role: 'ADMIN' }
  });

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: { email: userEmail, password: userPass, name: 'User', role: 'USER' }
  });

  console.log('Seed complete');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
