# fixjson API
> A fast, deterministic API for repairing malformed JSON with predictable, production-safe output.

A lightweight API to repair malformed JSON and return clean, normalized output. Includes a public demo and instant API key generation.

## Base URL
https://fixjson-api.vercel.app

## Features

- **Deterministic repair** (no AI, no hallucinations)
- **Fixes common JSON issues** (trailing commas, missing quotes, single quotes, unescaped characters)
- **Structured diagnostics** (errors + changes)
- **Public Demo Endpoint** (no API key required for small inputs)
- **Instant Key Generation** via API or UI
- **OpenAPI 3.0 Support**

## Quick Start

### 1. Try the Interactive Demo
Visit **[https://fixjson-api.vercel.app](https://fixjson-api.vercel.app)** to use the browser-based repair tool instantly.

### 2. Generate an API Key
```bash
curl -X POST https://fixjson-api.vercel.app/api/v1/create-key
```
*Returns:* `{ "api_key": "...", "plan": "free", "limit": 100 }`

### 3. Repair JSON via API
```bash
curl -X POST https://fixjson-api.vercel.app/api/v1/fixjson \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{"json": "{ name: \"John\", age: 30, }"}'
```

## API Reference

### Public Demo (No Key)
**Endpoint:** `GET /api/v1/demo-fixjson?json=<encoded_string>`

- **Limit:** Max 1000 characters
- **Rate Limit:** 10 requests per minute per IP

### Repair JSON (Authenticated)
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

### Create API Key
**Endpoint:** `POST /api/v1/create-key`

- **Rate Limit:** 3 keys per hour per IP
- **Default Plan:** Free (100 requests)

---

## Error Codes

- `400 Bad Request`: Invalid payload or size limit exceeded
- `401 Unauthorized`: Missing or invalid API key
- `429 Too Many Requests`: Rate limit exhausted
- `500 Internal Server Error`: Server issue

## Local Development

1. Clone the repository.
2. Create a `.env.local` file with Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```
3. Install and run:
```bash
npm install
npm run dev
```

## OpenAPI Spec
A complete `openapi.yaml` is included in the root for easy integration with Postman or client generators.
