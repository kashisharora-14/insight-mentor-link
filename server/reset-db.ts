
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { schema });

async function resetDatabase() {
  console.log('🗑️  Dropping existing tables...');
  
  try {
    // Drop all tables in reverse order of dependencies
    await sql`DROP TABLE IF EXISTS order_items CASCADE`;
    await sql`DROP TABLE IF EXISTS orders CASCADE`;
    await sql`DROP TABLE IF EXISTS products CASCADE`;
    await sql`DROP TABLE IF EXISTS event_registrations CASCADE`;
    await sql`DROP TABLE IF EXISTS events CASCADE`;
    await sql`DROP TABLE IF EXISTS jobs CASCADE`;
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    await sql`DROP TABLE IF EXISTS mentorship_sessions CASCADE`;
    await sql`DROP TABLE IF EXISTS mentorship_requests CASCADE`;
    await sql`DROP TABLE IF EXISTS profiles CASCADE`;
    await sql`DROP TABLE IF EXISTS roadmap_items CASCADE`;
    await sql`DROP TABLE IF EXISTS yearly_milestones CASCADE`;
    await sql`DROP TABLE IF EXISTS career_roadmaps CASCADE`;
    await sql`DROP TABLE IF EXISTS student_profiles CASCADE`;
    await sql`DROP TABLE IF EXISTS approved_users CASCADE`;
    await sql`DROP TABLE IF EXISTS csv_uploads CASCADE`;
    await sql`DROP TABLE IF EXISTS verification_requests CASCADE`;
    await sql`DROP TABLE IF EXISTS verification_codes CASCADE`;
    await sql`DROP TABLE IF EXISTS donations CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    // Drop enums
    await sql`DROP TYPE IF EXISTS program CASCADE`;
    await sql`DROP TYPE IF EXISTS batch_type CASCADE`;
    
    console.log('✅ All tables dropped successfully');
    
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

resetDatabase();
