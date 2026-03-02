import type { BatchItem } from "drizzle-orm/batch";
import { eq, asc, count } from "drizzle-orm";
import { data } from "react-router";
import { useFetcher } from "react-router";
import { useState, useEffect, useRef, useId } from "react";
import { MoreHorizontal, Plus, Check } from "lucide-react";
import { db } from "~/db";
import { boardColumn, application } from "~/db/schema";
import { getRequiredSession } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Route } from "./+types/dashboard";

const DEFAULT_COLUMNS = [
	{ name: "Bookmarked", color: "indigo" },
	{ name: "Applied", color: "blue" },
	{ name: "Interview", color: "amber" },
	{ name: "Offer", color: "green" },
] as const;

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getRequiredSession(request);
	const userId = session.user.id;

	// Check if user has any columns
	const [{ value: columnCount }] = await db
		.select({ value: count() })
		.from(boardColumn)
		.where(eq(boardColumn.userId, userId));

	// Auto-seed default columns for new users
	if (columnCount === 0) {
		const now = new Date();
		const inserts = DEFAULT_COLUMNS.map((col, i) =>
			db.insert(boardColumn).values({
				userId,
				name: col.name,
				color: col.color,
				position: i,
				createdAt: now,
				updatedAt: now,
			}),
		) as unknown as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]];
		await db.batch(inserts);
	}

	// Fetch all columns ordered by position
	const columns = await db
		.select()
		.from(boardColumn)
		.where(eq(boardColumn.userId, userId))
		.orderBy(asc(boardColumn.position));

	// Fetch all applications ordered by position
	const applications = await db
		.select()
		.from(application)
		.where(eq(application.userId, userId))
		.orderBy(asc(application.position));

	// Group applications by columnId
	const appsByColumn = new Map<string, typeof applications>();
	for (const app of applications) {
		const list = appsByColumn.get(app.columnId) ?? [];
		list.push(app);
		appsByColumn.set(app.columnId, list);
	}

	return data({
		columns: columns.map((col) => ({
			...col,
			applications: appsByColumn.get(col.id) ?? [],
		})),
	});
}

export function meta({}: Route.MetaArgs) {
	return [{ title: "Dashboard — dear applicant" }];
}

const COLUMN_COLORS: Record<string, string> = {
	indigo: "#6366F1",
	blue: "#3B82F6",
	amber: "#F59E0B",
	green: "#22C55E",
	teal: "#14B8A6",
	purple: "#A855F7",
	pink: "#EC4899",
	orange: "#F97316",
	red: "#EF4444",
};

type Column = Route.ComponentProps["loaderData"]["columns"][number];
type Application = Column["applications"][number];

/* -------------------------------------------------------------------------- */
/*  Color Picker                                                              */
/* -------------------------------------------------------------------------- */

function ColumnColorPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (color: string) => void;
}) {
	return (
		<div className="grid grid-cols-5 gap-3">
			{Object.entries(COLUMN_COLORS).map(([name, hex]) => (
				<button
					key={name}
					type="button"
					aria-label={name.charAt(0).toUpperCase() + name.slice(1)}
					aria-pressed={value === name}
					className="flex flex-col items-center gap-1"
					onClick={() => onChange(name)}
				>
					<span
						className={`h-8 w-8 rounded-full cursor-pointer transition-all flex items-center justify-center ${
							value === name
								? "ring-2 ring-offset-2 ring-warmgray-400"
								: "hover:ring-2 hover:ring-offset-2 hover:ring-warmgray-300"
						}`}
						style={{ backgroundColor: hex }}
					>
						{value === name && <Check className="size-4 text-white" />}
					</span>
					<span className="text-[10px] text-warmgray-500 dark:text-warmgray-400">
						{name.charAt(0).toUpperCase() + name.slice(1)}
					</span>
				</button>
			))}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Add Column Dialog                                                         */
/* -------------------------------------------------------------------------- */

function AddColumnDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const fetcher = useFetcher();
	const [name, setName] = useState("");
	const [color, setColor] = useState("blue");
	const wasSubmitting = useRef(false);

	const isSubmitting = fetcher.state !== "idle";

	// Close dialog on successful submission
	useEffect(() => {
		if (fetcher.state !== "idle") {
			wasSubmitting.current = true;
		}
		if (wasSubmitting.current && fetcher.state === "idle" && fetcher.data && !("error" in fetcher.data)) {
			wasSubmitting.current = false;
			onOpenChange(false);
			setName("");
			setColor("blue");
		}
	}, [fetcher.state, fetcher.data, onOpenChange]);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!name.trim()) return;
		fetcher.submit(
			{ intent: "create", name: name.trim(), color },
			{ method: "POST", action: "/dashboard/columns" },
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Column</DialogTitle>
					<DialogDescription>
						Create a new column for your board.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="column-name">Column name</Label>
						<Input
							id="column-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Interview"
							required
							autoFocus
						/>
					</div>
					<div className="space-y-2">
						<Label>Color</Label>
						<ColumnColorPicker value={color} onChange={setColor} />
					</div>
					{fetcher.data && "error" in fetcher.data && (
						<p className="text-sm text-red-600">
							{String(fetcher.data.error)}
						</p>
					)}
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting || !name.trim()}>
							{isSubmitting ? "Saving..." : "Add Column"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/* -------------------------------------------------------------------------- */
/*  Rename Column Dialog                                                      */
/* -------------------------------------------------------------------------- */

function RenameColumnDialog({
	open,
	onOpenChange,
	column,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	column: Column;
}) {
	const fetcher = useFetcher();
	const [name, setName] = useState(column.name);
	const wasSubmitting = useRef(false);

	const isSubmitting = fetcher.state !== "idle";

	// Reset name when dialog opens with a different column
	useEffect(() => {
		if (open) setName(column.name);
	}, [open, column.name]);

	// Close dialog on successful submission
	useEffect(() => {
		if (fetcher.state !== "idle") {
			wasSubmitting.current = true;
		}
		if (wasSubmitting.current && fetcher.state === "idle" && fetcher.data && !("error" in fetcher.data)) {
			wasSubmitting.current = false;
			onOpenChange(false);
		}
	}, [fetcher.state, fetcher.data, onOpenChange]);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!name.trim()) return;
		fetcher.submit(
			{ intent: "update", columnId: column.id, name: name.trim() },
			{ method: "POST", action: "/dashboard/columns" },
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename Column</DialogTitle>
					<DialogDescription>
						Enter a new name for &ldquo;{column.name}&rdquo;.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="rename-column-name">Column name</Label>
						<Input
							id="rename-column-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							autoFocus
						/>
					</div>
					{fetcher.data && "error" in fetcher.data && (
						<p className="text-sm text-red-600">
							{String(fetcher.data.error)}
						</p>
					)}
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting || !name.trim()}>
							{isSubmitting ? "Saving..." : "Rename"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/* -------------------------------------------------------------------------- */
/*  Change Color Dialog                                                       */
/* -------------------------------------------------------------------------- */

function ChangeColorDialog({
	open,
	onOpenChange,
	column,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	column: Column;
}) {
	const fetcher = useFetcher();
	const [selectedColor, setSelectedColor] = useState(column.color);
	const wasSubmitting = useRef(false);

	// Reset when dialog opens
	useEffect(() => {
		if (open) setSelectedColor(column.color);
	}, [open, column.color]);

	// Close dialog on successful submission
	useEffect(() => {
		if (fetcher.state !== "idle") {
			wasSubmitting.current = true;
		}
		if (wasSubmitting.current && fetcher.state === "idle" && fetcher.data && !("error" in fetcher.data)) {
			wasSubmitting.current = false;
			onOpenChange(false);
		}
	}, [fetcher.state, fetcher.data, onOpenChange]);

	function handleColorChange(color: string) {
		setSelectedColor(color);
		fetcher.submit(
			{ intent: "update", columnId: column.id, color },
			{ method: "POST", action: "/dashboard/columns" },
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Color</DialogTitle>
					<DialogDescription>
						Pick a new color for &ldquo;{column.name}&rdquo;.
					</DialogDescription>
				</DialogHeader>
				<ColumnColorPicker
					value={selectedColor}
					onChange={handleColorChange}
				/>
				{fetcher.data && "error" in fetcher.data && (
					<p className="text-sm text-red-600">
						{String(fetcher.data.error)}
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

/* -------------------------------------------------------------------------- */
/*  Delete Column Dialog                                                      */
/* -------------------------------------------------------------------------- */

function DeleteColumnDialog({
	open,
	onOpenChange,
	column,
	allColumns,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	column: Column;
	allColumns: Column[];
}) {
	const fetcher = useFetcher();
	const [destinationColumnId, setDestinationColumnId] = useState("");
	const wasSubmitting = useRef(false);

	const hasApps = column.applications.length > 0;
	const otherColumns = allColumns.filter((c) => c.id !== column.id);
	const isSubmitting = fetcher.state !== "idle";

	// Reset destination when dialog opens
	useEffect(() => {
		if (open) {
			setDestinationColumnId(otherColumns[0]?.id ?? "");
		}
	}, [open]); // eslint-disable-line react-hooks/exhaustive-deps

	// Close dialog on successful submission
	useEffect(() => {
		if (fetcher.state !== "idle") {
			wasSubmitting.current = true;
		}
		if (wasSubmitting.current && fetcher.state === "idle" && fetcher.data && !("error" in fetcher.data)) {
			wasSubmitting.current = false;
			onOpenChange(false);
		}
	}, [fetcher.state, fetcher.data, onOpenChange]);

	function handleDelete() {
		const formData: Record<string, string> = {
			intent: "delete",
			columnId: column.id,
		};
		if (hasApps && destinationColumnId) {
			formData.destinationColumnId = destinationColumnId;
		}
		fetcher.submit(formData, {
			method: "POST",
			action: "/dashboard/columns",
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Column</DialogTitle>
					<DialogDescription>
						{hasApps
							? `"${column.name}" has ${column.applications.length} application${column.applications.length === 1 ? "" : "s"}. Choose a column to move them to before deleting.`
							: `Are you sure you want to delete "${column.name}"? This action cannot be undone.`}
					</DialogDescription>
				</DialogHeader>
				{hasApps && (
					<div className="space-y-2">
						<Label htmlFor="destination-column">
							Move applications to
						</Label>
						<Select
							value={destinationColumnId}
							onValueChange={setDestinationColumnId}
						>
							<SelectTrigger className="w-full" id="destination-column">
								<SelectValue placeholder="Select a column" />
							</SelectTrigger>
							<SelectContent>
								{otherColumns.map((col) => (
									<SelectItem key={col.id} value={col.id}>
										{col.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				{fetcher.data && "error" in fetcher.data && (
					<p className="text-sm text-red-600">
						{String(fetcher.data.error)}
					</p>
				)}
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isSubmitting || (hasApps && !destinationColumnId)}
					>
						{isSubmitting
						? (hasApps ? "Moving & Deleting..." : "Deleting...")
						: (hasApps ? "Move & Delete" : "Delete")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/* -------------------------------------------------------------------------- */
/*  Currency Options                                                          */
/* -------------------------------------------------------------------------- */

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;

/* -------------------------------------------------------------------------- */
/*  Application Form Fields (shared between Add and Edit)                     */
/* -------------------------------------------------------------------------- */

function ApplicationFormFields({
	idPrefix,
	company,
	setCompany,
	role,
	setRole,
	url,
	setUrl,
	dateApplied,
	setDateApplied,
	salaryMin,
	setSalaryMin,
	salaryMax,
	setSalaryMax,
	salaryCurrency,
	setSalaryCurrency,
	notes,
	setNotes,
}: {
	idPrefix: string;
	company: string;
	setCompany: (v: string) => void;
	role: string;
	setRole: (v: string) => void;
	url: string;
	setUrl: (v: string) => void;
	dateApplied: string;
	setDateApplied: (v: string) => void;
	salaryMin: string;
	setSalaryMin: (v: string) => void;
	salaryMax: string;
	setSalaryMax: (v: string) => void;
	salaryCurrency: string;
	setSalaryCurrency: (v: string) => void;
	notes: string;
	setNotes: (v: string) => void;
}) {
	return (
		<>
			<div className="space-y-2">
				<Label htmlFor={`${idPrefix}-company`}>Company</Label>
				<Input
					id={`${idPrefix}-company`}
					value={company}
					onChange={(e) => setCompany(e.target.value)}
					placeholder="e.g. Acme Corp"
					required
					autoFocus
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={`${idPrefix}-role`}>Role</Label>
				<Input
					id={`${idPrefix}-role`}
					value={role}
					onChange={(e) => setRole(e.target.value)}
					placeholder="e.g. Software Engineer"
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={`${idPrefix}-url`}>URL</Label>
				<Input
					id={`${idPrefix}-url`}
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://..."
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={`${idPrefix}-date-applied`}>Date Applied</Label>
				<Input
					id={`${idPrefix}-date-applied`}
					type="date"
					value={dateApplied}
					onChange={(e) => setDateApplied(e.target.value)}
				/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor={`${idPrefix}-salary-min`}>Salary Min</Label>
					<Input
						id={`${idPrefix}-salary-min`}
						type="number"
						value={salaryMin}
						onChange={(e) => setSalaryMin(e.target.value)}
						placeholder="e.g. 80000"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor={`${idPrefix}-salary-max`}>Salary Max</Label>
					<Input
						id={`${idPrefix}-salary-max`}
						type="number"
						value={salaryMax}
						onChange={(e) => setSalaryMax(e.target.value)}
						placeholder="e.g. 120000"
					/>
				</div>
			</div>
			<div className="space-y-2">
				<Label htmlFor={`${idPrefix}-currency`}>Currency</Label>
				<Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
					<SelectTrigger className="w-full" id={`${idPrefix}-currency`}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{CURRENCY_OPTIONS.map((c) => (
							<SelectItem key={c} value={c}>
								{c}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-2">
				<Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
				<Textarea
					id={`${idPrefix}-notes`}
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Any additional notes..."
					rows={3}
				/>
			</div>
		</>
	);
}

/* -------------------------------------------------------------------------- */
/*  Add Application Dialog                                                    */
/* -------------------------------------------------------------------------- */

function AddApplicationDialog({
	open,
	onOpenChange,
	columnId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	columnId: string;
}) {
	const formId = useId();
	const fetcher = useFetcher();
	const [company, setCompany] = useState("");
	const [role, setRole] = useState("");
	const [url, setUrl] = useState("");
	const [dateApplied, setDateApplied] = useState("");
	const [salaryMin, setSalaryMin] = useState("");
	const [salaryMax, setSalaryMax] = useState("");
	const [salaryCurrency, setSalaryCurrency] = useState("USD");
	const [notes, setNotes] = useState("");
	const wasSubmitting = useRef(false);

	const isSubmitting = fetcher.state !== "idle";

	// Close dialog on successful submission
	useEffect(() => {
		if (fetcher.state !== "idle") {
			wasSubmitting.current = true;
		}
		if (wasSubmitting.current && fetcher.state === "idle" && fetcher.data && !("error" in fetcher.data)) {
			wasSubmitting.current = false;
			onOpenChange(false);
			setCompany("");
			setRole("");
			setUrl("");
			setDateApplied("");
			setSalaryMin("");
			setSalaryMax("");
			setSalaryCurrency("USD");
			setNotes("");
		}
	}, [fetcher.state, fetcher.data, onOpenChange]);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!company.trim() || !role.trim()) return;

		const formData: Record<string, string> = {
			intent: "create",
			columnId,
			company: company.trim(),
			role: role.trim(),
		};
		if (url.trim()) formData.url = url.trim();
		if (dateApplied) formData.dateApplied = dateApplied;
		if (salaryMin) formData.salaryMin = salaryMin;
		if (salaryMax) formData.salaryMax = salaryMax;
		if (salaryCurrency !== "USD") formData.salaryCurrency = salaryCurrency;
		if (notes.trim()) formData.notes = notes.trim();

		fetcher.submit(formData, {
			method: "POST",
			action: "/dashboard/applications",
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add Application</DialogTitle>
					<DialogDescription>
						Track a new job application.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<ApplicationFormFields
						idPrefix={formId}
						company={company}
						setCompany={setCompany}
						role={role}
						setRole={setRole}
						url={url}
						setUrl={setUrl}
						dateApplied={dateApplied}
						setDateApplied={setDateApplied}
						salaryMin={salaryMin}
						setSalaryMin={setSalaryMin}
						salaryMax={salaryMax}
						setSalaryMax={setSalaryMax}
						salaryCurrency={salaryCurrency}
						setSalaryCurrency={setSalaryCurrency}
						notes={notes}
						setNotes={setNotes}
					/>
					{fetcher.data && "error" in fetcher.data && (
						<p className="text-sm text-red-600">
							{String(fetcher.data.error)}
						</p>
					)}
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting || !company.trim() || !role.trim()}>
							{isSubmitting ? "Saving..." : "Add Application"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/* -------------------------------------------------------------------------- */
/*  Delete Application Confirm Dialog                                         */
/* -------------------------------------------------------------------------- */

function DeleteApplicationDialog({
	open,
	onOpenChange,
	applicationId,
	company,
	role,
	onDeleted,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	applicationId: string;
	company: string;
	role: string;
	onDeleted: () => void;
}) {
	const fetcher = useFetcher();
	const wasSubmitting = useRef(false);

	const isSubmitting = fetcher.state !== "idle";

	// Close both dialogs on successful deletion
	useEffect(() => {
		if (fetcher.state !== "idle") {
			wasSubmitting.current = true;
		}
		if (wasSubmitting.current && fetcher.state === "idle" && fetcher.data && !("error" in fetcher.data)) {
			wasSubmitting.current = false;
			onOpenChange(false);
			onDeleted();
		}
	}, [fetcher.state, fetcher.data, onOpenChange, onDeleted]);

	function handleDelete() {
		fetcher.submit(
			{ intent: "delete", applicationId },
			{ method: "POST", action: "/dashboard/applications" },
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Application</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the application for &ldquo;{role}&rdquo; at &ldquo;{company}&rdquo;? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				{fetcher.data && "error" in fetcher.data && (
					<p className="text-sm text-red-600">
						{String(fetcher.data.error)}
					</p>
				)}
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/* -------------------------------------------------------------------------- */
/*  Edit Application Dialog                                                   */
/* -------------------------------------------------------------------------- */

function EditApplicationDialog({
	open,
	onOpenChange,
	application: app,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	application: Application;
}) {
	const formId = useId();
	const fetcher = useFetcher();
	const [company, setCompany] = useState(app.company);
	const [role, setRole] = useState(app.role);
	const [url, setUrl] = useState(app.url ?? "");
	const [dateApplied, setDateApplied] = useState(
		app.dateApplied ? new Date(app.dateApplied).toISOString().split("T")[0] : "",
	);
	const [salaryMin, setSalaryMin] = useState(
		app.salaryMin != null ? String(app.salaryMin) : "",
	);
	const [salaryMax, setSalaryMax] = useState(
		app.salaryMax != null ? String(app.salaryMax) : "",
	);
	const [salaryCurrency, setSalaryCurrency] = useState(app.salaryCurrency);
	const [notes, setNotes] = useState(app.notes ?? "");
	const [deleteOpen, setDeleteOpen] = useState(false);
	const wasSubmitting = useRef(false);

	const isSubmitting = fetcher.state !== "idle";

	// Reset form fields when dialog opens with different application
	useEffect(() => {
		if (open) {
			setCompany(app.company);
			setRole(app.role);
			setUrl(app.url ?? "");
			setDateApplied(
				app.dateApplied ? new Date(app.dateApplied).toISOString().split("T")[0] : "",
			);
			setSalaryMin(app.salaryMin != null ? String(app.salaryMin) : "");
			setSalaryMax(app.salaryMax != null ? String(app.salaryMax) : "");
			setSalaryCurrency(app.salaryCurrency);
			setNotes(app.notes ?? "");
		}
	}, [open, app.id]);

	// Close dialog on successful submission
	useEffect(() => {
		if (fetcher.state !== "idle") {
			wasSubmitting.current = true;
		}
		if (wasSubmitting.current && fetcher.state === "idle" && fetcher.data && !("error" in fetcher.data)) {
			wasSubmitting.current = false;
			onOpenChange(false);
		}
	}, [fetcher.state, fetcher.data, onOpenChange]);

	const handleDeleted = useRef(() => {
		onOpenChange(false);
	}).current;

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!company.trim() || !role.trim()) return;

		const formData: Record<string, string> = {
			intent: "update",
			applicationId: app.id,
			company: company.trim(),
			role: role.trim(),
			url: url.trim(),
			dateApplied,
			salaryMin,
			salaryMax,
			salaryCurrency,
			notes: notes.trim(),
		};

		fetcher.submit(formData, {
			method: "POST",
			action: "/dashboard/applications",
		});
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Application</DialogTitle>
						<DialogDescription>
							Update details for this application.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<ApplicationFormFields
							idPrefix={formId}
							company={company}
							setCompany={setCompany}
							role={role}
							setRole={setRole}
							url={url}
							setUrl={setUrl}
							dateApplied={dateApplied}
							setDateApplied={setDateApplied}
							salaryMin={salaryMin}
							setSalaryMin={setSalaryMin}
							salaryMax={salaryMax}
							setSalaryMax={setSalaryMax}
							salaryCurrency={salaryCurrency}
							setSalaryCurrency={setSalaryCurrency}
							notes={notes}
							setNotes={setNotes}
						/>
						{fetcher.data && "error" in fetcher.data && (
							<p className="text-sm text-red-600">
								{String(fetcher.data.error)}
							</p>
						)}
						<DialogFooter className="flex justify-between sm:justify-between">
							<Button
								type="button"
								variant="destructive"
								onClick={() => setDeleteOpen(true)}
							>
								Delete
							</Button>
							<Button type="submit" disabled={isSubmitting || !company.trim() || !role.trim()}>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
			<DeleteApplicationDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				applicationId={app.id}
				company={app.company}
				role={app.role}
				onDeleted={handleDeleted}
			/>
		</>
	);
}

/* -------------------------------------------------------------------------- */
/*  Application Card                                                          */
/* -------------------------------------------------------------------------- */

function ApplicationCard({
	app,
	colorHex,
	onClick,
}: {
	app: Application;
	colorHex: string;
	onClick: () => void;
}) {
	return (
		<div
			role="button"
			tabIndex={0}
			aria-label={`${app.company}, ${app.role}`}
			className="rounded-lg border bg-white dark:bg-warmgray-800 p-3 cursor-pointer hover:border-warmgray-300 dark:hover:border-warmgray-600 transition-colors"
			style={{ borderLeft: `3px solid ${colorHex}` }}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<p className="text-sm font-medium text-warmgray-900 dark:text-warmgray-100 truncate">
				{app.company}
			</p>
			<p className="text-xs text-warmgray-500 dark:text-warmgray-400 truncate">
				{app.role}
			</p>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Kanban Column                                                             */
/* -------------------------------------------------------------------------- */

function KanbanColumn({
	column,
	allColumns,
}: {
	column: Column;
	allColumns: Column[];
}) {
	const colorHex = COLUMN_COLORS[column.color] ?? "#6B7280";

	const [renameOpen, setRenameOpen] = useState(false);
	const [colorOpen, setColorOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [addAppOpen, setAddAppOpen] = useState(false);
	const [editApp, setEditApp] = useState<Application | null>(null);

	return (
		<section
			aria-label={`${column.name} column, ${column.applications.length} applications`}
			className="w-72 shrink-0 flex flex-col rounded-xl border bg-warmgray-50 dark:bg-warmgray-900 max-h-[calc(100vh-8rem)]"
		>
			{/* Header */}
			<div className="flex items-center gap-2 px-3 py-2.5 border-b border-warmgray-200 dark:border-warmgray-700">
				<span
					className="h-3 w-3 rounded-full shrink-0"
					style={{ backgroundColor: colorHex }}
				/>
				<h3 className="text-sm font-semibold text-warmgray-900 dark:text-warmgray-100 truncate">
					{column.name}
				</h3>
				<span className="text-xs text-warmgray-400">
					{column.applications.length}
				</span>
				<div className="ml-auto">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon-xs">
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => setRenameOpen(true)}>
								Rename
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setColorOpen(true)}>
								Change Color
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-red-600"
								onSelect={() => setDeleteOpen(true)}
							>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Card area */}
			<div className="flex-1 overflow-y-auto p-2 space-y-2">
				{column.applications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
						<p className="text-xs text-warmgray-400">No applications</p>
						<button
							type="button"
							className="mt-2 text-xs text-teal-700 dark:text-teal-500 hover:underline"
							onClick={() => setAddAppOpen(true)}
						>
							Add one
						</button>
					</div>
				) : (
					column.applications.map((app) => (
						<ApplicationCard
							key={app.id}
							app={app}
							colorHex={colorHex}
							onClick={() => setEditApp(app)}
						/>
					))
				)}
			</div>

			{/* Footer */}
			<div className="px-2 pb-2 border-t border-warmgray-200 dark:border-warmgray-700">
				<Button
					variant="ghost"
					size="sm"
					className="w-full justify-start text-warmgray-500 hover:text-warmgray-700 dark:text-warmgray-400 dark:hover:text-warmgray-200"
					onClick={() => setAddAppOpen(true)}
				>
					<Plus className="size-4" />
					Add
				</Button>
			</div>

			{/* Column action dialogs */}
			<RenameColumnDialog
				open={renameOpen}
				onOpenChange={setRenameOpen}
				column={column}
			/>
			<ChangeColorDialog
				open={colorOpen}
				onOpenChange={setColorOpen}
				column={column}
			/>
			<DeleteColumnDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				column={column}
				allColumns={allColumns}
			/>

			{/* Application dialogs */}
			<AddApplicationDialog
				open={addAppOpen}
				onOpenChange={setAddAppOpen}
				columnId={column.id}
			/>
			{editApp && (
				<EditApplicationDialog
					open={editApp !== null}
					onOpenChange={(open) => {
						if (!open) setEditApp(null);
					}}
					application={editApp}
				/>
			)}
		</section>
	);
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                 */
/* -------------------------------------------------------------------------- */

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { columns } = loaderData;
	const [addColumnOpen, setAddColumnOpen] = useState(false);

	return (
		<div className="flex h-full flex-col">
			{/* Board toolbar */}
			<div className="flex items-center justify-between px-6 py-4">
				<h1 className="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100">
					Board
				</h1>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setAddColumnOpen(true)}
				>
					<Plus className="size-4" />
					Add Column
				</Button>
			</div>

			{/* Kanban columns */}
			<div className="flex gap-4 px-6 pb-6 overflow-x-auto flex-1">
				{columns.map((col) => (
					<KanbanColumn
						key={col.id}
						column={col}
						allColumns={columns}
					/>
				))}
			</div>

			{/* Add Column dialog */}
			<AddColumnDialog
				open={addColumnOpen}
				onOpenChange={setAddColumnOpen}
			/>
		</div>
	);
}
