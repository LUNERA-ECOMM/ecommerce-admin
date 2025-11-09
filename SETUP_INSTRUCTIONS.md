# Firebase Setup Instructions

## Step 1: Create `.env.local` file

Create a `.env.local` file in the root directory with the following content:

```env
# Firebase Configuration
# These values are from your Firebase project: ecommerce-2f366
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBL2gnh-jO_47zTKgT05PaMwqGCK9hJIKA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ecommerce-2f366.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ecommerce-2f366
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ecommerce-2f366.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=180795445013
NEXT_PUBLIC_FIREBASE_APP_ID=1:180795445013:web:7ef14a09f0398a343a231c
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G6C5N0K2DX
```

## Step 2: Enable Google Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ecommerce-2f366**
3. Navigate to **Authentication** (under "Build" section)
4. Click on **Sign-in method** tab
5. Click on **Google** provider
6. Toggle **Enable** switch
7. Set **Project support email** (use your email: arbengrepi@gmail.com)
8. Click **Save**

## Step 3: Add Authorized Domains

1. Still in **Authentication** → **Sign-in method**
2. Scroll down to **Authorized domains**
3. Make sure these domains are listed:
   - `localhost` (for local development)
   - `ecommerce-2f366.firebaseapp.com` (your Firebase hosting domain)
   - Your production domain (when you deploy)

## Step 4: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Click the **"Sign in with Google"** button

4. Sign in with `arbengrepi@gmail.com`

5. You should be automatically redirected to `/admin/overview`

6. Verify in Firebase Console:
   - Go to **Authentication** → **Users** tab
   - You should see `arbengrepi@gmail.com` listed with "Google" as the provider

## Troubleshooting

### Issue: "auth/unauthorized-domain" error
**Solution**: Make sure `localhost` is in the Authorized domains list in Firebase Console

### Issue: Pop-up blocker preventing sign-in
**Solution**: Allow pop-ups for localhost in your browser settings

### Issue: "CONFIGURATION_NOT_FOUND" error
**Solution**: 
- Double-check your `.env.local` file exists and has all the correct values
- Restart your Next.js dev server after creating/updating `.env.local`
- Make sure Google sign-in method is enabled in Firebase Console

### Issue: Not redirecting to admin dashboard
**Solution**: 
- Check browser console for errors
- Verify the email matches exactly: `arbengrepi@gmail.com` (case-sensitive)
- Check that the authentication state is being properly detected

## Next Steps (Optional Enhancements)

Based on Gemini's suggestions, you might want to explore:

1. **Firebase Custom Claims** - For more robust admin role management
2. **Firebase Security Rules** - To protect your data at the database level
3. **Firebase Admin SDK** - For server-side admin operations in API routes

## Verification Checklist

- [ ] `.env.local` file created with all Firebase config values
- [ ] Google Authentication enabled in Firebase Console
- [ ] `localhost` added to authorized domains
- [ ] Dev server running (`npm run dev`)
- [ ] Can sign in with Google
- [ ] Admin user (`arbengrepi@gmail.com`) redirects to `/admin/overview`
- [ ] Regular users stay on homepage
- [ ] User appears in Firebase Console → Authentication → Users

