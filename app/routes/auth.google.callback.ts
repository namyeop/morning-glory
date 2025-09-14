import type { Route } from "./+types/auth.google.callback";
import { db } from "~/db/client.server";
import { users, sessions } from "~/db/schema.pg";
import { eq } from "drizzle-orm";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  id_token?: string;
  scope?: string;
  token_type: string;
  refresh_token?: string;
};

type UserInfo = {
  sub: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

function parseCookies(h: Headers) {
  const cookie = h.get("cookie") || "";
  const out: Record<string, string> = {};
  cookie.split(";").forEach((p) => {
    const [k, ...rest] = p.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("="));
  });
  return out;
}

function buildRedirectUri(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/auth/google/callback";
  url.search = "";
  return url.toString();
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = parseCookies(request.headers);
  if (!code || !state || !cookies["oauth_state"] || cookies["oauth_state"] !== state) {
    return new Response("Invalid OAuth state", { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  if (!clientId || !clientSecret) {
    return new Response("Missing Google OAuth env", { status: 500 });
  }
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || buildRedirectUri(request);

  // Exchange code
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    return new Response(`Token exchange failed: ${txt}`, { status: 500 });
  }
  const tokens = (await tokenRes.json()) as TokenResponse;

  // Fetch user info
  const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) {
    const txt = await infoRes.text();
    return new Response(`Userinfo failed: ${txt}`, { status: 500 });
  }
  const info = (await infoRes.json()) as UserInfo;
  const userId = info.sub;
  const nickname = info.name || (info.email ? info.email.split("@")[0] : `user_${userId.slice(0, 6)}`);

  // Upsert user
  const existing = await db.select().from(users).where(eq(users.id, userId));
  if (existing.length === 0) {
    await db.insert(users).values({
      id: userId,
      email: info.email ?? null,
      name: info.name ?? null,
      nickname,
      avatarUrl: info.picture ?? null,
      authProvider: "google",
      timezone: "Asia/Seoul",
    });
  }

  // Create session
  const sessionId = crypto.randomUUID();
  const refreshTokenHash = crypto.randomUUID();
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30d
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    provider: "google",
    refreshTokenHash,
    expiresAt,
    revokedAt: null,
  });

  const cookie = [
    `mg_session=${sessionId}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
    `Max-Age=${60 * 60 * 24 * 30}`,
  ]
    .filter(Boolean)
    .join("; ");

  // Clear oauth_state cookie
  const clearState = "oauth_state=; Path=/; Max-Age=0; SameSite=Lax" + (process.env.NODE_ENV === "production" ? "; Secure" : "");

  return Response.redirect("/", 303, {
    headers: { "Set-Cookie": `${cookie}\n${clearState}` },
  });
}

export default function AuthGoogleCallback() {
  return null;
}

