import {
	Form,
	Link,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
import type { Route } from "./+types/login";

type ActionData = {
	fieldErrors?: { email?: string; password?: string };
	formError?: string;
};

function validateEmail(email: string) {
	return /.+@.+\..+/.test(email) ? undefined : "유효한 이메일을 입력하세요.";
}

function validatePassword(pw: string) {
	return pw.length >= 8 ? undefined : "비밀번호는 8자 이상이어야 합니다.";
}

export async function action({ request }: Route.ActionArgs) {
	const form = await request.formData();
	const email = String(form.get("email") || "").trim();
	const password = String(form.get("password") || "");

	const fieldErrors = {
		email: validateEmail(email),
		password: validatePassword(password),
	};

	if (fieldErrors.email || fieldErrors.password) {
		return Response.json<ActionData>({ fieldErrors }, { status: 400 });
	}

	// TODO: 실제 인증 로직(세션/DB/OAuth) 연동
	// 데모용으로 홈으로 리디렉션합니다.
	return redirect("/");
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "로그인 | Morning Glory" },
		{ name: "description", content: "사용자 로그인 페이지" },
	];
}

export default function LoginPage() {
	const actionData = useActionData<ActionData>();
	const nav = useNavigation();
	const submitting = nav.state === "submitting";

	return (
		<main className="mx-auto max-w-md px-4 py-16">
			<h1 className="mb-6 text-2xl font-semibold">로그인</h1>
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
						aria-errormessage={
							actionData?.fieldErrors?.email ? "email-error" : undefined
						}
					/>
					{actionData?.fieldErrors?.email ? (
						<p id="email-error" className="mt-1 text-xs text-red-600">
							{actionData.fieldErrors.email}
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
						autoComplete="current-password"
						required
						className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-transparent"
						aria-invalid={actionData?.fieldErrors?.password ? true : undefined}
						aria-errormessage={
							actionData?.fieldErrors?.password ? "password-error" : undefined
						}
					/>
					{actionData?.fieldErrors?.password ? (
						<p id="password-error" className="mt-1 text-xs text-red-600">
							{actionData.fieldErrors.password}
						</p>
					) : null}
				</div>

				{actionData?.formError ? (
					<p className="text-sm text-red-600">{actionData.formError}</p>
				) : null}

				<button
					type="submit"
					disabled={submitting}
					className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
					{submitting ? "로그인 중..." : "로그인"}
				</button>
			</Form>

                <div className="mt-6 space-y-2">
                    <div className="text-center text-sm text-gray-500">또는</div>
                    <a
                        href="/auth/google"
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-5 w-5" />
                        <span>Google로 계속</span>
                    </a>
                </div>

			<p className="mt-6 text-center text-sm text-gray-600">
				계정이 없으신가요?{" "}
				<Link to="/signup" className="text-blue-600 underline">
					회원가입
				</Link>
			</p>
		</main>
	);
}
