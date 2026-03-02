import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, LogOut, Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
} from "~/components/ui/sheet";
import { getRequiredSession } from "~/lib/auth.server";
import type { Route } from "./+types/layout.auth";

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getRequiredSession(request);
	return { user: session.user };
}

function SidebarContent({
	onSignOut,
	onNavigate,
}: {
	onSignOut: () => void;
	onNavigate?: () => void;
}) {
	const location = useLocation();
	const isBoard = location.pathname.startsWith("/dashboard");

	return (
		<div className="flex h-full flex-col">
			{/* Wordmark */}
			<div className="flex h-14 items-center px-6">
				<span className="font-serif italic text-xl text-warmgray-800 dark:text-warmgray-200">
					dear applicant
				</span>
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-3 py-2">
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
			</nav>

			{/* Sign out */}
			<div className="border-t border-warmgray-200 dark:border-warmgray-700 p-3">
				<Button
					variant="ghost"
					size="sm"
					onClick={onSignOut}
					className="w-full justify-start gap-3 text-warmgray-500 hover:text-warmgray-700 dark:text-warmgray-400 dark:hover:text-warmgray-200"
				>
					<LogOut className="size-4" />
					Sign out
				</Button>
			</div>
		</div>
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
		<div className="min-h-screen bg-warmgray-50 dark:bg-warmgray-950">
			{/* Desktop sidebar */}
			<aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-warmgray-200 bg-warmgray-100 dark:border-warmgray-700 dark:bg-warmgray-900 lg:block">
				<SidebarContent onSignOut={handleSignOut} />
			</aside>

			{/* Mobile sidebar (Sheet) */}
			<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
				<SheetContent
					side="left"
					showCloseButton
					className="w-64 p-0 bg-warmgray-100 dark:bg-warmgray-900"
				>
					<SheetTitle className="sr-only">Navigation</SheetTitle>
					<SidebarContent
						onNavigate={() => setMobileOpen(false)}
						onSignOut={() => {
							setMobileOpen(false);
							handleSignOut();
						}}
					/>
				</SheetContent>
			</Sheet>

			{/* Navbar */}
			<header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center border-b border-warmgray-200 bg-white/80 backdrop-blur-sm dark:border-warmgray-700 dark:bg-warmgray-900/80 lg:pl-64">
				<div className="flex w-full items-center justify-between px-4 sm:px-6">
					{/* Mobile hamburger */}
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => setMobileOpen(true)}
						className="lg:hidden"
						aria-label="Open navigation"
					>
						<Menu className="size-5" />
					</Button>

					{/* Spacer for desktop (hamburger is hidden) */}
					<div className="hidden lg:block" />

					{/* User email */}
					<span className="text-sm text-warmgray-500 dark:text-warmgray-400">
						{user.email}
					</span>
				</div>
			</header>

			{/* Main content */}
			<main className="pt-14 lg:pl-64">
				<Outlet />
			</main>
		</div>
	);
}
