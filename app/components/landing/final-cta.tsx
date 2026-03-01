import { Link } from "react-router";
import { m } from "motion/react";
import { ScrollReveal } from "./scroll-reveal";

export function FinalCta() {
	return (
		<section className="py-24 md:py-32">
			<div className="mx-auto max-w-4xl px-6">
				<ScrollReveal>
					<div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 px-8 py-16 md:px-16 text-center">
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
							Ready to take control of your job search?
						</h2>
						<p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
							Join job seekers who use Dear Applicant to stay organized and land
							their dream roles.
						</p>
						<div className="mt-8">
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
						</div>
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}
