# Patch: Login loading + Battle date layout

Changes:
- Added full-screen loading overlay for login/register submissions.
- Added button loading state for login/register.
- Reworked Battle create form layout.
- Start and End dates now use equal-width fields.
- End date is no longer cramped/truncated.
- No database schema change required.

Deploy:
```bash
git add .
git commit -m "Fix login loading and battle date layout"
git push
```

Then redeploy on Vercel with Clear Build Cache.
