import { Pool } from 'pg';
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query("select * from drizzle.__drizzle_migrations order by created_at").then(r => {
  console.log(r.rows);
  p.end();
}).catch(e => { console.error(e.message); p.end(); });
