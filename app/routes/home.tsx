import type { Route } from "./+types/home";
import MainPage from "../components/MainPage";
import { useLoaderData, useNavigation, redirect } from "react-router";
import { sessions, users, checkIns } from "~/db/schema.pg";
import { eq } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { db } = await import("~/db/client.server");
  const url = new URL(request.url);
  const celebrate = url.searchParams.get("celebrate") === "1";
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
  
  let authenticated = false;
  let userNickname: string | null = null;
  let streakCount = 0;

  if (sessionId) {
    const rows = await db.select({ userId: sessions.userId }).from(sessions).where(eq(sessions.id, sessionId));
    if (rows.length > 0) {
      authenticated = true;
      const u = await db.select({ nickname: users.nickname }).from(users).where(eq(users.id, rows[0].userId));
      userNickname = u[0]?.nickname ?? null;
      // compute streak
      const dates = await db
        .select({ date: checkIns.date })
        .from(checkIns)
        .where(eq(checkIns.userId, rows[0].userId));
      const dateSet = new Set(dates.map((r) => r.date));
      const today = new Date();
      const ymd = (d: Date) => d.toISOString().slice(0, 10);
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (dateSet.has(ymd(d))) streakCount += 1;
        else break;
      }
    }
  }

  return Response.json({ authenticated, userNickname, streakCount, celebrate });
}

export async function action({ request }: Route.ActionArgs) {
    const form = await request.formData();
    const intent = String(form.get("intent") || "");
    if (intent === "logout") {
        const headers = new Headers();
        const base = "mg_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax";
        headers.append("Set-Cookie", base);
        headers.append("Set-Cookie", base + "; Secure");
        return redirect("/", { headers });
    }

	const userId = "demo-user";
	const today = new Date().toISOString().slice(0, 10);
	try {
		const { db } = await import("~/db/client.server");
		await db.insert(checkIns).values({
			id: crypto.randomUUID(),
			userId,
			date: today,
			photoId: crypto.randomUUID(),
			message: null,
			capturedAt: Date.now(),
			deviceInfo: null,
			lat: null,
			lon: null,
			verifiedSource: true,
			verificationReason: null,
			status: "verified",
			createdAt: new Date(),
		});
	} catch (e) {
		// ignore unique violation
	}
	return redirect("/");
}

export default function Home() {
    const data = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const authenticated = data?.authenticated ?? false;
    const userNickname = data?.userNickname ?? null;
    const submitting = navigation.state === "submitting";
    return (
      <MainPage
        authenticated={authenticated}
        userNickname={userNickname}
        streakCount={data?.streakCount ?? 0}
        submitting={submitting}
        celebrate={data?.celebrate ?? false}
      />
    );
}
