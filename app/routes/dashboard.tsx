import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Dashboard — dear applicant" }];
}

export default function Dashboard() {
	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
			<h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
				Dashboard
			</h1>
			<p className="mt-2 text-stone-500 dark:text-stone-400">
				Your kanban board will go here.
			</p>
		</div>
	);
}
