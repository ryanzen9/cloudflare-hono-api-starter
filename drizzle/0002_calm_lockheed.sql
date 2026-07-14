CREATE TABLE `auth_table` (
	`userId` integer NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_table_username_unique` ON `auth_table` (`username`);