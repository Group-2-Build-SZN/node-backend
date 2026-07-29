import { Pool } from 'pg';
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query("select pid, state, wait_event_type, wait_event, query, now() - query_start as duration from pg_stat_activity where state != 'idle' order by query_start").then(r => {
  console.log(r.rows);
  p.end();
}).catch(e => { console.error('ERROR:', e.message); p.end(); });
