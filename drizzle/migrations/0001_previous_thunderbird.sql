PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_application` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`column_id` text NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`url` text,
	`date_applied` integer,
	`salary_min` integer,
	`salary_max` integer,
	`salary_currency` text DEFAULT 'USD' NOT NULL,
	`notes` text,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`column_id`) REFERENCES `board_column`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_application`("id", "user_id", "column_id", "company", "role", "url", "date_applied", "salary_min", "salary_max", "salary_currency", "notes", "position", "created_at", "updated_at") SELECT "id", "user_id", "column_id", "company", "role", "url", "date_applied", "salary_min", "salary_max", "salary_currency", "notes", "position", "created_at", "updated_at" FROM `application`;--> statement-breakpoint
DROP TABLE `application`;--> statement-breakpoint
ALTER TABLE `__new_application` RENAME TO `application`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `application_user_id_idx` ON `application` (`user_id`);--> statement-breakpoint
CREATE INDEX `application_column_id_idx` ON `application` (`column_id`);--> statement-breakpoint
CREATE TABLE `__new_board_column` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_board_column`("id", "user_id", "name", "color", "position", "created_at", "updated_at") SELECT "id", "user_id", "name", "color", "position", "created_at", "updated_at" FROM `board_column`;--> statement-breakpoint
DROP TABLE `board_column`;--> statement-breakpoint
ALTER TABLE `__new_board_column` RENAME TO `board_column`;--> statement-breakpoint
CREATE INDEX `board_column_user_id_idx` ON `board_column` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_column_transition` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`from_column_id` text,
	`to_column_id` text NOT NULL,
	`transitioned_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_column_id`) REFERENCES `board_column`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`to_column_id`) REFERENCES `board_column`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_column_transition`("id", "application_id", "from_column_id", "to_column_id", "transitioned_at") SELECT "id", "application_id", "from_column_id", "to_column_id", "transitioned_at" FROM `column_transition`;--> statement-breakpoint
DROP TABLE `column_transition`;--> statement-breakpoint
ALTER TABLE `__new_column_transition` RENAME TO `column_transition`;--> statement-breakpoint
CREATE INDEX `column_transition_application_id_idx` ON `column_transition` (`application_id`);--> statement-breakpoint
CREATE INDEX `column_transition_from_column_id_idx` ON `column_transition` (`from_column_id`);--> statement-breakpoint
CREATE INDEX `column_transition_to_column_id_idx` ON `column_transition` (`to_column_id`);--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "user_id", "account_id", "provider_id", "access_token", "refresh_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "id_token", "password", "created_at", "updated_at") SELECT "id", "user_id", "account_id", "provider_id", "access_token", "refresh_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "id_token", "password", "created_at", "updated_at" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "user_id", "token", "expires_at", "ip_address", "user_agent", "created_at", "updated_at") SELECT "id", "user_id", "token", "expires_at", "ip_address", "user_agent", "created_at", "updated_at" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `contact_application_id_idx` ON `contact` (`application_id`);