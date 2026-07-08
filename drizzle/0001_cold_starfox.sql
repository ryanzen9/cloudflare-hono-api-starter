CREATE TABLE `todos_table` (
	`title` text NOT NULL,
	`description` text,
	`scheduleAt` text,
	`completed` integer NOT NULL,
	`completedAt` text,
	`userId` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- 移除 user 表中的行，保证 createdAt 和 updatedAt 字段不为空
DELETE FROM `users_table`;

ALTER TABLE `users_table` ADD `createdAt` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` ADD `updatedAt` text NOT NULL;
