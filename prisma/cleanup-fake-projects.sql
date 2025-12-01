-- Cleanup Script: Remove Fake Portfolio Projects
-- Keeps only: MotoRev, Lockline Bets, Reflux Labs

-- Delete all fake/sample projects (keeps real ones by slug)
DELETE FROM ServiceProject
WHERE slug NOT IN ('motorev', 'lockline-bets', 'reflux-labs');

-- Verify remaining projects
SELECT id, title, slug, category FROM ServiceProject ORDER BY sortOrder;
