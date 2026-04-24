import { NextRequest, NextResponse } from 'next/server';
import { verifyAndLogRequest } from '@/lib/auth/verify-key';
import { repairJson } from '@/lib/repair/json-repair';
import { z } from 'zod';

const requestSchema = z.object({
  json: z.string().max(10000, "Payload exceeds the 10,000 character limit")
});

export async function POST(req: NextRequest) {
  try {
    // 1. Initial Header Check
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 });
    }

    // 2. Stateless Payload Validation
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request body format',
        details: parseResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    // 3. Stateful Authentication & Quota Deduction
    const authResult = await verifyAndLogRequest(apiKey, '/api/v1/fixjson');

    if (!authResult?.success) {
      const isRateLimit = authResult?.error === 'Rate limit exceeded';
      const status = isRateLimit ? 429 : 401;
      const errorMessage = isRateLimit 
        ? 'Free tier limit exceeded. Upgrade coming soon.' 
        : (authResult?.error || 'Unauthorized');
      
      const responsePayload: any = { error: errorMessage };
      if (isRateLimit) responsePayload.plan = authResult?.plan || 'free';
      
      return NextResponse.json(responsePayload, { status });
    }

    // 4. Process Repair
    const { json: inputString } = parseResult.data;
    const repairResult = repairJson(inputString);

    // 4. Return response
    return NextResponse.json({
      ...repairResult,
      plan: authResult.plan || 'free',
      remaining_requests: authResult.remaining
    });
  } catch (error: any) {
    console.error('API Error:', error?.message || 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
