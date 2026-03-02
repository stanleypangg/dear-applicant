CREATE TABLE `job_listing` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`source_id` text NOT NULL,
	`company` text NOT NULL,
	`title` text NOT NULL,
	`locations` text NOT NULL,
	`url` text NOT NULL,
	`category` text,
	`sponsorship` text,
	`active` integer DEFAULT true NOT NULL,
	`date_posted` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_listing_source_source_id_uniq` ON `job_listing` (`source`,`source_id`);--> statement-breakpoint
CREATE INDEX `job_listing_company_idx` ON `job_listing` (`company`);--> statement-breakpoint
CREATE INDEX `job_listing_active_idx` ON `job_listing` (`active`);