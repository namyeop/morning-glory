import type { Route } from "./+types/auth.google";
import { redirect } from "react-router";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

function buildRedirectUri(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/auth/google/callback";
  url.search = "";
  return url.toString();
}

function makeState() {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}


export async function loader({ request }: Route.LoaderArgs) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  if (!clientId) {
    return new Response("Missing GOOGLE_CLIENT_ID", { status: 500 });
  }
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || buildRedirectUri(request);
  const state = makeState();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    include_granted_scopes: "true",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const cookie = `oauth_state=${state}; HttpOnly; Path=/; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  return redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`, {
    headers: { "Set-Cookie": cookie },
  });
}

export default function AuthGoogle() {
  return null;
}
