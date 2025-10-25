import { db } from './db';
import { successStories, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedSuccessStories() {
  try {
    // Get admin user ID
    const adminUser = await db.select().from(users).where(eq(users.email, 'admin@example.com')).limit(1);
    
    if (adminUser.length === 0) {
      console.error('❌ Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    const adminId = adminUser[0].id;

    const sampleStories = [
      {
        name: 'Rajesh Kumar',
        batch: '2020',
        program: 'MCA',
        achievement: 'Software Engineer at Google',
        description: 'After graduating from Punjab University, Rajesh joined Google as a Software Engineer. He works on cloud infrastructure and has contributed to several major projects including Google Cloud Platform improvements.',
        currentPosition: 'Senior Software Engineer',
        company: 'Google',
        imageUrl: null,
        createdBy: adminId
      },
      {
        name: 'Priya Sharma',
        batch: '2019',
        program: 'MSCIT',
        achievement: 'Data Scientist at Microsoft',
        description: 'Priya specialized in Machine Learning during her time at Punjab University. She now leads a team of data scientists at Microsoft working on AI-powered products.',
        currentPosition: 'Lead Data Scientist',
        company: 'Microsoft',
        imageUrl: null,
        createdBy: adminId
      },
      {
        name: 'Amit Patel',
        batch: '2021',
        program: 'MCA',
        achievement: 'Founder of TechStart Solutions',
        description: 'Amit started his own tech company right after graduation. TechStart Solutions now employs 50+ people and works with major clients across India.',
        currentPosition: 'CEO & Founder',
        company: 'TechStart Solutions',
        imageUrl: null,
        createdBy: adminId
      },
      {
        name: 'Sneha Verma',
        batch: '2018',
        program: 'MSCIT',
        achievement: 'Cloud Architect at Amazon Web Services',
        description: 'Sneha is now a Cloud Solutions Architect at AWS, helping enterprise clients design and implement scalable cloud infrastructure.',
        currentPosition: 'Senior Cloud Architect',
        company: 'Amazon Web Services',
        imageUrl: null,
        createdBy: adminId
      },
      {
        name: 'Vikram Singh',
        batch: '2022',
        program: 'MCA',
        achievement: 'Full Stack Developer at Flipkart',
        description: 'Vikram joined Flipkart immediately after graduation and has been instrumental in developing new features for their e-commerce platform.',
        currentPosition: 'Senior Full Stack Developer',
        company: 'Flipkart',
        imageUrl: null,
        createdBy: adminId
      }
    ];

    console.log('🌱 Seeding success stories...');
    
    for (const story of sampleStories) {
      await db.insert(successStories).values(story);
      console.log(`✅ Created success story for ${story.name}`);
    }

    console.log('✅ Successfully seeded', sampleStories.length, 'success stories!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding success stories:', error);
    process.exit(1);
  }
}

seedSuccessStories();
