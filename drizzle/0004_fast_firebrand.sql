CREATE TABLE `todo_attachments_table` (
	`todoId` integer NOT NULL,
	`fileKey` text NOT NULL,
	`fileHash` text NOT NULL,
	`fileName` text NOT NULL,
	`filePath` text NOT NULL,
	`fileSize` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`todoId`) REFERENCES `todos_table`(`id`) ON UPDATE cascade ON DELETE cascade
);
