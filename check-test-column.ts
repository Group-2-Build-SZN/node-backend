import { Pool } from 'pg';
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query("select column_name from information_schema.columns where table_name='properties' and column_name='property_ref_test'").then(r => {
  console.log(r.rows);
  p.end();
});
