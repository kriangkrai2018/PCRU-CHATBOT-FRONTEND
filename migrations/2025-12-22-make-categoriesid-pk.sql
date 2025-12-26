-- Migration: Make CategoriesID the primary key and remove CategoriesPK
-- IMPORTANT: Run on a copy/backup first. Ensure all referencing foreign keys are handled.

-- 1) Create a backup of the table
CREATE TABLE categories_backup AS SELECT * FROM categories;

-- 2) Check for NULL/empty keys or duplicates
SELECT COUNT(*) AS null_count FROM categories WHERE CategoriesID IS NULL OR TRIM(CategoriesID) = '';
SELECT CategoriesID, COUNT(*) AS cnt FROM categories GROUP BY CategoriesID HAVING cnt > 1;

-- If duplicates or NULLs exist: fix them first (manual step)
-- e.g. to find rows you can inspect duplicates:
-- SELECT * FROM categories WHERE CategoriesID IN (SELECT CategoriesID FROM categories GROUP BY CategoriesID HAVING COUNT(*) > 1);

-- 3) If there are foreign key references to CategoriesPK, you must update those tables first.
-- Example query to find referencing FKs (run in INFORMATION_SCHEMA):
-- SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
--  WHERE REFERENCED_TABLE_NAME = 'categories' AND REFERENCED_COLUMN_NAME = 'CategoriesPK' AND TABLE_SCHEMA = DATABASE();

-- 4) Drop primary key and the CategoriesPK column (ensure no FKs reference it)
ALTER TABLE categories DROP PRIMARY KEY;
ALTER TABLE categories DROP COLUMN CategoriesPK;

-- 5) Ensure CategoriesID is NOT NULL and appropriate length/type
ALTER TABLE categories MODIFY CategoriesID VARCHAR(50) NOT NULL;

-- 6) Add primary key on CategoriesID
ALTER TABLE categories ADD PRIMARY KEY (CategoriesID);

-- 7) (Optional) Add an index on any frequently searched numeric IDs
-- CREATE INDEX idx_categories_somefield ON categories(somefield);

-- 8) Recreate / update foreign keys in other tables to reference categories(CategoriesID)
-- Example (after adjusting the FK column type in child table to match):
-- ALTER TABLE other_table DROP FOREIGN KEY fk_other_categories;
-- ALTER TABLE other_table MODIFY COLUMN CategoriesID VARCHAR(50) NOT NULL;
-- ALTER TABLE other_table ADD CONSTRAINT fk_other_categories FOREIGN KEY (CategoriesID) REFERENCES categories(CategoriesID) ON DELETE CASCADE;

-- 9) Verify data integrity
SELECT COUNT(*) FROM categories;

-- NOTE: If the DB uses MyISAM or the table engine doesn't support FKs or transactions, do this carefully with backups.
-- Always test in development/staging environment first.
