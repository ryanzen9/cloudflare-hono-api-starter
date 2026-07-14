PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_auth_table` (
	`userId` integer NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_auth_table`("userId", "username", "password", "id", "createdAt", "updatedAt") SELECT "userId", "username", "password", "id", "createdAt", "updatedAt" FROM `auth_table`;--> statement-breakpoint
DROP TABLE `auth_table`;--> statement-breakpoint
ALTER TABLE `__new_auth_table` RENAME TO `auth_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `auth_table_username_unique` ON `auth_table` (`username`);--> statement-breakpoint
CREATE TABLE `__new_todos_table` (
	`title` text NOT NULL,
	`completed` integer NOT NULL,
	`userId` integer NOT NULL,
	`description` text,
	`scheduleAt` text,
	`completedAt` text,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_todos_table`("title", "completed", "userId", "description", "scheduleAt", "completedAt", "id", "createdAt", "updatedAt") SELECT "title", "completed", "userId", "description", "scheduleAt", "completedAt", "id", "createdAt", "updatedAt" FROM `todos_table`;--> statement-breakpoint
DROP TABLE `todos_table`;--> statement-breakpoint
ALTER TABLE `__new_todos_table` RENAME TO `todos_table`;