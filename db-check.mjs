import { Client } from "pg";

const cs = process.argv[2];
const studentId = process.argv[3];
const mentorId = process.argv[4];

if (!cs || !studentId || !mentorId) {
  console.error("Usage: node db-check.mjs <CONNECTION_STRING> <STUDENT_ID> <MENTOR_ID>");
  process.exit(1);
}

const run = async () => {
  const c = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const qProfiles = "select user_id from profiles where user_id = $1 or user_id = $2";
  const qUsers = "select id,email,role from users where id = $1 or id = $2";
  const p = await c.query(qProfiles, [studentId, mentorId]);
  const u = await c.query(qUsers, [studentId, mentorId]);
  console.log("profiles:", p.rows);
  console.log("users:", u.rows);
  await c.end();
};

run().catch(e => { console.error(e); process.exit(1); });
