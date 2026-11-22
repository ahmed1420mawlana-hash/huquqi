-- Runs before `prisma db push` on deploy (see the vercel-build script).
-- `db push` refuses to add a unique constraint to an existing table without --accept-data-loss,
-- even for a new, empty column. Adding the column and its unique index here first lets the push
-- go through without that flag. Existing users keep their data and simply have no email (NULL);
-- PostgreSQL allows any number of NULLs in a unique column. Safe to run more than once, and a
-- no-op on an empty database (db push then creates everything).
DO $$
BEGIN
  IF to_regclass('"User"') IS NOT NULL THEN
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  END IF;
END $$;
