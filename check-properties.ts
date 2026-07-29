import { Pool } from 'pg';
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query("select count(*) from properties").then(r => {
  console.log(r.rows);
  p.end();
}).catch(e => { console.error('ERROR:', e.message); p.end(); });
