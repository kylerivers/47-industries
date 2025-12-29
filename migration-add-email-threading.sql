-- Migration: Add email threading metadata to InquiryMessage
-- Run this SQL against your production database

-- Add new columns to InquiryMessage table
ALTER TABLE `InquiryMessage`
  ADD COLUMN `senderEmail` VARCHAR(191) NULL AFTER `senderName`,
  ADD COLUMN `emailMessageId` VARCHAR(191) NULL AFTER `senderEmail`,
  ADD COLUMN `emailInReplyTo` VARCHAR(191) NULL AFTER `emailMessageId`,
  ADD COLUMN `emailSubject` VARCHAR(191) NULL AFTER `emailInReplyTo`;

-- Add unique index on emailMessageId for faster lookups
ALTER TABLE `InquiryMessage`
  ADD UNIQUE INDEX `InquiryMessage_emailMessageId_key` (`emailMessageId`);

-- Add index on inquiryId if it doesn't exist (should already exist from previous migrations)
-- ALTER TABLE `InquiryMessage`
--   ADD INDEX `InquiryMessage_inquiryId_idx` (`inquiryId`);

-- Verify the changes
DESCRIBE `InquiryMessage`;
