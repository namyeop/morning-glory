import type { Route } from "./+types/camera";
import React from "react";
import { Form, useNavigation, redirect } from "react-router";
import { cn } from "~/lib/utils";
import { eq } from "drizzle-orm";
import { sessions, checkIns } from "~/db/schema.pg";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "아침 인증 카메라" },
    { name: "description", content: "아침을 담고 오늘을 시작해요" },
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
  if (!sessionId) return redirect("/");
  const rows = await db.select({ userId: sessions.userId }).from(sessions).where(eq(sessions.id, sessionId));
  if (rows.length === 0) return redirect("/");
  return Response.json({ ok: true });
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") || "");
  if (intent !== "checkin") return redirect("/");

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
  if (!sessionId) return redirect("/");
  const rows = await db.select({ userId: sessions.userId }).from(sessions).where(eq(sessions.id, sessionId));
  if (rows.length === 0) return redirect("/");
  const userId = rows[0].userId;

  const today = new Date().toISOString().slice(0, 10);
  try {
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
  } catch (_) {
    // ignore duplicate
  }
  return redirect("/?celebrate=1");
}

export default function CameraPage() {
  const navigation = useNavigation();
  const [ready, setReady] = React.useState(false);
  const [hasPhoto, setHasPhoto] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [flash, setFlash] = React.useState(false);
  const reduceRef = React.useRef(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (_) {
        setReady(false);
      }
    };
    start();
    if (typeof window !== "undefined") {
      try {
        reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch {}
    }
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 1280;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    setHasPhoto(true);
  }

  function startCountdown() {
    if (!ready) return;
    if (reduceRef.current) {
      capture();
      setFlash(true);
      setTimeout(() => setFlash(false), 180);
      return;
    }
    setCountdown(3);
    const t1 = setTimeout(() => setCountdown(2), 700);
    const t2 = setTimeout(() => setCountdown(1), 1400);
    const t3 = setTimeout(() => {
      setCountdown(0);
      capture();
      setFlash(true);
      setTimeout(() => setFlash(false), 180);
    }, 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center gap-4 px-4 pb-24 pt-6">
      <header className="w-full text-center">
        <h1 className="text-2xl font-semibold tracking-tight">아침을 담아볼까요</h1>
        <p className="mt-1 text-sm text-muted-foreground">창가의 빛을 가볍게 촬영해 주세요</p>
      </header>

      <div className="relative w-full overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
        <video ref={videoRef} className={cn("aspect-[3/4] w-full bg-black", hasPhoto ? "opacity-0" : "opacity-100")} playsInline muted />
        <canvas ref={canvasRef} className={cn("absolute inset-0", hasPhoto ? "block" : "hidden")} aria-label="촬영된 이미지" />
        {countdown > 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/50 text-4xl font-semibold text-white">
              {countdown}
            </div>
          </div>
        )}
        {flash && <div aria-hidden className="absolute inset-0 z-20 bg-white/80 flash-fade" />}
      </div>

      <div className="mt-2 flex w-full items-center justify-center gap-3">
        <button
          type="button"
          onClick={startCountdown}
          disabled={!ready}
          className="rounded-full border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          사진 찍기
        </button>

        <Form method="post" replace>
          <input type="hidden" name="intent" value="checkin" />
          <button
            type="submit"
            disabled={!hasPhoto || navigation.state === "submitting"}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            인증하기
          </button>
        </Form>
      </div>
    </main>
  );
}
