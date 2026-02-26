# Supabase Migrations

This project now expects `cvs.cv_data` (JSON payload storage) and a `cv_versions` table
for version snapshots.

If you manage Supabase schema outside this repo, apply the SQL in `supabase/migrations`
manually in the SQL editor.

If you use Supabase CLI, run your normal migration workflow to apply the files in
`supabase/migrations`.
