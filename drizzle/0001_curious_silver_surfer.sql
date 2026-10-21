CREATE TABLE `web_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_key` text NOT NULL,
	`request_hash` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `web_orders_request_key_unique` ON `web_orders` (`request_key`);--> statement-breakpoint
CREATE INDEX `web_orders_status_created` ON `web_orders` (`status`,`created_at`);