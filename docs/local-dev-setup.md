# Local Development Setup - Firebase Admin SDK

## Quick Setup (Choose One Method)

### Method 1: Application Default Credentials (Recommended)

1. **Install Google Cloud SDK** (if not already installed):
   - Windows: Download from https://cloud.google.com/sdk/docs/install
   - Mac: `brew install google-cloud-sdk`
   - Linux: Follow https://cloud.google.com/sdk/docs/install

2. **Authenticate**:
   ```bash
   gcloud auth application-default login
   ```

3. **Set your project**:
   ```bash
   gcloud config set project ecommerce-2f366
   ```

4. **Start dev server**:
   ```bash
   npm run dev
   ```

That's it! The app will now use server-side rendering locally.

### Method 2: Service Account Key

1. **Generate Service Account Key**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: **ecommerce-2f366**
   - Go to **Project Settings** → **Service Accounts**
   - Click **"Generate New Private Key"**
   - Save the JSON file securely (don't commit it!)

2. **Add to `.env.local`**:
   ```env
   FIREBASE_PROJECT_ID=ecommerce-2f366
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ecommerce-2f366.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```

   **Important**: 
   - Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Keep the `\n` characters in the key
   - Wrap the entire key in quotes

3. **Start dev server**:
   ```bash
   npm run dev
   ```

### Method 3: Skip Server-Side Rendering (Fallback)

If you don't want to set up credentials right now, the app will still work! It will:
- Fetch data client-side (like before)
- Still work perfectly, just without server-side rendering benefits
- You'll see a warning in the console, but the app functions normally

## Verify It's Working

1. **Check the console** - Should NOT see credential errors
2. **View page source** - Should see category/product data in HTML
3. **Check Network tab** - Initial HTML should contain content

## Troubleshooting

### Error: "Could not load the default credentials"

**Solution**: Run `gcloud auth application-default login` or add credentials to `.env.local`

### Error: "Invalid credentials"

**Solution**: 
- Check that `.env.local` has correct values
- Make sure private key includes `\n` characters
- Restart dev server after adding credentials

### Still seeing loading spinners

**Solution**: 
- Check browser console for errors
- Verify Firebase Admin is initialized (check server logs)
- If server-side fails, app falls back to client-side (which is fine!)

## Production Deployment

**No setup needed!** Firebase Hosting/Cloud Functions automatically provide credentials. The server-side rendering will work automatically when deployed.

