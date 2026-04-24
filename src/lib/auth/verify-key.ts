import { createHash } from 'crypto';
import { supabaseAdmin } from '../supabase/admin';

export async function verifyAndLogRequest(apiKey: string, endpoint: string) {
  // Hash the API key using SHA-256
  const keyHash = createHash('sha256').update(apiKey).digest('hex');

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
