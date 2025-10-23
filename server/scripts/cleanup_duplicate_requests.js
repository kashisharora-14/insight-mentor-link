// Decline duplicate mentorship requests per student->mentor pair, keeping the best one
// Best = any accepted first (most recent), else most recent pending, else most recent overall
// Usage: node server/scripts/cleanup_duplicate_requests.js [--dry]

import 'dotenv/config';
import pg from 'pg';

const DRY_RUN = process.argv.includes('--dry');
const { Client } = pg;

const run = async () => {
  const cs = process.env.DATABASE_URL;
  if (!cs) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    // Preview counts
    const preview = await client.query(`
      with ranked as (
        select id, student_id, mentor_id, status, created_at,
               row_number() over (
                 partition by student_id, mentor_id
                 order by case when status='accepted' then 2 when status='pending' then 1 else 0 end desc,
                          created_at desc
               ) as rn
        from mentorship_requests
      )
      select count(*)::int as duplicates
      from ranked
      where rn > 1 and status in ('pending','accepted');
    `);
    const dupes = Number(preview?.rows?.[0]?.duplicates || 0);
    console.log(`Found ${dupes} duplicate active rows to decline.`);

    if (DRY_RUN || dupes === 0) {
      console.log('Dry run or nothing to do. Exiting.');
      return;
    }

    const res = await client.query(`
      with ranked as (
        select id, student_id, mentor_id, status, created_at,
               row_number() over (
                 partition by student_id, mentor_id
                 order by case when status='accepted' then 2 when status='pending' then 1 else 0 end desc,
                          created_at desc
               ) as rn
        from mentorship_requests
      )
      update mentorship_requests mr
      set status = 'declined', updated_at = now()
      from ranked r
      where mr.id = r.id
        and r.rn > 1
        and mr.status in ('pending','accepted')
      returning mr.id, mr.student_id, mr.mentor_id, mr.status;
    `);
    console.log(`Declined ${res.rowCount} duplicate rows.`);
  } catch (e) {
    console.error('Cleanup failed:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
