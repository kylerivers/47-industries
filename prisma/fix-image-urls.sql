-- Fix image URLs to use R2 public URL
UPDATE ServiceProject
SET
  thumbnailUrl = REPLACE(thumbnailUrl, 'https://files.47industries.com/', 'https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/'),
  images = REPLACE(images, 'https://files.47industries.com/', 'https://pub-c892cc953a584679a819af5d326f6dca.r2.dev/')
WHERE thumbnailUrl LIKE '%files.47industries.com%' OR images LIKE '%files.47industries.com%';
