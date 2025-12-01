-- Fix Reflux Labs: add Screenshot 15 as thumbnail
UPDATE ServiceProject
SET thumbnailUrl = 'https://files.47industries.com/projects/1764606393805-bf2xrtldwwo-Screenshot_15.png'
WHERE slug = 'reflux-labs';

-- Fix Smoke Shop demo: add Screenshot 17 as thumbnail
UPDATE ServiceProject
SET thumbnailUrl = 'https://files.47industries.com/projects/1764606737268-gjgq4bqj9a9-Screenshot_17.png'
WHERE slug = 'smoke-shop-demo';

-- Fix Lockline Bets: Screenshot 20 as thumbnail, Screenshots 21-24 as gallery
UPDATE ServiceProject
SET
  thumbnailUrl = 'https://files.47industries.com/projects/1764607648212-voxr5zf5arb-Screenshot_20.png',
  images = '["https://files.47industries.com/projects/1764607656780-cwbav2do58r-Screenshot_21.png","https://files.47industries.com/projects/1764607657081-nijxusatte-Screenshot_22.png","https://files.47industries.com/projects/1764607657380-6a554e573tf-Screenshot_23.png","https://files.47industries.com/projects/1764607657677-wt9ecyll4bb-Screenshot_24.png"]'
WHERE slug = 'lockline-bets';
