import { Link } from "react-router";
import type { Route } from "./+types/signup";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "회원가입 | Morning Glory" },
		{ name: "description", content: "사용자 회원가입 페이지" },
	];
}

export default function SignupPage() {
	return (
		<main className="mx-auto max-w-md px-4 py-16">
			<h1 className="mb-2 text-2xl font-semibold">회원가입</h1>
			<p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
				Morning Glory는 Google 로그인으로만 회원가입을 지원합니다.
			</p>
			<a
				href="/auth/google"
				className="flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<img
					src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
					alt="Google 로고"
					className="h-5 w-5"
				/>
				<span>Google로 계속</span>
			</a>

			<p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
				이미 계정이 있나요?{" "}
				<Link to="/login" className="text-blue-600 underline">
					로그인
				</Link>
			</p>
		</main>
	);
}
