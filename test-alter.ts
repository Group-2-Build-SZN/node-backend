import { Pool } from 'pg';
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query('ALTER TABLE "properties" ADD COLUMN "property_ref_test" text NOT NULL').then(r => {
  console.log('SUCCESS');
  p.end();
}).catch(e => { console.error('ERROR:', e.message); p.end(); });
