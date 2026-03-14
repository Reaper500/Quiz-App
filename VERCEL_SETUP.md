# Vercel Deployment Setup

## Required Environment Variables

To deploy this application to Vercel, you need to configure the following environment variables in your Vercel project settings:

### 1. Clerk Authentication Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YWN0aXZlLXJvZGVudC01Ni5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_eMj3GEer8YsMeGDX71UP7kheuINDZyc4Cxf30K4Hgk
```

**Note:** Replace with your actual Clerk keys from your Clerk dashboard.

### 2. Convex Database Variable

Add your Convex deployment URL:

```
NEXT_PUBLIC_CONVEX_URL=https://friendly-frog-18.convex.cloud
```

**Note:** Replace with your actual Convex deployment URL.

## How to Add Environment Variables in Vercel

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter the variable name and value
6. Select the environments where it should be available (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** your application for the changes to take effect

## Important Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- `CLERK_SECRET_KEY` should NOT be prefixed with `NEXT_PUBLIC_` (it's server-only)
- After adding environment variables, you must trigger a new deployment

## Verification

After setting up the environment variables and redeploying, check:
- The build completes successfully
- Authentication works (Clerk sign-in/sign-up)
- Database operations work (Convex queries/mutations)
