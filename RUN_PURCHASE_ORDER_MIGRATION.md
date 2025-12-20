# Purchase Order Migration Guide

## Step 1: Run the SQL Migration in Supabase

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the following SQL:

```sql
-- Add purchaseOrder field to Job table
ALTER TABLE "Job" ADD COLUMN "purchaseOrder" TEXT;
```

4. Click "Run" to execute the migration

## Step 2: Generate Prisma Client

After running the SQL migration, generate the Prisma client:

```bash
npx prisma generate
```

That's it! The purchaseOrder field is now available in your Job model.
