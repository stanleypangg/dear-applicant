import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, LogOut, Menu, Briefcase } from "lucide-react";
import { getRequiredSession } from "~/lib/auth.server";
import type { Route } from "./+types/layout.auth";

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getRequiredSession(request);
	return { user: session.user };
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
	const location = useLocation();
	const isBoard = location.pathname.startsWith("/dashboard");
	const isJobs = location.pathname.startsWith("/jobs");

	return (
		<nav className="flex flex-col gap-1 px-3 py-4">
			<Link
				to="/dashboard"
				onClick={onNavigate}
				className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
					isBoard
						? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
						: "text-warmgray-600 hover:bg-warmgray-100 hover:text-warmgray-900 dark:text-warmgray-400 dark:hover:bg-warmgray-800 dark:hover:text-warmgray-200"
				}`}
			>
				<LayoutDashboard className="size-4" />
				Board
			</Link>
			<Link
				to="/jobs"
				onClick={onNavigate}
				className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
					isJobs
						? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
						: "text-warmgray-600 hover:bg-warmgray-100 hover:text-warmgray-900 dark:text-warmgray-400 dark:hover:bg-warmgray-800 dark:hover:text-warmgray-200"
				}`}
			>
				<Briefcase className="size-4" />
				Jobs
			</Link>
		</nav>
	);
}

export default function AuthLayout({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;
	const navigate = useNavigate();
	const [mobileOpen, setMobileOpen] = useState(false);

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
				<div className="mx-auto flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<button
							onClick={() => setMobileOpen((o) => !o)}
							className="lg:hidden text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
							aria-label="Toggle navigation"
						>
							<Menu className="size-5" />
						</button>
						<span className="font-serif italic text-xl text-stone-800 dark:text-stone-200">
							dear applicant
						</span>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-sm text-stone-500 dark:text-stone-400">
							{user.email}
						</span>
						<button
							onClick={handleSignOut}
							className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
						>
							<LogOut className="size-3.5" />
							Sign out
						</button>
					</div>
				</div>
			</header>
			<div className="flex">
				{/* Desktop sidebar */}
				<aside className="hidden lg:block w-56 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 min-h-[calc(100vh-3.5rem)]">
					<SidebarContent />
				</aside>

				{/* Mobile sidebar overlay */}
				{mobileOpen && (
					<>
						<div
							className="fixed inset-0 z-40 bg-black/30 lg:hidden"
							onClick={() => setMobileOpen(false)}
						/>
						<aside className="fixed inset-y-0 left-0 z-50 w-56 bg-white dark:bg-stone-900 shadow-lg lg:hidden pt-14">
							<SidebarContent
								onNavigate={() => setMobileOpen(false)}
							/>
						</aside>
					</>
				)}

				<main className="flex-1 min-w-0">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
