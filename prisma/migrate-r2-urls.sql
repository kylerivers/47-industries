-- Migrate R2 URLs from public dev URL to custom domain
-- Old: https://pub-c892cc953a584679a819af5d326f6dca.r2.dev
-- New: https://files.47industries.com

-- Update ServiceProject thumbnailUrl
UPDATE ServiceProject
SET thumbnailUrl = REPLACE(thumbnailUrl, 'https://pub-c892cc953a584679a819af5d326f6dca.r2.dev', 'https://files.47industries.com')
WHERE thumbnailUrl LIKE '%pub-c892cc953a584679a819af5d326f6dca.r2.dev%';

-- Update ServiceProject clientLogo
UPDATE ServiceProject
SET clientLogo = REPLACE(clientLogo, 'https://pub-c892cc953a584679a819af5d326f6dca.r2.dev', 'https://files.47industries.com')
WHERE clientLogo LIKE '%pub-c892cc953a584679a819af5d326f6dca.r2.dev%';

-- Update ServiceProject images (JSON field)
UPDATE ServiceProject
SET images = REPLACE(images, 'https://pub-c892cc953a584679a819af5d326f6dca.r2.dev', 'https://files.47industries.com')
WHERE images LIKE '%pub-c892cc953a584679a819af5d326f6dca.r2.dev%';

-- Update Product images (JSON field)
UPDATE Product
SET images = REPLACE(images, 'https://pub-c892cc953a584679a819af5d326f6dca.r2.dev', 'https://files.47industries.com')
WHERE images LIKE '%pub-c892cc953a584679a819af5d326f6dca.r2.dev%';

-- MediaFile table may not exist, skip if needed
