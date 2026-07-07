#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return process.env;

  const fileEnv = Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, '')];
      }),
  );

  return { ...fileEnv, ...process.env };
}

function cleanPhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function phoneFromEmail(email) {
  const match = String(email || '').match(/^(\d+)@greenplot\.app$/);
  return match ? match[1] : '';
}

function profileFromAuthUser(user) {
  const metadata = user.user_metadata || {};
  const role = metadata.role === 'owner' ? 'owner' : 'farmer';
  const phone = cleanPhone(user.phone || metadata.phone || phoneFromEmail(user.email));

  return {
    id: user.id,
    name: metadata.name || metadata.full_name || '',
    phone: phone || null,
    email: user.email || null,
    role,
  };
}

async function main() {
  const env = loadEnv();
  const url = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    console.error('Add the service role key to .env temporarily, run this script, then remove it.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let page = 1;
  const perPage = 100;
  let totalUpserted = 0;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data.users || [];
    if (!users.length) break;

    const profiles = users.map(profileFromAuthUser);
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profiles, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    totalUpserted += profiles.length;
    if (users.length < perPage) break;
    page += 1;
  }

  console.log(`Backfilled ${totalUpserted} profile row(s) from Supabase Auth.`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
