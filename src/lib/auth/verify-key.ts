import { createHash } from 'crypto';
import { supabaseAdmin } from '../supabase/admin';

export async function verifyAndLogRequest(apiKey: string, endpoint: string) {
  const trimmedKey = apiKey.trim();
  const keyHash = createHash('sha256').update(trimmedKey).digest('hex');

  console.log('--- DEBUG ---');
  console.log('Incoming Raw Key Length:', apiKey.length);
  console.log('Trimmed Key Length:', trimmedKey.length);
  console.log('Generated Hash:', keyHash);
  console.log('-------------');

  // Call the Supabase RPC function
  const { data, error } = await supabaseAdmin.rpc('verify_and_log_request', {
    p_key_hash: keyHash,
    p_endpoint: endpoint
  });

  if (error) {
    console.error('Supabase RPC Error:', error);
    return { success: false, error: 'Internal Server Error' };
  }

  return data;
}
