import { ScrollReveal } from "./scroll-reveal";

const steps = [
	{
		number: "1",
		title: "Sign Up",
		description:
			"Create your free account in seconds. No credit card required.",
	},
	{
		number: "2",
		title: "Add Applications",
		description:
			"Track every job you apply to with company, role, and status.",
	},
	{
		number: "3",
		title: "Track Progress",
		description:
			"Move applications through your pipeline and never miss a follow-up.",
	},
];

export function HowItWorks() {
	return (
		<section className="py-24 md:py-32 bg-warmgray-50 dark:bg-warmgray-900/50">
			<div className="mx-auto max-w-5xl px-6">
				<ScrollReveal>
					<h2 className="text-3xl font-bold text-center text-warmgray-900 dark:text-white sm:text-4xl">
						Get started in minutes
					</h2>
				</ScrollReveal>
				<div className="mt-16 relative">
					{/* Connecting line — desktop only */}
					<div className="hidden md:block absolute top-8 left-[17%] right-[17%] h-px bg-emerald-200 dark:bg-teal-800" />

					<div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
						{steps.map((step, i) => (
							<ScrollReveal key={step.number} delay={i * 0.15}>
								<div className="relative flex flex-col items-center text-center">
									<div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white text-xl font-bold shadow-lg shadow-teal-500/25">
										{step.number}
									</div>
									<h3 className="mt-4 text-lg font-semibold text-warmgray-900 dark:text-white">
										{step.title}
									</h3>
									<p className="mt-2 text-sm text-warmgray-600 dark:text-warmgray-400 leading-relaxed max-w-[240px]">
										{step.description}
									</p>
								</div>
							</ScrollReveal>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
