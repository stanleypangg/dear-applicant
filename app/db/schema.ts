import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

// Kanban columns — user-customizable
export const boardColumn = sqliteTable("board_column", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	color: text("color").notNull(),
	position: integer("position").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
	index("board_column_user_id_idx").on(table.userId),
]);

// Core job tracking record
export const application = sqliteTable("application", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	columnId: text("column_id")
		.notNull()
		.references(() => boardColumn.id),
	company: text("company").notNull(),
	role: text("role").notNull(),
	url: text("url"),
	dateApplied: integer("date_applied", { mode: "timestamp" }),
	salaryMin: integer("salary_min"),
	salaryMax: integer("salary_max"),
	salaryCurrency: text("salary_currency").notNull().default("USD"),
	notes: text("notes"),
	position: integer("position").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
	index("application_user_id_idx").on(table.userId),
	index("application_column_id_idx").on(table.columnId),
]);

// People tied to an application
export const contact = sqliteTable("contact", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	applicationId: text("application_id")
		.notNull()
		.references(() => application.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	role: text("role"),
	email: text("email"),
	phone: text("phone"),
	notes: text("notes"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
	index("contact_application_id_idx").on(table.applicationId),
]);

// Column change history for Sankey chart
export const columnTransition = sqliteTable("column_transition", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	applicationId: text("application_id")
		.notNull()
		.references(() => application.id, { onDelete: "cascade" }),
	fromColumnId: text("from_column_id").references(() => boardColumn.id, { onDelete: "set null" }),
	toColumnId: text("to_column_id")
		.notNull()
		.references(() => boardColumn.id, { onDelete: "cascade" }),
	transitionedAt: integer("transitioned_at", { mode: "timestamp" }).notNull(),
}, (table) => [
	index("column_transition_application_id_idx").on(table.applicationId),
	index("column_transition_from_column_id_idx").on(table.fromColumnId),
	index("column_transition_to_column_id_idx").on(table.toColumnId),
]);

// Relations

export const boardColumnRelations = relations(boardColumn, ({ one, many }) => ({
	user: one(user, { fields: [boardColumn.userId], references: [user.id] }),
	applications: many(application),
	transitionsFrom: many(columnTransition, { relationName: "fromColumn" }),
	transitionsTo: many(columnTransition, { relationName: "toColumn" }),
}));

export const applicationRelations = relations(
	application,
	({ one, many }) => ({
		user: one(user, {
			fields: [application.userId],
			references: [user.id],
		}),
		column: one(boardColumn, {
			fields: [application.columnId],
			references: [boardColumn.id],
		}),
		contacts: many(contact),
		transitions: many(columnTransition),
	}),
);

export const contactRelations = relations(contact, ({ one }) => ({
	application: one(application, {
		fields: [contact.applicationId],
		references: [application.id],
	}),
}));

export const columnTransitionRelations = relations(
	columnTransition,
	({ one }) => ({
		application: one(application, {
			fields: [columnTransition.applicationId],
			references: [application.id],
		}),
		fromColumn: one(boardColumn, {
			fields: [columnTransition.fromColumnId],
			references: [boardColumn.id],
			relationName: "fromColumn",
		}),
		toColumn: one(boardColumn, {
			fields: [columnTransition.toColumnId],
			references: [boardColumn.id],
			relationName: "toColumn",
		}),
	}),
);
