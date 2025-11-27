import { authClient } from "@/auth-client";

export function SignOutButton() {
	return (
		<button
			type="button"
			className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
			onClick={() => {
				authClient.signOut().then(() => window.location.reload());
			}}
		>
			Sign Out
		</button>
	);
}
