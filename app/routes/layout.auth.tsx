import { Outlet, useNavigate } from "react-router";
import { getRequiredSession } from "~/lib/auth.server";
import type { Route } from "./+types/layout.auth";

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getRequiredSession(request);
	return { user: session.user };
}

export default function AuthLayout({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;
	const navigate = useNavigate();

	async function handleSignOut() {
		try {
			const { signOut } = await import("~/lib/auth.client");
			await signOut();
		} catch {
			// Best-effort sign-out — navigate to login regardless
		}
		navigate("/login");
	}

	return (
		<div className="min-h-screen bg-stone-50 dark:bg-gray-950">
			<header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
					<span className="font-serif italic text-xl text-stone-800 dark:text-stone-200">
						dear applicant
					</span>
					<div className="flex items-center gap-4">
						<span className="text-sm text-stone-500 dark:text-stone-400">
							{user.email}
						</span>
						<button
							onClick={handleSignOut}
							className="text-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
						>
							Sign out
						</button>
					</div>
				</div>
			</header>
			<main>
				<Outlet />
			</main>
		</div>
	);
}
