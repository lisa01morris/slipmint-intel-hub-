# Deployment Checklist

## Supabase Setup
- [ ] Navigate to Supabase SQL Editor
- [ ] Create a new query
- [ ] Copy and run the contents of `supabase/market_reports.sql`
- [ ] Verify the `market_reports` table was created
- [ ] Confirm Row Level Security (RLS) is enabled
- [ ] Test the public select policy works

## Vercel Environment Variables
- [ ] Log into Vercel and navigate to your project settings
- [ ] Go to Settings > Environment Variables
- [ ] Add the following variables from your `.env` file:
  - `NEXT_PUBLIC_SUPABASE_URL` (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
  - `GEMINI_API_KEY` (secret)
  - `SUPABASE_SERVICE_ROLE_KEY` (secret)
- [ ] Redeploy the project to apply the variables

## GitHub Actions Secrets
- [ ] Go to your GitHub repository Settings
- [ ] Navigate to Secrets and variables > Actions
- [ ] Add the following secrets:
  - `GEMINI_API_KEY`: Your Gemini API key
  - `SUPABASE_URL`: Your Supabase project URL
  - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- [ ] Verify the workflow `.github/workflows/generate-intelligence.yml` has access to these secrets

## Whop USD Redirect Link Setup
- [ ] Obtain your Whop USD redirect link from the Whop dashboard
- [ ] Store it securely (do not commit to repository)
- [ ] Update any marketing materials or frontend links that reference it
- [ ] Test the redirect works correctly

## Testing
- [ ] Run `npm install` in the `next_app` directory
- [ ] Run `npm run dev` to start the local development server
- [ ] Navigate to `http://localhost:3000/intelligence` and verify the dashboard loads
- [ ] Manually run the GitHub Actions workflow via "Run workflow" to test report generation
- [ ] Verify a new report appears in the dashboard

## Final Checks
- [ ] All environment variables are set correctly
- [ ] Supabase RLS policies are enforced
- [ ] GitHub Actions workflow executes without errors
- [ ] Production deployment is green
- [ ] Monitor logs for any runtime errors