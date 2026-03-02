import { useState, useEffect } from "react";
import { Link } from "react-router";
import { m } from "motion/react";

export function Navbar() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4">
			<nav
				className={`flex items-center justify-between w-full max-w-5xl px-5 py-2.5 rounded-full transition-all duration-300 ${
					scrolled
						? "bg-white/80 dark:bg-warmgray-900/80 backdrop-blur-lg shadow-sm shadow-warmgray-200/50 dark:shadow-warmgray-900/50"
						: "bg-transparent"
				}`}
			>
				<Link
					to="/"
					className="text-lg font-semibold text-warmgray-900 dark:text-white tracking-tight"
				>
					dear applicant
				</Link>

				<a
					href="#features"
					className="hidden md:block text-sm text-warmgray-600 dark:text-warmgray-400 hover:text-warmgray-900 dark:hover:text-white transition-colors"
				>
					Features
				</a>

				<div className="flex items-center gap-3">
					<Link
						to="/sign-in"
						className="hidden sm:block text-sm text-warmgray-600 dark:text-warmgray-400 hover:text-warmgray-900 dark:hover:text-white transition-colors"
					>
						Sign In
					</Link>
					<m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<Link
							to="/sign-up"
							className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-full transition-colors"
						>
							Get Started
						</Link>
					</m.div>
				</div>
			</nav>
		</header>
	);
}
