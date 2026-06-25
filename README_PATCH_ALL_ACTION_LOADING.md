# Patch: all important actions show loading feedback

This patch adds consistent loading feedback so users know the app is working instead of hanging.

## Added

- Global loading overlay for route/link navigation
- Full-screen loading overlay for login/register
- Full-screen loading overlay for create/join battle
- Full-screen loading overlay for add/edit/archive habit
- Full-screen loading overlay for add/delete reward
- Full-screen loading overlay for logout
- Delayed loading overlay for slow habit check-in AJAX saves
- Existing button/cell spinners remain for fast feedback

## New files

- `components/GlobalLoadingProvider.tsx`
- `components/LoadingSubmitButton.tsx`

## Changed files

- `app/layout.tsx`
- `app/page.tsx`
- `components/AuthForm.tsx`
- `components/BattleForms.tsx`
- `components/HabitFeed.tsx`
- `components/HabitForm.tsx`
- `app/rewards/manage/page.tsx`
- `app/habits/[id]/edit/page.tsx`
- `app/globals.css`

No database change is required.
