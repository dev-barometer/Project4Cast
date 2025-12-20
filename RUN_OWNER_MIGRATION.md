# Run Owner Role Migration

This migration adds the `OWNER` role to the UserRole enum and sets `barclay@barometergroup.com` as the owner.

## Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the First Migration SQL** (Add OWNER to enum)
   - Copy and paste the following SQL into the SQL Editor:

```sql
-- AlterEnum: Add OWNER to UserRole enum
ALTER TYPE "UserRole" ADD VALUE 'OWNER';
```

3. **Execute the First Query**
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
   - You should see: "Success. No rows returned" - this is correct!
   - **IMPORTANT**: Wait for this query to complete before proceeding

4. **Run the Second Migration SQL** (Set owner)
   - Copy and paste the following SQL into the SQL Editor:

```sql
-- Set barclay@barometergroup.com as OWNER (if user exists)
UPDATE "User" 
SET "role" = 'OWNER' 
WHERE "email" = 'barclay@barometergroup.com';
```

5. **Execute the Second Query**
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
   - You should see: "Success. No rows returned" or a message indicating how many rows were updated

6. **Verify the Migration**
   - Go to Table Editor → User table
   - Find the user with email `barclay@barometergroup.com`
   - Verify that their `role` column shows `OWNER`

## What This Enables

After running this migration:
- **Owner Role**: Only one owner can exist at any time
- **Owner Privileges**: The owner has full access to all admin features
- **Admin Management**: 
  - Owners can assign admin privileges to any user
  - Owners can remove admin privileges from any admin
  - Admins can assign admin privileges to other users
  - Only owners can remove admin privileges
- **Profile Page**: Owners and admins will see an "Admin" tab on their profile page to manage admin privileges

## Next Steps

Once the migration is complete:
1. Visit `/profile` - you should see an "Admin" tab (if you're the owner)
2. Use the Admin tab to assign admin privileges to `chris@ideate3.com` or any other user
3. Admins will also see the Admin tab and can assign privileges, but cannot remove them

## Important Notes

- **Only one owner**: The system is designed for a single owner. The owner role should only be assigned via migration.
- **Owner protection**: The owner role cannot be changed through the UI - only through database migrations.
- **Admin removal**: Only the owner can remove admin privileges. Admins cannot remove other admins or themselves.
