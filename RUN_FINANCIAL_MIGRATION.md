# Run Financial Fields Migration

This migration adds financial tracking fields to the Job model: `estimate`, `billedAmount`, and `paidAmount`.

## Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration SQL**
   - Copy and paste the following SQL into the SQL Editor:

```sql
-- AlterTable: Add financial tracking fields to Job
ALTER TABLE "Job" ADD COLUMN "estimate" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN "billedAmount" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN "paidAmount" DOUBLE PRECISION;
```

3. **Execute the Query**
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
   - You should see: "Success. No rows returned" - this is correct!

4. **Verify the Migration**
   - Go to Table Editor → Job table
   - You should see three new columns: `estimate`, `billedAmount`, and `paidAmount`
   - All three columns should be nullable (allow NULL values)

## What This Enables

After running this migration, admins will be able to:
- Track project estimates for each job
- Record billed amounts
- Track paid amounts
- View financial summaries in the Admin Dashboard
- Calculate outstanding balances (billed - paid)

## Next Steps

Once the migration is complete:
1. Visit `/admin` to access the Admin Dashboard
2. Navigate to the "Financials" tab to start tracking project finances
3. Click "Edit" on any job to update its financial information
