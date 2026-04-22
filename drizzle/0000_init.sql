CREATE TABLE `outputs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`model_id` text NOT NULL,
	`status` text NOT NULL,
	`url` text,
	`width` integer,
	`height` integer,
	`seed` integer,
	`latency_ms` integer,
	`error` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`media_type` text DEFAULT 'image' NOT NULL,
	`prompt` text NOT NULL,
	`seed` integer,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`winner_output_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`winner_output_id`) REFERENCES `outputs`(`id`) ON UPDATE no action ON DELETE cascade
);
