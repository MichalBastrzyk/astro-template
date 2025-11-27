import { navigate } from "astro:transitions/client";
import { Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/auth-client";

export function SignInForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const { error } = await authClient.signIn.email({
				email,
				password,
				callbackURL: "/",
			});

			if (error) {
				setError(error.message || "Failed to sign in. Please try again.");
			}

			navigate("/");
		} catch {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-md">
			<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mb-8 text-center">
					<h1 className="font-bold text-2xl text-zinc-900 dark:text-white">Welcome back</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">Sign in to your account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					{error && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
							<p className="text-red-600 text-sm dark:text-red-400">{error}</p>
						</div>
					)}

					<div className="space-y-2">
						<label
							htmlFor="email"
							className="block font-medium text-sm text-zinc-700 dark:text-zinc-300"
						>
							Email
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Mail className="h-5 w-5 text-zinc-400" />
							</div>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								required
								className="block w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-3 pl-10 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="password"
							className="block font-medium text-sm text-zinc-700 dark:text-zinc-300"
						>
							Password
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Lock className="h-5 w-5 text-zinc-400" />
							</div>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								className="block w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-3 pl-10 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 dark:focus:ring-offset-zinc-900"
					>
						{isLoading ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin" />
								Signing in...
							</>
						) : (
							"Sign in"
						)}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
					Don't have an account?{" "}
					<a
						href="/auth/sign-up"
						className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
					>
						Sign up
					</a>
				</p>
			</div>
		</div>
	);
}
