import { ScrollReveal } from "./scroll-reveal";

const features = [
	{
		title: "Kanban Board",
		description:
			"Drag and drop applications through your custom pipeline stages.",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.5}
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z"
				/>
			</svg>
		),
	},
	{
		title: "Status History",
		description:
			"Track every status change with automatic timestamps and transitions.",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.5}
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
		),
	},
	{
		title: "Contact Management",
		description:
			"Keep recruiter and hiring manager details organized per application.",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.5}
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
				/>
			</svg>
		),
	},
	{
		title: "Custom Columns",
		description:
			"Create workflow stages that match your unique job search process.",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.5}
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
				/>
			</svg>
		),
	},
];

export function Features() {
	return (
		<section id="features" className="py-24 md:py-32">
			<div className="mx-auto max-w-6xl px-6">
				<ScrollReveal>
					<h2 className="text-3xl font-bold text-center text-warmgray-900 dark:text-white sm:text-4xl">
						Everything you need to stay organized
					</h2>
					<p className="mt-4 text-center text-warmgray-600 dark:text-warmgray-400 max-w-2xl mx-auto">
						Built specifically for job seekers who want to take control of their
						search.
					</p>
				</ScrollReveal>
				<div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					{features.map((feature, i) => (
						<ScrollReveal key={feature.title} delay={i * 0.1}>
							<div className="group rounded-2xl border border-warmgray-200 dark:border-warmgray-800 p-6 transition-shadow hover:shadow-lg hover:shadow-teal-500/5">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-500">
									{feature.icon}
								</div>
								<h3 className="mt-4 text-lg font-semibold text-warmgray-900 dark:text-white">
									{feature.title}
								</h3>
								<p className="mt-2 text-sm text-warmgray-600 dark:text-warmgray-400 leading-relaxed">
									{feature.description}
								</p>
							</div>
						</ScrollReveal>
					))}
				</div>
			</div>
		</section>
	);
}
