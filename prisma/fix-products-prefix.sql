-- Fix URLs to include /products/ prefix
-- Files are stored in products/ folder but URLs don't have the prefix

-- Update ServiceProject thumbnailUrl
UPDATE ServiceProject
SET thumbnailUrl = REPLACE(thumbnailUrl, 'https://files.47industries.com/', 'https://files.47industries.com/products/')
WHERE thumbnailUrl LIKE 'https://files.47industries.com/%'
AND thumbnailUrl NOT LIKE 'https://files.47industries.com/products/%';

-- Update ServiceProject clientLogo
UPDATE ServiceProject
SET clientLogo = REPLACE(clientLogo, 'https://files.47industries.com/', 'https://files.47industries.com/products/')
WHERE clientLogo LIKE 'https://files.47industries.com/%'
AND clientLogo NOT LIKE 'https://files.47industries.com/products/%';

-- Update ServiceProject images (JSON field)
UPDATE ServiceProject
SET images = REPLACE(images, 'https://files.47industries.com/', 'https://files.47industries.com/products/')
WHERE images LIKE '%files.47industries.com/%'
AND images NOT LIKE '%files.47industries.com/products/%';

-- Update Product images (JSON field)
UPDATE Product
SET images = REPLACE(images, 'https://files.47industries.com/', 'https://files.47industries.com/products/')
WHERE images LIKE '%files.47industries.com/%'
AND images NOT LIKE '%files.47industries.com/products/%';
