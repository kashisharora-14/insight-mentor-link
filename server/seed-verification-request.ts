
import { db } from './db';
import { users, verificationRequests } from '@shared/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seedTestVerificationRequest() {
  console.log('🌱 Seeding test verification request...');

  const testEmail = 'student@example.com';
  const testPassword = 'student123';

  try {
    // Check if student already exists
    let student = await db.select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    let studentId: string;

    if (student.length === 0) {
      // Create test student user
      console.log('Creating test student user...');
      const passwordHash = await bcrypt.hash(testPassword, 10);
      
      const newStudent = await db.insert(users).values({
        email: testEmail,
        passwordHash,
        role: 'student',
        studentId: 'CS2024001',
        isEmailVerified: true,
        isVerified: false,
        verificationMethod: 'pending',
      }).returning();

      studentId = newStudent[0].id;
      console.log('✅ Test student created with ID:', studentId);
    } else {
      studentId = student[0].id;
      console.log('✅ Using existing student with ID:', studentId);
    }

    // Check if verification request already exists
    const existingRequest = await db.select()
      .from(verificationRequests)
      .where(eq(verificationRequests.userId, studentId))
      .limit(1);

    if (existingRequest.length === 0) {
      // Create verification request
      await db.insert(verificationRequests).values({
        userId: studentId,
        requestData: {
          name: 'Test Student',
          studentId: 'CS2024001',
          department: 'Computer Science',
          graduationYear: 2024,
          reason: 'I am a current student and would like to access the alumni network.',
        },
        status: 'pending',
      });

      console.log('✅ Verification request created successfully!');
    } else {
      console.log('✅ Verification request already exists');
    }

    console.log('\n📋 Test credentials:');
    console.log('Student Email:', testEmail);
    console.log('Student Password:', testPassword);
    console.log('\nAdmin credentials:');
    console.log('Admin Email: admin@example.com');
    console.log('Admin Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding verification request:', error);
  }

  process.exit(0);
}

seedTestVerificationRequest();
