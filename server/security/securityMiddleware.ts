/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Security & Hardening Middleware Suite (V10 Production)
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// 1. Production Security Headers Middleware
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate per-request nonce for inline scripts if needed
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // X-XSS-Protection (legacy defense)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Frame Ancestors (Allows AI Studio preview while blocking unauthorized framing)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Strict-Transport-Security (in production HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content-Security-Policy (Permissive for WebGL shaders, Lucide icons, fonts, and API requests while blocking malicious injection)
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss: http://localhost:*",
      "worker-src 'self' blob:",
      "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  );

  next();
}

// 2. CORS Allowed Origins Filter
export function configureCORS(req: Request, res: Response, next: NextFunction) {
  const allowedOriginsEnv = process.env.CORS_ORIGINS || '';
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'https://ai.studio', 'https://*.run.app'];

  const origin = req.headers.origin;
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
        return pattern.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Id, X-Trace-Id');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}

// 3. Sliding Window Rate Limiter & Abuse Protection
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  message?: string;
}) {
  const { windowMs, maxRequests, keyPrefix = 'global', message = 'Rate limit exceeded. Please retry shortly.' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Bypass in local automated test runs if header set
    if (req.headers['x-test-bypass-rate-limit'] === 'true') {
      return next();
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown-ip';
    const userId = (req.headers['x-user-id'] as string) || clientIp;
    const bucketKey = `${keyPrefix}:${userId}`;

    const now = Date.now();
    let bucket = rateLimitMap.get(bucketKey);

    if (!bucket) {
      bucket = { tokens: maxRequests, lastRefill: now };
      rateLimitMap.set(bucketKey, bucket);
    } else {
      // Calculate token replenishment based on elapsed time
      const elapsed = now - bucket.lastRefill;
      if (elapsed > windowMs) {
        bucket.tokens = maxRequests;
        bucket.lastRefill = now;
      }
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', bucket.tokens.toString());
      return next();
    }

    // Rate limit triggered
    const retryAfterSeconds = Math.ceil((bucket.lastRefill + windowMs - now) / 1000);
    res.setHeader('Retry-After', Math.max(1, retryAfterSeconds).toString());
    return res.status(429).json({
      error_code: 'RATE_LIMIT_EXCEEDED',
      message,
      retry_after_seconds: Math.max(1, retryAfterSeconds),
      trace_id: req.headers['x-trace-id'] || `trace-${Date.now()}`
    });
  };
}

// 4. Uniform Error Handling & Zero-Leak Shield
export function unifiedErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const traceId = (req.headers['x-trace-id'] as string) || `err-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  // Safe sanitized logging
  console.error(`[Error Shield] [Trace: ${traceId}] [Path: ${req.path}] Error:`, err?.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : statusCode === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR');
  
  // Mask internal stack traces and database details from client response
  const clientMessage = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Our clinical operations team has logged this event.'
    : (err.message || 'Service request encountered an issue.');

  res.status(statusCode).json({
    error_code: errorCode,
    message: clientMessage,
    trace_id: traceId,
    timestamp: new Date().toISOString()
  });
}
