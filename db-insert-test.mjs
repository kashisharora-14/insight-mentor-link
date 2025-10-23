
import { Client } from "pg";

const cs = process.argv[2];
const studentId = process.argv[3];
const mentorId = process.argv[4];

if (!cs || !studentId || !mentorId) {
  console.error("Usage: node db-insert-test.mjs <CONNECTION_STRING> <STUDENT_ID> <MENTOR_ID>");
  process.exit(1);
}

const run = async () => {
  const c = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try {
    const insertQ = `insert into mentorship_requests (student_id, mentor_id, field_of_interest, status, created_at, updated_at)
                     values ($1, $2, 'Diagnostics', 'pending', now(), now()) returning id`;
    const { rows } = await c.query(insertQ, [studentId, mentorId]);
    console.log('Inserted mentorship_requests id:', rows[0]?.id);
    const delQ = 'delete from mentorship_requests where id = $1';
    await c.query(delQ, [rows[0].id]);
    console.log('Cleanup done.');
  } catch (e) {
    console.error('Insert test failed:', e.message, { code: e.code, detail: e.detail, constraint: e.constraint, table: e.table });
    process.exit(1);
  } finally {
    await c.end();
  }
};

run().catch(e => { console.error(e); process.exit(1); });
