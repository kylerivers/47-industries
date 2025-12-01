-- Fix MotoRev: move thumbnail to clientLogo, use 5th gallery image as thumbnail
UPDATE ServiceProject
SET
  clientLogo = 'https://files.47industries.com/projects/1764598429854-cvlxeqapuqb-moto_17.png',
  thumbnailUrl = 'https://files.47industries.com/projects/1764598595234-yvpp1o3omtf-Screenshot_2025-12-01_at_9.15.45_AM.png',
  images = '["https://files.47industries.com/projects/1764598631106-4f6xn6laykr-motorev-garage.png","https://files.47industries.com/projects/1764598631535-i7jsprhrhd-motorev-profile.png","https://files.47industries.com/projects/1764598632332-vkv2a7mr2f-motorev-social.png","https://files.47industries.com/projects/1764598632738-8enyvvrsl28-motorev-navigate.png"]'
WHERE slug = 'motorev';

-- Fix Reflux Labs: move thumbnail to clientLogo, clear thumbnail
UPDATE ServiceProject
SET
  clientLogo = 'https://files.47industries.com/projects/1764606459630-pedpoblbrro-refluxlabs.png',
  thumbnailUrl = NULL
WHERE slug = 'reflux-labs';
