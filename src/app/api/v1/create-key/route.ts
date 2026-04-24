import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  return NextResponse.json({ message: 'Use POST to generate a key' });
}

export async function POST(req: NextRequest) {
  if (!req.headers.get('user-agent')) {
    return NextResponse.json({ error: 'User-Agent header required' }, { status: 400 });
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || (req as any).ip || '127.0.0.1';

  try {
    // 1. Check if this IP has already reached the limit (2 keys ever)
    const { count, error: countError } = await supabaseAdmin
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('created_by_ip', ip);

    if (countError) {
      console.error(`[Error] KeyGen - Count Check Failed:`, countError.message);
    } else if (count !== null && count >= 2) {
      console.log(`[Rate Limit] KeyGen - IP: ${ip} (Hard Limit Reached)`);
      return NextResponse.json({ 
        error: 'Hard limit reached. Only 2 API keys allowed per person.' 
      }, { status: 429 });
    }

    // 2. Generate raw key
    const rawKey = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // 3. Store in Supabase with the creating IP
    const { error: insertError } = await supabaseAdmin
      .from('api_keys')
      .insert([
        {
          key_hash: hash,
          plan: 'free',
          requests_used: 0,
          requests_limit: 100,
          created_by_ip: ip
        }
      ]);

    if (insertError) {
      console.error(`[Error] KeyGen - DB Insert Failed:`, insertError.message);
      return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 });
    }

    return NextResponse.json({
      api_key: rawKey,
      plan: 'free',
      limit: 100
    });
  } catch (error) {
    console.error(`[Error] KeyGen - IP: ${ip}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}