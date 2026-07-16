PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_table` (
	`name` text NOT NULL,
	`age` integer,
	`email` text,
	`avatarUrl` text,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users_table`("name", "age", "email", "avatarUrl", "id", "createdAt", "updatedAt") SELECT "name", "age", "email", "avatarUrl", "id", "createdAt", "updatedAt" FROM `users_table`;--> statement-breakpoint
DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `__new_users_table` RENAME TO `users_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);