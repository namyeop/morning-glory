import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { json } from "react-router";
import type { Route } from "./+types/signup";

type ActionData = {
  fieldErrors?: {
    email?: string;
    nickname?: string;
    password?: string;
    confirmPassword?: string;
  };
  formError?: string;
};

function validateEmail(email: string) {
  return /.+@.+\..+/.test(email) ? undefined : "유효한 이메일을 입력하세요.";
}

function validateNickname(nickname: string) {
  if (nickname.length < 2 || nickname.length > 20) return "닉네임은 2~20자입니다.";
  if (!/^[A-Za-z0-9가-힣_.-]+$/.test(nickname)) return "영문/숫자/한글/._-만 사용 가능";
  return undefined;
}

function validatePassword(pw: string) {
  return pw.length >= 8 ? undefined : "비밀번호는 8자 이상이어야 합니다.";
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim();
  const nickname = String(form.get("nickname") || "").trim();
  const password = String(form.get("password") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");

  const fieldErrors = {
    email: validateEmail(email),
    nickname: validateNickname(nickname),
    password: validatePassword(password),
    confirmPassword:
      password && confirmPassword && password === confirmPassword
        ? undefined
        : "비밀번호가 일치하지 않습니다.",
  } as ActionData["fieldErrors"];

  if (fieldErrors.email || fieldErrors.nickname || fieldErrors.password || fieldErrors.confirmPassword) {
    return json<ActionData>({ fieldErrors }, { status: 400 });
  }

  // TODO: 실제 사용자 생성(DB) 및 세션 발급 로직 연결
  // 데모: 회원가입 성공 후 로그인 페이지로 이동
  return redirect("/login?signup=success");
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "회원가입 | Morning Glory" },
    { name: "description", content: "사용자 회원가입 페이지" },
  ];
}

export default function SignupPage() {
  const actionData = useActionData<ActionData>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">회원가입</h1>
      <Form method="post" className="space-y-4" replace>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-transparent"
            aria-invalid={actionData?.fieldErrors?.email ? true : undefined}
            aria-errormessage={actionData?.fieldErrors?.email ? "email-error" : undefined}
          />
          {actionData?.fieldErrors?.email ? (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {actionData.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-medium">
            닉네임
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            autoComplete="nickname"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-transparent"
            aria-invalid={actionData?.fieldErrors?.nickname ? true : undefined}
            aria-errormessage={actionData?.fieldErrors?.nickname ? "nickname-error" : undefined}
          />
          {actionData?.fieldErrors?.nickname ? (
            <p id="nickname-error" className="mt-1 text-xs text-red-600">
              {actionData.fieldErrors.nickname}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-transparent"
            aria-invalid={actionData?.fieldErrors?.password ? true : undefined}
            aria-errormessage={actionData?.fieldErrors?.password ? "password-error" : undefined}
          />
          {actionData?.fieldErrors?.password ? (
            <p id="password-error" className="mt-1 text-xs text-red-600">
              {actionData.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-transparent"
            aria-invalid={actionData?.fieldErrors?.confirmPassword ? true : undefined}
            aria-errormessage={actionData?.fieldErrors?.confirmPassword ? "confirmPassword-error" : undefined}
          />
          {actionData?.fieldErrors?.confirmPassword ? (
            <p id="confirmPassword-error" className="mt-1 text-xs text-red-600">
              {actionData.fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        {actionData?.formError ? (
          <p className="text-sm text-red-600">{actionData.formError}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "가입 중..." : "가입하기"}
        </button>
      </Form>

      <p className="mt-6 text-center text-sm text-gray-600">
        이미 계정이 있나요? <Link to="/login" className="text-blue-600 underline">로그인</Link>
      </p>
    </main>
  );
}

