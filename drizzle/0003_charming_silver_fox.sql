ALTER TABLE `invoices` MODIFY COLUMN `paymentStatus` enum('unpaid','pending','paid','failed','refunded') NOT NULL DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `adminReply` text;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `repliedBy` int;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `repliedAt` timestamp;--> statement-breakpoint
ALTER TABLE `invoices` ADD `invoiceNumber` varchar(48) NULL;--> statement-breakpoint
UPDATE `invoices` SET `invoiceNumber` = CONCAT('INV-LEGACY-', `id`) WHERE `invoiceNumber` IS NULL;--> statement-breakpoint
ALTER TABLE `invoices` MODIFY COLUMN `invoiceNumber` varchar(48) NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`);