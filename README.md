# fixjson API

A lightweight, deterministic API to repair malformed JSON, detect syntax issues, and return clean, normalized output.

## Features
- **Deterministic Repair:** Safely fixes trailing commas, missing quotes, single quotes, and unescaped characters without using unpredictable LLMs.
- **Strict Validation:** Rejects payloads over 10,000 characters to prevent memory exhaustion.
- **Secure Authentication:** API key validation via Supabase using SHA-256 hashing.
- **Rate Limiting:** Atomic usage tracking to enforce free-tier limits.

## API Reference

### 1. Repair JSON
**POST** `/api/v1/fixjson`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: your_api_key_here`

**Request Body:**
```json
{
  "json": "{ name: 'John', age: 30, }"
}
```

**Response (Success):**
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
    "Removed trailing comma(s)",
    "Replaced single quotes with double quotes",
    "Added missing quotes to keys or string values"
  ],
  "plan": "free",
  "remaining_requests": 99
}
```

### 2. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "ok"
}
```

## Local Development

1. Clone the repository.
2. Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your-project-url"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
3. Run `npm install`
4. Run `npm run dev`
