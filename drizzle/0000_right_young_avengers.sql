CREATE TABLE `records` (
	`kind` text NOT NULL,
	`id` text NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`kind`, `id`)
);
--> statement-breakpoint
CREATE INDEX `records_kind_updated` ON `records` (`kind`,`updated_at`);--> statement-breakpoint
CREATE TABLE `revision` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`token` text DEFAULT '' NOT NULL
);
