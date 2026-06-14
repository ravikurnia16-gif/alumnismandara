const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@alumni.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@alumni.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  });

  console.log({ superadmin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
