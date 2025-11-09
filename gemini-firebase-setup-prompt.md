# Firebase Setup Instructions Request

## Project Overview

I'm building a Next.js 16 e-commerce application with the following structure:

- **Framework**: Next.js 16 with App Router (React 19)
- **Authentication**: Firebase Authentication (Google Sign-In)
- **Project ID**: `ecommerce-2f366` (already configured in Firebase)
- **Purpose**: 
  - Public e-commerce homepage for browsing lingerie products
  - Protected admin dashboard at `/admin/overview` accessible only to `arbengrepi@gmail.com`

## Current Firebase Configuration

I have a Firebase project already set up with:
- Project ID: `ecommerce-2f366`
- Firebase Hosting configured (firebase.json exists)
- Region: `europe-west1`

## What I Need Help With

I need step-by-step instructions to:

1. **Enable Google Authentication** in Firebase Console
   - How to enable Google as a sign-in provider
   - What settings to configure
   - Any OAuth consent screen setup needed

2. **Get Firebase Configuration Values** for my Next.js app
   - Where to find each configuration value in Firebase Console
   - Which values I need to add to my `.env.local` file
   - How to verify the configuration is correct

3. **Set Up Authentication Rules** (if needed)
   - Any Firebase Security Rules required
   - Any additional Firebase Console settings

## Current Code Structure

My Firebase initialization code (`lib/firebase.js`) expects these environment variables:
```javascript
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID (already know: ecommerce-2f366)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

My authentication code (`lib/auth.js`) uses:
- `signInWithPopup` with GoogleAuthProvider
- Checks if user email is `arbengrepi@gmail.com` for admin access
- Redirects admin users to `/admin/overview`

## Specific Questions

1. **Where exactly in Firebase Console** do I find each configuration value?
   - Project Settings → General → Your apps section?
   - Or somewhere else?

2. **For Google Authentication setup**:
   - Do I need to configure OAuth consent screen in Google Cloud Console?
   - What are the exact steps in Firebase Console → Authentication → Sign-in method?
   - Any domain restrictions or authorized domains I need to set?

3. **For local development**:
   - Should I add `localhost` to authorized domains?
   - Any CORS or domain configuration needed?

4. **Security considerations**:
   - Are there any Firebase Security Rules I should set up?
   - Any best practices for protecting the admin route?

5. **Testing**:
   - How can I verify the setup is working correctly?
   - Any common issues to watch out for?

## Expected Outcome

After following your instructions, I should be able to:
- Sign in with Google on my Next.js app
- Have `arbengrepi@gmail.com` automatically redirected to admin dashboard
- Have other users stay on the e-commerce homepage
- Access the protected admin route only when authenticated as admin

Please provide:
1. **Step-by-step instructions** with exact navigation paths in Firebase Console
2. **Screenshots or detailed descriptions** of where to find each configuration value
3. **Complete `.env.local` example** with placeholder values showing the format
4. **Verification steps** to confirm everything is set up correctly
5. **Troubleshooting tips** for common issues

Thank you!

