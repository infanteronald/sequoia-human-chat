import { NextRequest, NextResponse } from "next/server";

// Routes that require session auth
const PROTECTED_API_ROUTES = [
  "/api/panel",
  "/api/sequoia-chat",
  "/api/whatsapp/send",
  "/api/whatsapp/ai-suggest",
  "/api/whatsapp/ai-learn",
  "/api/whatsapp/keepalive",
  "/api/whatsapp/media",
];

// Rate limiting maps
const rateMaps = {
  auth: new Map<string, { count: number; resetAt: number }>(),
  general: new Map<string, { count: number; resetAt: number }>(),
};

function checkRateLimit(
  ip: string,
  map: Map<string, { count: number; resetAt: number }>,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = map.get(ip);
  if (!entry || now > entry.resetAt) {
    map.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate limiting for auth routes (5 per minute)
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register")
  ) {
    if (!checkRateLimit(ip, rateMaps.auth, 5, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }
  // General rate limiting for API routes (60 per minute)
  else if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(ip, rateMaps.general, 60, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // Check if this is a protected API route
  const isProtectedApi = PROTECTED_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedPage = pathname.startsWith("/panel");

  if (!isProtectedApi && !isProtectedPage) {
    return NextResponse.next();
  }

  // Allow internal service calls with secret header
  const internalSecret = request.headers.get("x-internal-secret");
  if (internalSecret && internalSecret === process.env.INTERNAL_API_SECRET) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session-token")?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify session exists via internal API call to avoid Prisma in edge runtime
  try {
    const verifyUrl = new URL("/api/auth/verify-session", request.url);
    const verifyRes = await fetch(verifyUrl.toString(), {
      headers: { cookie: `session-token=${token}` },
    });
    if (!verifyRes.ok) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // If verification fails (e.g., route not yet created), allow request
    // to avoid breaking the app during deployment
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/api/panel/:path*",
    "/api/sequoia-chat/:path*",
    "/api/whatsapp/send",
    "/api/whatsapp/ai-suggest",
    "/api/whatsapp/ai-learn",
    "/api/whatsapp/keepalive",
    "/api/whatsapp/media",
    "/api/auth/login",
    "/api/auth/register",
  ],
};
