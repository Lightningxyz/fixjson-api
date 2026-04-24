# fixjson API

A lightweight API to repair malformed JSON and return clean, normalized output.

## Features

- Deterministic repair (no AI)
- Fixes common JSON issues (trailing commas, missing quotes, single quotes, unescaped characters)
- Structured diagnostics (errors + changes)
- Normalized JSON output
- API key authentication
- Rate limiting (free tier)

## Quick Start

```bash
curl -X POST https://api.yourdomain.com/api/v1/fixjson \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{"json": "{ name: '"'"'John'"'"', age: 30, }"}'
```

## API Reference

### Repair JSON
**Endpoint:** `POST /api/v1/fixjson`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: <your_api_key>`

**Request Body:**
```json
{
  "json": "<malformed_json_string>"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "repaired_json": {
    "name": "John",
    "age": 30
  },
  "normalized_json": "{\n  \"name\": \"John\",\n  \"age\": 30\n}",
  "errors": [
    "Original JSON parsing failed: Expected double-quoted property name in JSON at position 33"
  ],
  "changes": [
    "Removed trailing comma(s)"
  ],
  "plan": "free",
  "remaining_requests": 99
}
```

**Failure Response (Limits/Auth):**
```json
{
  "error": "Free tier limit exceeded. Upgrade coming soon.",
  "plan": "free"
}
```

## Error Codes

- `400 Bad Request`: Invalid JSON payload structure or size limit exceeded (max 10,000 chars)
- `401 Unauthorized`: Missing or invalid API key
- `429 Too Many Requests`: Rate limit exhausted
- `500 Internal Server Error`: Unexpected server issue

## Rate Limits

The API currently operates on a controlled **free tier** enforcing strict limits per API key. 
*Pro plan with higher limits and priority usage coming soon.*

## Health Check
**Endpoint:** `GET /api/health`

```json
{
  "status": "ok"
}
```

## Local Development

1. Clone the repository.
2. Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```
3. Install dependencies:
```bash
npm install
```
4. Start the development server:
```bash
npm run dev
```
