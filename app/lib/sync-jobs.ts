import { eq, and, notInArray } from "drizzle-orm";
import { db } from "~/db";
import { jobListing } from "~/db/schema";

const SIMPLIFY_URL =
	"https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json";

// Shape of a single entry in Simplify's JSON
interface SimplifyListing {
	id: string;
	company_name: string;
	title: string;
	locations: string[];
	url: string;
	active: boolean;
	date_posted: number;
	date_updated: number;
	source: string;
	category?: string;
	sponsorship?: string;
	is_visible?: boolean;
}

// Validate that the fetched data looks like we expect
function validateSimplifyData(data: unknown): data is SimplifyListing[] {
	if (!Array.isArray(data)) return false;
	if (data.length === 0) return true;

	// Spot-check the first entry has required fields
	const first = data[0];
	return (
		typeof first === "object" &&
		first !== null &&
		typeof first.id === "string" &&
		typeof first.company_name === "string" &&
		typeof first.title === "string" &&
		typeof first.url === "string"
	);
}

// Map one Simplify entry to our schema shape
function mapSimplifyListing(entry: SimplifyListing) {
	return {
		source: "simplify" as const,
		sourceId: entry.id,
		company: entry.company_name,
		title: entry.title,
		locations: JSON.stringify(entry.locations ?? []),
		url: entry.url,
		category: entry.category ?? null,
		sponsorship: entry.sponsorship ?? null,
		active: entry.active ?? true,
		datePosted: entry.date_posted ? new Date(entry.date_posted * 1000) : null,
	};
}

export async function syncSimplifyJobs(): Promise<{ synced: number; error?: string }> {
	let raw: unknown;
	try {
		const response = await fetch(SIMPLIFY_URL);
		if (!response.ok) {
			return { synced: 0, error: `Fetch failed: ${response.status}` };
		}
		raw = await response.json();
	} catch (err) {
		return { synced: 0, error: `Fetch error: ${err}` };
	}

	if (!validateSimplifyData(raw)) {
		return { synced: 0, error: "Validation failed: unexpected JSON shape" };
	}

	// Filter to visible listings only
	const listings = raw.filter((entry) => entry.is_visible !== false);

	const now = new Date();
	const sourceIds: string[] = [];
	let synced = 0;

	// Upsert in batches (D1 has a 100-statement batch limit)
	const BATCH_SIZE = 50;
	for (let i = 0; i < listings.length; i += BATCH_SIZE) {
		const batch = listings.slice(i, i + BATCH_SIZE);
		const statements = batch.map((entry) => {
			const mapped = mapSimplifyListing(entry);
			sourceIds.push(mapped.sourceId);
			return db
				.insert(jobListing)
				.values({
					...mapped,
					createdAt: now,
					updatedAt: now,
				})
				.onConflictDoUpdate({
					target: [jobListing.source, jobListing.sourceId],
					set: {
						company: mapped.company,
						title: mapped.title,
						locations: mapped.locations,
						url: mapped.url,
						category: mapped.category,
						sponsorship: mapped.sponsorship,
						active: mapped.active,
						datePosted: mapped.datePosted,
						updatedAt: now,
					},
				});
		});

		if (statements.length > 0) {
			await db.batch(statements as [typeof statements[0], ...typeof statements[]]);
			synced += statements.length;
		}
	}

	// Mark listings no longer in the feed as inactive
	if (sourceIds.length > 0) {
		await db
			.update(jobListing)
			.set({ active: false, updatedAt: now })
			.where(
				and(
					eq(jobListing.source, "simplify"),
					notInArray(jobListing.sourceId, sourceIds),
				),
			);
	}

	return { synced };
}
