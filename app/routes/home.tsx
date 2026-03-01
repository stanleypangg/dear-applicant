import type { Route } from "./+types/home";
import { MotionWrapper } from "~/components/landing/motion-wrapper";
import { Navbar } from "~/components/landing/navbar";
import { Hero } from "~/components/landing/hero";
import { Features } from "~/components/landing/features";
import { HowItWorks } from "~/components/landing/how-it-works";
import { FinalCta } from "~/components/landing/final-cta";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Dear Applicant — Track Every Application. Land Your Dream Job." },
		{
			name: "description",
			content:
				"A kanban-style job application tracker to organize your job search and land your dream job.",
		},
	];
}

export default function Home() {
	return (
		<MotionWrapper>
			<Navbar />
			<Hero />
			<Features />
			<HowItWorks />
			<FinalCta />
		</MotionWrapper>
	);
}
