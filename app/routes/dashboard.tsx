import { Link } from "react-router";
import { X, Briefcase, ExternalLink } from "lucide-react";
import { getRequiredSession } from "~/lib/auth.server";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Dashboard — dear applicant" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	await getRequiredSession(request);

	const url = new URL(request.url);
	const addJob =
		url.searchParams.get("addJob") === "true"
			? {
					company: url.searchParams.get("company") || "",
					role: url.searchParams.get("role") || "",
					url: url.searchParams.get("url") || "",
				}
			: null;

	return { addJob };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { addJob } = loaderData;

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
			{addJob && (
				<div className="mb-8 rounded-lg border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/60 p-4 sm:p-5">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 rounded-md bg-teal-100 p-2 dark:bg-teal-900">
								<Briefcase className="size-5 text-teal-600 dark:text-teal-400" />
							</div>
							<div>
								<h2 className="text-base font-semibold text-teal-900 dark:text-teal-100">
									Add {addJob.company}
									{addJob.role ? ` \u2014 ${addJob.role}` : ""} to
									your board
								</h2>
								<dl className="mt-2 space-y-1 text-sm text-teal-800 dark:text-teal-300">
									{addJob.company && (
										<div className="flex gap-2">
											<dt className="font-medium">
												Company:
											</dt>
											<dd>{addJob.company}</dd>
										</div>
									)}
									{addJob.role && (
										<div className="flex gap-2">
											<dt className="font-medium">
												Role:
											</dt>
											<dd>{addJob.role}</dd>
										</div>
									)}
									{addJob.url && (
										<div className="flex items-center gap-2">
											<dt className="font-medium">
												Listing:
											</dt>
											<dd>
												<a
													href={addJob.url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-teal-600 dark:hover:text-teal-200"
												>
													View posting
													<ExternalLink className="size-3" />
												</a>
											</dd>
										</div>
									)}
								</dl>
								<p className="mt-3 text-sm text-teal-700 dark:text-teal-400">
									Application form coming soon &mdash; save
									this info for now.
								</p>
							</div>
						</div>
						<Link
							to="/dashboard"
							className="rounded-md p-1 text-teal-400 hover:bg-teal-100 hover:text-teal-600 dark:hover:bg-teal-900 dark:hover:text-teal-200 transition-colors"
							aria-label="Dismiss"
						>
							<X className="size-5" />
						</Link>
					</div>
				</div>
			)}

			<h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
				Dashboard
			</h1>
			<p className="mt-2 text-stone-500 dark:text-stone-400">
				Your kanban board will go here.
			</p>
		</div>
	);
}
