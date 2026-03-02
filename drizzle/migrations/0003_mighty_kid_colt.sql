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
	FOREIGN KEY (`column_id`) REFERENCES `board_column`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_application`("id", "user_id", "column_id", "company", "role", "url", "date_applied", "salary_min", "salary_max", "salary_currency", "notes", "position", "created_at", "updated_at") SELECT "id", "user_id", "column_id", "company", "role", "url", "date_applied", "salary_min", "salary_max", "salary_currency", "notes", "position", "created_at", "updated_at" FROM `application`;--> statement-breakpoint
DROP TABLE `application`;--> statement-breakpoint
ALTER TABLE `__new_application` RENAME TO `application`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `application_user_id_idx` ON `application` (`user_id`);--> statement-breakpoint
CREATE INDEX `application_column_id_idx` ON `application` (`column_id`);