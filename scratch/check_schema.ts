import { supabaseAdmin } from './src/lib/supabase/admin';

async function check() {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .limit(1);
  
  if (error) console.error('Error:', error);
  else console.log('Columns:', Object.keys(data[0] || {}));
}

check();
