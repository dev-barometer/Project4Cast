-- Set barclay@barometergroup.com as OWNER (if user exists)
-- NOTE: This must be run AFTER the enum value has been committed
UPDATE "User" 
SET "role" = 'OWNER' 
WHERE "email" = 'barclay@barometergroup.com';