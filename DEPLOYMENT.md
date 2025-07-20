# Deployment Guide: Vercel + Supabase

This guide will walk you through deploying your StartupScout app to Vercel while maintaining the Supabase connection.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Ensure your Supabase project is set up and running
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Prepare Your Supabase Project

### 1.1 Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 1.2 Configure Supabase Auth Settings

1. In your Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your Vercel domain to the **Site URL**:
   - For production: `https://your-app.vercel.app`
   - For preview deployments: `https://your-app-git-branch.vercel.app`
3. Add redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/dashboard`
   - `https://your-app.vercel.app/`

## Step 2: Deploy to Vercel

### 2.1 Connect Your Repository

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project

### 2.2 Configure Environment Variables

In the Vercel deployment settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace `your-project` and `your_anon_key_here` with your actual values.

### 2.3 Deploy Settings

- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 2.4 Deploy

Click **"Deploy"** and wait for the build to complete.

## Step 3: Post-Deployment Configuration

### 3.1 Update Supabase Auth URLs

After your first deployment, update your Supabase auth settings with the actual Vercel URL:

1. Go to **Authentication** → **URL Configuration**
2. Update **Site URL** to your actual Vercel domain
3. Add your actual callback URL: `https://your-app.vercel.app/auth/callback`

### 3.2 Test Authentication

1. Visit your deployed app
2. Try to sign in/sign up
3. Verify the auth callback works correctly

## Step 4: Environment Variables Management

### 4.1 Local Development

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4.2 Production Environment Variables

In Vercel dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add the same variables as above

### 4.3 Preview Deployments

For preview deployments (PRs), you can:
- Use the same environment variables
- Or create separate Supabase projects for testing

## Step 5: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update Supabase auth settings with the new domain
4. Configure DNS records as instructed by Vercel

## Troubleshooting

### Common Issues

1. **Authentication not working**:
   - Check that Supabase auth URLs are correctly configured
   - Verify environment variables are set in Vercel
   - Check browser console for errors

2. **Build failures**:
   - Ensure all dependencies are in `package.json`
   - Check that TypeScript types are correct
   - Verify environment variables are accessible

3. **Database connection issues**:
   - Verify Supabase project is active
   - Check that RLS (Row Level Security) policies are configured
   - Ensure database is accessible from Vercel's servers

### Debugging

1. **Check Vercel logs**: Go to your deployment → **Functions** tab
2. **Check Supabase logs**: Go to your Supabase dashboard → **Logs**
3. **Browser console**: Check for client-side errors

## Security Best Practices

1. **Never commit environment variables** to your repository
2. **Use environment variables** for all sensitive configuration
3. **Enable Row Level Security** in Supabase
4. **Regularly rotate** your Supabase keys
5. **Monitor** your Supabase usage and costs

## Next Steps

After successful deployment:

1. Set up monitoring and analytics
2. Configure error tracking (e.g., Sentry)
3. Set up CI/CD for automated deployments
4. Consider setting up staging environments

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs) 