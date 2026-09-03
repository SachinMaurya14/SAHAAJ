# SAAHAJ Security & Threat Defense Model (V10 Production)

## 1. Security Architecture & Threat Defenses

### 1.1 Object-Level Authorization & IDOR Shield
Every route in the SAAHAJ API enforces strict object-level authorization (`requireDocumentOwnership`). Users can only query, modify, or delete documents and facts where `user_id == authenticated_user.userId`. Clinicians can only view records for explicitly linked patients.

### 1.2 Rate Limiting & Abuse Prevention
- **Global API Rate Limiter**: 300 requests/minute per IP/User sliding window.
- **AI & Grounding Operations Limiter**: 60 requests/minute per IP/User sliding window.
- **HTTP 429 Payload**: Returns standard `Retry-After` header and structured error response.

### 1.3 Strict Security Headers
- `Content-Security-Policy`: Disallows untrusted scripts, restricts frames to AI Studio and origin.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (Production HTTPS)

### 1.4 Private Object Storage Security
- Medical documents and DICOM image files are stored in private storage.
- File access is gated via HMAC-SHA256 time-bound signed URLs (30-minute default expiration).
- Path traversal defense sanitizes all filenames.

### 1.5 Safe Error Handling & Information Leakage Prevention
- Uniform error handler catches all uncaught exceptions.
- Zero database queries, stack traces, or internal IP addresses are leaked in responses.
- Correlated with a unique `trace_id` for administrative auditing.
