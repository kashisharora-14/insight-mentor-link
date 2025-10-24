
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function applyMigration() {
  try {
    console.log('🔧 Applying jobs migration...');
    
    const migrationPath = join(__dirname, '../migrations/2025-01-22_add_jobs_tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Jobs migration applied successfully!');
    
    // Verify the changes
    const jobsColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'posted_by_role'
    `;
    
    const referralTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'job_referral_requests'
      ) as exists
    `;
    
    console.log('✅ Verification:');
    console.log('  - posted_by_role column:', jobsColumns.length > 0 ? 'EXISTS' : 'MISSING');
    console.log('  - job_referral_requests table:', referralTable[0].exists ? 'EXISTS' : 'MISSING');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyMigration();
