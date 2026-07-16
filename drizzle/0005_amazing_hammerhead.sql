CREATE TABLE `oauth_accounts_table` (
	`userId` integer NOT NULL,
	`provider` text NOT NULL,
	`providerSubject` text NOT NULL,
	`providerLogin` text NOT NULL,
	`providerEmail` text,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_table` (
	`name` text NOT NULL,
	`age` integer,
	`email` text NOT NULL,
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