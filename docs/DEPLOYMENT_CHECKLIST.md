# Deployment Checklist

## Pre-Deployment ✅

- [ ] Code is committed to GitHub repository
- [ ] All dependencies are in `package.json`
- [ ] Environment variables are documented (not committed)
- [ ] Supabase project is active and accessible
- [ ] Authentication is working locally

## Vercel Setup ✅

- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Set environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy project

## Supabase Configuration ✅

- [ ] Update Site URL in Supabase Auth settings
- [ ] Add redirect URLs:
  - `https://your-app.vercel.app/auth/callback`
  - `https://your-app.vercel.app/dashboard`
  - `https://your-app.vercel.app/`
- [ ] Test authentication flow

## Post-Deployment Testing ✅

- [ ] Visit deployed app
- [ ] Test sign up/sign in
- [ ] Test protected routes
- [ ] Test database operations
- [ ] Check for console errors
- [ ] Verify all features work

## Environment Variables Reference

```bash
# Local (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Vercel (Dashboard → Settings → Environment Variables)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Quick Commands

```bash
# Test build locally
npm run build

# Test production locally
npm run start

# Deploy to Vercel (if using Vercel CLI)
vercel --prod
``` 