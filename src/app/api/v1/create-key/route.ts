import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

const keyGenRateLimit = new Map<string, { count: number; resetAt: number }>();

function cleanupExpired() {
  if (keyGenRateLimit.size < 100) return;
  const now = Date.now();
  for (const [ip, data] of keyGenRateLimit.entries()) {
    if (now > data.resetAt) keyGenRateLimit.delete(ip);
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to generate a key' });
}

export async function POST(req: NextRequest) {
  if (!req.headers.get('user-agent')) {
    return NextResponse.json({ error: 'User-Agent header required' }, { status: 400 });
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || (req as any).ip || '127.0.0.1';
  const now = Date.now();

  cleanupExpired();

  const limit = keyGenRateLimit.get(ip);
  if (limit && now < limit.resetAt) {
    if (limit.count >= 3) {
      console.log(`[Rate Limit] KeyGen - IP: ${ip}`);
      return NextResponse.json({ error: 'Key generation limit reached' }, { status: 429 });
    }

    keyGenRateLimit.set(ip, {
      count: limit.count + 1,
      resetAt: limit.resetAt
    });
  } else {
    keyGenRateLimit.set(ip, { count: 1, resetAt: now + 3600000 });
  }

  try {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const { error } = await supabaseAdmin
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
      console.error(`[Error] KeyGen - DB Insert Failed:`, error.message);
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