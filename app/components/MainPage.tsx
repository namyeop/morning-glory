import React from "react";
import { Form, Link } from "react-router";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export type MainPageProps = {
  authenticated: boolean;
  userNickname?: string | null;
  submitting?: boolean;
  streakCount?: number;
  celebrate?: boolean;
};

export default function MainPage({
  authenticated,
  userNickname,
  submitting,
  streakCount = 0,
  celebrate = false,
}: MainPageProps) {
  const [showAuth, setShowAuth] = React.useState(!authenticated);
  const [showCelebrate, setShowCelebrate] = React.useState(false);
  React.useEffect(() => {
    setShowAuth(!authenticated);
  }, [authenticated]);
  React.useEffect(() => {
    if (celebrate) {
      setShowCelebrate(true);
      // remove query param to avoid replay
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has("celebrate")) {
          url.searchParams.delete("celebrate");
          window.history.replaceState({}, "", url.pathname + (url.search ? "?" + url.searchParams.toString() : "") + url.hash);
        }
      } catch {}
      const t = setTimeout(() => setShowCelebrate(false), 1600);
      return () => clearTimeout(t);
    }
  }, [celebrate]);

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24 text-foreground">
      {/* Hero with soft gradient and organic glow */}
      <section className="relative flex items-center justify-center overflow-hidden pb-8 pt-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-accent/10 to-transparent" />
        <div
          aria-hidden
          className="absolute -left-20 -top-24 h-48 w-48 rounded-[40%] bg-orange-200/50 blur-3xl dark:bg-orange-400/10"
        />
        <div
          aria-hidden
          className="absolute -right-16 -bottom-24 h-52 w-52 rounded-[40%] bg-amber-200/60 blur-3xl dark:bg-amber-300/10"
        />
        <CheckinPanel
          authenticated={authenticated}
          submitting={submitting}
          onRequestAuth={() => setShowAuth(true)}
        />
      </section>

      {/* Streak card (interactive) */}
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-start px-6 py-8 text-center">
        <StreakCard streakCount={streakCount} />

        {authenticated ? (
          <>
            <div className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              환영해요{userNickname ? `, ${userNickname}` : ""}
            </div>
            <p className="mb-6 text-sm leading-6 text-gray-600 dark:text-gray-300">
              차분하게 오늘의 빛을 담아볼까요?
            </p>
            <Form method="post" action="." replace className="w-full max-w-md">
              <input type="hidden" name="intent" value="logout" />
              <Button type="submit" aria-label="로그아웃" disabled={submitting} className="w-full" size="lg">
                로그아웃
              </Button>
            </Form>
          </>
        ) : (
          <>
            <div className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              로그인이 필요해요
            </div>
            <p className="mb-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              잠시 로그인하고 아침 인증을 시작해요.
            </p>
            <Button type="button" onClick={() => setShowAuth(true)}>
              로그인하기
            </Button>
          </>
        )}
      </section>

      <BottomTab active="home" />

      {/* Celebrate overlay */}
      {showCelebrate && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative">
            <div className="celebrate-burst h-48 w-48 rounded-full bg-gradient-to-tr from-orange-400/70 via-amber-300/70 to-transparent blur-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-orange-500/95 px-4 py-2 text-sm font-semibold text-white shadow">
                인증 완료!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth bottom sheet */}
      {showAuth && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAuth(false)}
          />
          <div className={cn("absolute inset-x-0 bottom-0 z-50 w-full rounded-t-3xl bg-card p-6 shadow-xl ring-1 ring-border backdrop-blur-sm")}> 
            <div className="mx-auto max-w-md text-center">
              <div id="auth-title" className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                로그인이 필요해요
              </div>
              <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
                Google 계정으로 인증을 진행해 주세요.
              </p>
              <a
                href="/auth/google"
                className={cn("flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2")}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google 로고"
                  className="h-5 w-5"
                />
                Google로 계속
              </a>
              <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => setShowAuth(false)}>
                나중에
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClockIllustration({ value = "00" }: { value?: string }) {
  return (
    <div className="relative mx-auto h-52 w-80">
      <div className="absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-gray-900 shadow-xl ring-1 ring-black/10 dark:bg-gray-800" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-mono tabular-nums text-white">
        {value}
      </div>
      <div className="absolute bottom-3 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-orange-400" />
      <div className="absolute inset-x-6 bottom-0 h-8 rounded-b-[32px] bg-gray-800/40 blur" />
      <div className="absolute inset-x-0 -bottom-6 h-16 rounded-full bg-orange-200/60 blur-2xl dark:bg-orange-300/10" />
    </div>
  );
}

