import React from "react";
import { Form } from "react-router";

export type MainPageProps = {
  authenticated: boolean;
  userNickname?: string | null;
  submitting?: boolean;
  streakCount?: number;
};

export default function MainPage({
  authenticated,
  userNickname,
  submitting,
  streakCount = 0,
}: MainPageProps) {
  const [showAuth, setShowAuth] = React.useState(!authenticated);
  React.useEffect(() => {
    setShowAuth(!authenticated);
  }, [authenticated]);

  return (
    <div className="flex min-h-svh flex-col bg-white pb-24 dark:bg-black">
      <section className="flex items-center justify-center bg-gray-50 pb-8 pt-6 dark:bg-gray-900/40">
        <ClockIllustration value={String(streakCount).padStart(2, "0")} />
      </section>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-start px-6 py-10 text-center">
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          연속 {streakCount}일째
        </div>
        <div className="mb-4 px-2">
          <h2 className="text-2xl font-semibold leading-relaxed text-gray-900 dark:text-white">
            카메라를 켜 내 방 창문에 걸린 아침을 인증해주세요
          </h2>
        </div>
        <p className="mb-8 text-sm text-gray-600 dark:text-gray-300">
          지금 인증하면 연속 {streakCount + 1}일째를 이어갈 수 있어요.
        </p>
        {authenticated ? (
          <>
            <div className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              로그인되었습니다
            </div>
            <p className="mb-8 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {userNickname ? (
                <span className="font-medium">{userNickname}</span>
              ) : (
                "사용자"
              )}{" "}
              님 환영해요.
            </p>
            <Form method="post" replace>
              <input type="hidden" name="intent" value="logout" />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                로그아웃
              </button>
            </Form>
          </>
        ) : (
          <>
            <div className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              로그인이 필요해요
            </div>
          </>
        )}
      </section>
      <BottomTab active="home" />

      {showAuth && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAuth(false)}
          />
          <div className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-gray-950">
            <div className="mx-auto max-w-md text-center">
              <div className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                로그인이 필요해요
              </div>
              <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
                Google 계정으로 인증을 진행해 주세요.
              </p>
              <a
                href="/auth/google"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  className="h-5 w-5"
                />
                Google로 계속
              </a>
              <button
                type="button"
                onClick={() => setShowAuth(false)}
                className="mt-3 w-full rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                나중에
              </button>
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
      <div className="absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-black shadow-xl ring-1 ring-black/10" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-mono tabular-nums text-white">
        {value}
      </div>
      <div className="absolute bottom-3 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-amber-400" />
      <div className="absolute inset-x-6 bottom-0 h-8 rounded-b-[32px] bg-gray-800/40 blur" />
      <div className="absolute inset-x-0 -bottom-6 h-16 rounded-full bg-blue-100/70 blur-2xl dark:bg-blue-900/20" />
    </div>
  );
}

function BottomTab({ active = "home" }: { active?: "home" | "camera" | "mypage" }) {
  const itemCls = (isActive: boolean) =>
    `flex flex-col items-center gap-1 ${isActive ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-8 py-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <ul className="mx-auto flex max-w-md items-center justify-between">
        <li>
          <a href="/" className={itemCls(active === "home")}>
            <HomeIcon className="h-6 w-6" />
            <span className="text-[11px]">Home</span>
          </a>
        </li>
        <li>
          <a href="#camera" className={itemCls(active === "camera")}>
            <CameraIcon className="h-6 w-6" />
            <span className="text-[11px]">Camera</span>
          </a>
        </li>
        <li>
          <a href="#mypage" className={itemCls(active === "mypage")}>
            <UserIcon className="h-6 w-6" />
            <span className="text-[11px]">MyPage</span>
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
