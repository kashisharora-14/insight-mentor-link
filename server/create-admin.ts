import bcrypt from 'bcrypt';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('Email:', email);
      console.log('Password: admin123');
      
      await db.update(users)
        .set({
          passwordHash: hashedPassword,
          role: 'admin',
          isVerified: true,
          isEmailVerified: true,
          name: 'Admin User',
          updatedAt: new Date()
        })
        .where(eq(users.email, email));
      
      console.log('✅ Admin password reset to: admin123');
    } else {
      await db.insert(users).values({
        email: email,
        passwordHash: hashedPassword,
        role: 'admin',
        isVerified: true,
        isEmailVerified: true,
        name: 'Admin User'
      });
      console.log('✅ Admin user created successfully!');
      console.log('Email:', email);
      console.log('Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
