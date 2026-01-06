/**
 * SECURITY HEADERS MIDDLEWARE
 * 
 * Implements security headers and CORS configuration to protect against
 * common web vulnerabilities.
 */

import type { Request, Response, NextFunction } from "express";

/**
 * Content Security Policy headers
 */
export const CSP_HEADERS = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "connect-src": ["'self'", "https://api.manus.im"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

/**
 * Convert CSP headers object to string
 */
function buildCSPHeader(): string {
  return Object.entries(CSP_HEADERS)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

/**
 * Apply security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  res.setHeader("Content-Security-Policy", buildCSPHeader());

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()"
  );

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Remove server header
  res.removeHeader("Server");
  res.removeHeader("X-Powered-By");

  next();
}

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: process.env.NODE_ENV === "production"
    ? [
        process.env.VITE_FRONTEND_URL || "https://synapse.app",
        "https://3000-*.manus.computer", // Allow Manus dev URLs
      ]
    : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  maxAge: 86400, // 24 hours
};

/**
 * Validate request origin
 */
export function validateOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  if (!origin) {
    next();
    return;
  }

  const allowedOrigins = Array.isArray(corsConfig.origin)
    ? corsConfig.origin
    : [corsConfig.origin];

  const isAllowed = allowedOrigins.some((allowed) => {
    if (allowed === "*") return true;
    if (typeof allowed === "string") {
      if (allowed.includes("*")) {
        const pattern = allowed
          .replace(/\./g, "\\.")
          .replace(/\*/g, ".*");
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowed === origin;
    }
    return false;
  });

  if (!isAllowed) {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }

  next();
}

/**
 * Sanitize request headers
 */
export function sanitizeHeaders(req: Request, res: Response, next: NextFunction) {
  // Remove potentially dangerous headers
  delete req.headers["x-forwarded-proto"];
  delete req.headers["x-forwarded-host"];
  delete req.headers["x-original-url"];

  next();
}

/**
 * Validate request content type
 */
export function validateContentType(req: Request, res: Response, next: NextFunction) {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"];

    if (!contentType) {
      res.status(400).json({ error: "Content-Type header is required" });
      return;
    }

    if (!contentType.includes("application/json")) {
      res.status(415).json({ error: "Content-Type must be application/json" });
      return;
    }
  }

  next();
}

/**
 * Prevent parameter pollution
 */
export function preventParameterPollution(req: Request, res: Response, next: NextFunction) {
  // Check for duplicate query parameters
  const queryString = req.url.split("?")[1];
  if (queryString) {
    const params = new URLSearchParams(queryString);
    const paramNames = new Set<string>();

    params.forEach((_, key) => {
      if (paramNames.has(key)) {
        res.status(400).json({ error: "Duplicate query parameters detected" });
        return;
      }
      paramNames.add(key);
    });
  }

  next();
}

/**
 * Validate request size
 */
export function validateRequestSize(maxSizeBytes: number = 10 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);

    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        error: `Request body too large. Maximum size is ${maxSizeBytes / 1024 / 1024}MB`,
      });
      return;
    }

    next();
  };
}

/**
 * Log security events
 */
export function logSecurityEvent(
  eventType: string,
  details: Record<string, any>,
  severity: "low" | "medium" | "high" = "low"
) {
  const timestamp = new Date().toISOString();
  const logLevel = severity === "high" ? "ERROR" : severity === "medium" ? "WARN" : "INFO";

  console.log(`[${logLevel}] [SECURITY] ${timestamp} - ${eventType}`, details);
}

/**
 * Detect and log suspicious activity
 */
export function detectSuspiciousActivity(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers["user-agent"] || "";
  const referer = req.headers["referer"] || "";

  // Check for common attack patterns
  const suspiciousPatterns = [
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
  ];

  const checkString = `${req.url} ${JSON.stringify(req.body || {})} ${userAgent}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      logSecurityEvent("Suspicious pattern detected", {
        method: req.method,
        url: req.url,
        pattern: pattern.source,
      }, "high");

      res.status(400).json({ error: "Invalid request" });
      return;
    }
  }

  next();
}

/**
 * Combine all security middleware
 */
export function applySecurityMiddleware(app: any) {
  app.use(securityHeaders);
  app.use(validateOrigin);
  app.use(sanitizeHeaders);
  app.use(validateContentType);
  app.use(preventParameterPollution);
  app.use(validateRequestSize());
  app.use(detectSuspiciousActivity);
}
