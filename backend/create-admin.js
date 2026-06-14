const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  // Email format requires something with @, but if user wants just 'admin' we can use 'admin@alumni.com'
  // Let's check schema. User model has `email` String @unique. Usually email validation applies.
  // I'll create it as 'admin@alumni.com' if 'admin' isn't a valid email for their login form.
  // Wait, let's look at authController to see if it allows non-email.
  // The schema requires 'email', so I will use 'admin@alumni.com' for the email, and the name 'admin'.
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alumni.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'admin'
    },
    create: {
      name: 'admin',
      email: 'admin@alumni.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('Admin user created successfully:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
