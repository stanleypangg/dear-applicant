import { Link } from "react-router";
import { m } from "motion/react";
import { GradientBlob } from "./gradient-blob";

export function Hero() {
	return (
		<section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
			<GradientBlob />
			<div className="relative mx-auto max-w-4xl px-6 text-center">
				<m.h1
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
				>
					Track Every Application.{" "}
					<span className="text-emerald-500">Land Your Dream Job.</span>
				</m.h1>
				<m.p
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
				>
					Stop losing track of where you applied. Organize your entire job
					search with a visual kanban board built for applicants.
				</m.p>
				<m.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="mt-10"
				>
					<m.div
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="inline-block"
					>
						<Link
							to="/sign-up"
							className="inline-flex items-center px-8 py-3.5 text-base font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors shadow-lg shadow-emerald-500/25"
						>
							Get Started &mdash; It&apos;s Free
						</Link>
					</m.div>
				</m.div>
			</div>
		</section>
	);
}
