require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.development', override: false });

const { Client } = require('pg');

const client = new Client(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      }
);

async function main() {
  await client.connect();
  console.log('Connected to:', process.env.DATABASE_URL ? 'REMOTE (Neon)' : 'LOCAL');

  try {
    // 1. Reproduce the EXACT query from auth.provider.ts login()
    console.log('\n--- Exact login query ---');
    const loginResult = await client.query(
      `SELECT "user"."id" AS "user_id",
              "user"."email" AS "user_email",
              "user"."username" AS "user_username",
              "user"."phoneNumber" AS "user_phoneNumber",
              "user"."password" AS "user_password",
              "user"."userType" AS "user_userType",
              "user"."isActive" AS "user_isActive",
              "user"."tokenVersion" AS "user_tokenVersion",
              "user"."profileImage" AS "user_profileImage",
              "user"."created_at" AS "user_created_at",
              "user"."updated_at" AS "user_updated_at"
       FROM "users" "user"
       WHERE "user"."email" = $1`,
      ['joeatef769@gmail.com']
    );
    console.log('Row count:', loginResult.rows.length);
    if (loginResult.rows.length > 0) {
      const row = loginResult.rows[0];
      console.log('user_id:', row.user_id);
      console.log('user_email:', row.user_email);
      console.log('user_userType:', row.user_userType);
      console.log('user_isActive:', row.user_isActive);
      console.log('user_tokenVersion:', row.user_tokenVersion);
      console.log('password hash present:', !!row.user_password);
    }

    // 2. Check all columns in users table
    console.log('\n--- All users table columns ---');
    const cols = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(` - ${r.column_name}: ${r.data_type} (${r.udt_name})`));

    // 3. Check Postgres enum values
    console.log('\n--- Postgres userType enum values ---');
    const enumVals = await client.query(`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname LIKE '%role%' OR t.typname LIKE '%user%'
    `);
    enumVals.rows.forEach(r => console.log(' -', r.enumlabel));

  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
  }

  await client.end();
}

main().catch(e => { console.error('FATAL:', e.message); client.end(); });
