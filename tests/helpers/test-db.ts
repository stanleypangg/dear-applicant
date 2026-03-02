import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as authSchema from "~/db/auth-schema";
import * as appSchema from "~/db/schema";

const schema = { ...authSchema, ...appSchema };

/**
 * Final schema SQL matching the state after all migrations (0000-0003).
 * Tables are ordered by dependency (referenced tables first).
 */
const SCHEMA_SQL = `
CREATE TABLE \`user\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`name\` text NOT NULL,
  \`email\` text NOT NULL,
  \`email_verified\` integer NOT NULL,
  \`image\` text,
  \`created_at\` integer NOT NULL,
  \`updated_at\` integer NOT NULL
);
CREATE UNIQUE INDEX \`user_email_unique\` ON \`user\` (\`email\`);

CREATE TABLE \`session\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`user_id\` text NOT NULL,
  \`token\` text NOT NULL,
  \`expires_at\` integer NOT NULL,
  \`ip_address\` text,
  \`user_agent\` text,
  \`created_at\` integer NOT NULL,
  \`updated_at\` integer NOT NULL,
  FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX \`session_token_unique\` ON \`session\` (\`token\`);

CREATE TABLE \`account\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`user_id\` text NOT NULL,
  \`account_id\` text NOT NULL,
  \`provider_id\` text NOT NULL,
  \`access_token\` text,
  \`refresh_token\` text,
  \`access_token_expires_at\` integer,
  \`refresh_token_expires_at\` integer,
  \`scope\` text,
  \`id_token\` text,
  \`password\` text,
  \`created_at\` integer NOT NULL,
  \`updated_at\` integer NOT NULL,
  FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE \`verification\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`identifier\` text NOT NULL,
  \`value\` text NOT NULL,
  \`expires_at\` integer NOT NULL,
  \`created_at\` integer,
  \`updated_at\` integer
);

CREATE TABLE \`board_column\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`user_id\` text NOT NULL,
  \`name\` text NOT NULL,
  \`color\` text NOT NULL,
  \`position\` integer NOT NULL,
  \`created_at\` integer NOT NULL,
  \`updated_at\` integer NOT NULL,
  FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX \`board_column_user_id_idx\` ON \`board_column\` (\`user_id\`);

CREATE TABLE \`application\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`user_id\` text NOT NULL,
  \`column_id\` text NOT NULL,
  \`company\` text NOT NULL,
  \`role\` text NOT NULL,
  \`url\` text,
  \`date_applied\` integer,
  \`salary_min\` integer,
  \`salary_max\` integer,
  \`salary_currency\` text DEFAULT 'USD' NOT NULL,
  \`notes\` text,
  \`position\` integer NOT NULL,
  \`created_at\` integer NOT NULL,
  \`updated_at\` integer NOT NULL,
  FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (\`column_id\`) REFERENCES \`board_column\`(\`id\`) ON UPDATE no action ON DELETE restrict
);
CREATE INDEX \`application_user_id_idx\` ON \`application\` (\`user_id\`);
CREATE INDEX \`application_column_id_idx\` ON \`application\` (\`column_id\`);

CREATE TABLE \`contact\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`application_id\` text NOT NULL,
  \`name\` text NOT NULL,
  \`role\` text,
  \`email\` text,
  \`phone\` text,
  \`notes\` text,
  \`created_at\` integer NOT NULL,
  FOREIGN KEY (\`application_id\`) REFERENCES \`application\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX \`contact_application_id_idx\` ON \`contact\` (\`application_id\`);

CREATE TABLE \`column_transition\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`application_id\` text NOT NULL,
  \`from_column_id\` text,
  \`to_column_id\` text NOT NULL,
  \`transitioned_at\` integer NOT NULL,
  FOREIGN KEY (\`application_id\`) REFERENCES \`application\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (\`from_column_id\`) REFERENCES \`board_column\`(\`id\`) ON UPDATE no action ON DELETE set null,
  FOREIGN KEY (\`to_column_id\`) REFERENCES \`board_column\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX \`column_transition_application_id_idx\` ON \`column_transition\` (\`application_id\`);
CREATE INDEX \`column_transition_from_column_id_idx\` ON \`column_transition\` (\`from_column_id\`);
CREATE INDEX \`column_transition_to_column_id_idx\` ON \`column_transition\` (\`to_column_id\`);
`;

export type TestDatabase = ReturnType<typeof createTestDb>;

export function createTestDb() {
	const sqlite = new Database(":memory:");
	sqlite.pragma("foreign_keys = ON");
	sqlite.exec(SCHEMA_SQL);

	const d = drizzle(sqlite, { schema });

	// Shim batch() to match D1 adapter's API.
	// Executes queries sequentially (D1 batch is also sequential, not atomic).
	const dbWithBatch = d as typeof d & {
		batch: (queries: any[]) => Promise<any[]>;
	};
	(dbWithBatch as any).batch = async (queries: any[]) => {
		const results = [];
		for (const query of queries) {
			results.push(await query);
		}
		return results;
	};

	return dbWithBatch;
}