function CheckinPanel({
  authenticated,
  submitting,
  onRequestAuth,
}: {
  authenticated: boolean;
  submitting?: boolean;
  onRequestAuth: () => void;
}) {
  return (
    <div className="relative mx-auto h-52 w-80">
      {/* Dark device backdrop */}
      <div className={cn(
        "checkin-panel absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2",
        "rounded-[32px] bg-gray-900 shadow-xl ring-1 ring-black/10 dark:bg-gray-800"
      )} />

      {/* CTA content */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3">
        {authenticated ? (
          <Link
            to="/camera"
            aria-label="아침 인증 시작"
            className={cn(
              "group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground",
              "shadow-sm transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
            )}
          >
            <CameraIcon className="h-5 w-5" />
            아침 인증 시작
          </Link>
        ) : (
          <button
            type="button"
            aria-label="로그인하고 인증 시작"
            onClick={onRequestAuth}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white",
              "ring-1 ring-white/15 backdrop-blur transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
            )}
          >
            <CameraIcon className="h-5 w-5" />
            로그인하고 시작
          </button>
        )}
        <div className="text-[11px] font-medium text-white/70">가볍게 눌러서 시작해요</div>
      </div>

      {/* Accent and glow */}
      <div className="absolute bottom-3 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-orange-400" />
      <div className="absolute inset-x-6 bottom-0 h-8 rounded-b-[32px] bg-gray-800/40 blur" />
      <div className="absolute inset-x-0 -bottom-6 h-16 rounded-full bg-orange-200/60 blur-2xl dark:bg-orange-300/10" />
    </div>
  );
}

function StreakCard({ streakCount }: { streakCount: number }) {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [mouse, setMouse] = React.useState({ mx: 0, my: 0 });
  const ref = React.useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1; // -1..1
    const py = (y / rect.height) * 2 - 1; // -1..1
    setMouse({ mx: x, my: y });
    setTilt({ x: px * 6, y: -py * 6 }); // subtle tilt
  }
  function onLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div className="w-full max-w-md">
      <div
        className="group relative [perspective:1000px]"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* soft gradient halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 -z-10 rounded-[28px] bg-gradient-to-tr from-orange-300/50 via-amber-200/40 to-transparent blur-xl transition-opacity duration-500 group-hover:opacity-90 dark:from-orange-400/20 dark:via-amber-300/15"
        />
        {/* highlight follows cursor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[24px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background: `radial-gradient(300px circle at ${mouse.mx}px ${mouse.my}px, rgba(255,180,120,0.18), transparent 60%)`,
          }}
        />

        <div
          ref={ref}
          tabIndex={0}
          className={cn(
            "relative rounded-3xl bg-white/85 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-300",
            "dark:bg-gray-900/60 dark:ring-white/10"
          )}
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <span
              aria-live="polite"
              className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-200 streak-breath"
              style={{ transform: "translateZ(12px)" }}
            >
              <span aria-hidden>🔥</span> 연속 {streakCount}일째
            </span>
            <span className="relative inline-flex h-2 w-2" aria-hidden style={{ transform: "translateZ(12px)" }}>
              <span className="streak-ping absolute inline-flex h-full w-full rounded-full bg-orange-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
          </div>
          <h2
            className="mb-2 text-2xl font-semibold leading-relaxed tracking-tight text-gray-900 dark:text-white"
            style={{ transform: "translateZ(16px)" }}
          >
            아침 인증으로 하루를 부드럽게 시작해요
          </h2>
          <p
            className="text-sm leading-6 text-gray-600 dark:text-gray-300"
            style={{ transform: "translateZ(14px)" }}
          >
            지금 인증하면 연속 {streakCount + 1}일째를 이어갈 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}

function BottomTab({ active = "home" }: { active?: "home" | "camera" | "mypage" }) {
  const itemCls = (isActive: boolean) =>
    cn(
      "flex flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium transition-colors",
      isActive
        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200"
        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-6 py-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <ul className="mx-auto flex max-w-md items-center justify-between">
        <li>
          <a href="/" className={itemCls(active === "home")}>
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </a>
        </li>
        <li>
          <a href="/camera" className={itemCls(active === "camera")}>
            <CameraIcon className="h-5 w-5" />
            <span>Camera</span>
          </a>
        </li>
        <li>
          <a href="/mypage" className={itemCls(active === "mypage")}>
            <UserIcon className="h-5 w-5" />
            <span>MyPage</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m3 10 9-7 9 7" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 8h4l2-3h6l2 3h4v11H3z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </svg>
  );
}
