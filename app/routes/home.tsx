import type { Route } from "./+types/home";
import MainPage from "../components/MainPage";
import { useLoaderData, useNavigation } from "react-router";
import { sessions, users } from "~/db/schema.pg";
import { eq } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { db } = await import("~/db/client.server");
  const cookie = request.headers.get("cookie") || "";
  const map = Object.fromEntries(
    cookie
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const i = p.indexOf("=");
        return [decodeURIComponent(p.slice(0, i)), decodeURIComponent(p.slice(i + 1))];
      })
  );
  const sessionId = map["mg_session"];
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

  return Response.json({ authenticated, userNickname, streakCount });
}

export async function action({ request }: Route.ActionArgs) {
    const form = await request.formData();
    const intent = String(form.get("intent") || "");
    if (intent === "logout") {
        const clear = "mg_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" + (process.env.NODE_ENV === "production" ? "; Secure" : "");
        return Response.redirect("/", 303, { headers: { "Set-Cookie": clear } });
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
	return Response.redirect("/", 303);
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
      />
    );
}
