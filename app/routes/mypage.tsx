import type { Route } from "./+types/mypage";
import { useLoaderData, Form, redirect } from "react-router";
import { sessions, users } from "~/db/schema.pg";
import { eq } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "마이페이지 | Morning Glory" },
    { name: "description", content: "계정 정보 및 로그아웃" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { db } = await import("~/db/client.server");
  const cookie = request.headers.get("cookie") || "";
  const getCookie = (name: string) => {
    try {
      const esc = name.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
      const m = cookie.match(new RegExp(`(?:^|;\\s*)${esc}=([^;]+)`));
      return m ? decodeURIComponent(m[1]) : null;
    } catch {
      return null;
    }
  };
  const sessionId = getCookie("mg_session");
  let nickname: string | null = null;
  if (sessionId) {
    const s = await db.select({ userId: sessions.userId }).from(sessions).where(eq(sessions.id, sessionId));
    if (s.length > 0) {
      const u = await db.select({ nickname: users.nickname }).from(users).where(eq(users.id, s[0].userId));
      nickname = u[0]?.nickname ?? null;
    }
  }
  return Response.json({ authenticated: Boolean(sessionId && nickname), nickname });
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") || "");
  if (intent === "logout") {
    const headers = new Headers();
    const base = "mg_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax";
    headers.append("Set-Cookie", base);
    headers.append("Set-Cookie", base + "; Secure");
    return redirect("/login", { headers });
  }
  return redirect("/mypage");
}

export default function MyPage() {
  const data = useLoaderData<typeof loader>();
  const nick = data?.nickname ?? "사용자";
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold">마이페이지</h1>
      <p className="mb-8 text-sm text-muted-foreground">안녕하세요, {nick}님</p>
      <Form method="post" replace>
        <input type="hidden" name="intent" value="logout" />
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          로그아웃
        </button>
      </Form>
    </main>
  );
}
