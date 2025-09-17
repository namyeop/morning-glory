import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "로그인 | Morning Glory" },
    { name: "description", content: "Google 로그인으로 계속 진행" },
  ];
}

export default function LoginPage() {
  const [params] = useSearchParams();
  const err = params.get("error");
  const reason = params.get("reason");
  const errorMap: Record<string, string> = {
    oauth_state: "인증 요청 상태가 유효하지 않아요. 브라우저 주소와 콜백 주소를 동일하게 사용해 주세요.",
    server_config: "서버 설정이 올바르지 않아요. 관리자에게 문의해 주세요.",
    token_exchange: "토큰 교환 중 오류가 발생했어요.",
    userinfo: "사용자 정보를 가져오지 못했어요.",
    no_code: "인증 코드가 전달되지 않았어요.",
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">로그인</h1>
      <p className="mb-6 text-sm text-muted-foreground">Google 계정으로만 로그인할 수 있어요.</p>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <b>로그인 오류</b>: {errorMap[err] || err}
          {reason ? <div className="mt-1 text-xs opacity-80">세부 코드: {reason}</div> : null}
        </div>
      )}

      <a
        href="/auth/google"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google 로고" className="h-5 w-5" />
        <span>Google로 계속</span>
      </a>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        계정이 없으신가요? {" "}
        <Link to="/signup" className="text-primary underline">회원가입</Link>
      </p>
    </main>
  );
}

