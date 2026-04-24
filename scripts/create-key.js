require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createApiKey() {
    // 1. Generate raw key
    const rawKey = crypto.randomBytes(32).toString('hex');

    // 2. Hash it
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // 3. Insert into DB
    const { error } = await supabase
        .from('api_keys')
        .insert([
            {
                key_hash: hash,
                plan: 'free',
                requests_used: 0,
                requests_limit: 100
            }
        ]);

    if (error) {
        console.error('❌ Failed to insert key:', error.message);
        process.exit(1);
    }

    console.log('\n✅ API Key Created Successfully\n');
    console.log('🔑 Your API Key (SAVE THIS):\n');
    console.log(rawKey);
    console.log('\n⚠️ This key will NOT be shown again.\n');
}

createApiKey();