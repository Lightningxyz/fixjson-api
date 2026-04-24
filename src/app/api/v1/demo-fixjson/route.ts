import { NextRequest, NextResponse } from 'next/server';
import { repairJson } from '@/lib/repair/json-repair';

const demoRateLimit = new Map<string, { count: number; resetAt: number }>();

function cleanupExpired() {
  if (demoRateLimit.size < 100) return;
  const now = Date.now();
  for (const [ip, data] of demoRateLimit.entries()) {
    if (now > data.resetAt) demoRateLimit.delete(ip);
  }
}

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
  const now = Date.now();

  cleanupExpired();

  const limit = demoRateLimit.get(ip);
  if (limit && now < limit.resetAt) {
    if (limit.count >= 10) {
      console.log(`[Rate Limit] Demo - IP: ${ip}`);
      return NextResponse.json({ error: 'Too many demo requests' }, { status: 429 });
    }

    demoRateLimit.set(ip, {
      count: limit.count + 1,
      resetAt: limit.resetAt
    });
  } else {
    demoRateLimit.set(ip, { count: 1, resetAt: now + 60000 });
  }

  const { searchParams } = new URL(req.url);
  const rawInput = searchParams.get('json');

  if (typeof rawInput !== 'string' || !rawInput.trim()) {
    return NextResponse.json({ error: 'Missing or invalid json query parameter' }, { status: 400 });
  }

  const inputJson = rawInput.trim();

  if (inputJson.length > 1000) {
    return NextResponse.json({ error: 'Input exceeds 1000 characters' }, { status: 400 });
  }

  try {
    const result = repairJson(inputJson);
    const { success, repaired_json, normalized_json, errors, changes } = result;

    return NextResponse.json(
      {
        success,
        message: "Demo mode: limited usage, no API key required",
        repaired_json,
        normalized_json,
        errors,
        changes
      },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error(`[Error] Demo - IP: ${ip}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}