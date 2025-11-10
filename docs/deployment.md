# Deployment Guide

## Prerequisites

Before deploying to Firebase Hosting, ensure the following APIs are enabled in your Google Cloud project. **You don't need to install any CLI tools** - just use the web console links below.

### Required APIs

1. **Cloud Functions API** (Required for Next.js SSR) ⚠️ **REQUIRED**
   - **Enable here:** https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=ecommerce-2f366
   - Click the "Enable" button
   - Wait 2-3 minutes for it to activate

2. **Cloud Build API** (Required for building Cloud Functions) ⚠️ **REQUIRED**
   - **Enable here:** https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=ecommerce-2f366
   - Click the "Enable" button
   - Wait 2-3 minutes for it to activate

3. **Artifact Registry API** (Required for storing build artifacts) ⚠️ **REQUIRED**
   - **Enable here:** https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=ecommerce-2f366
   - Click the "Enable" button
   - Wait 2-3 minutes for it to activate

4. **Firebase Extensions API** (Required for Firebase framework deployments) ⚠️ **REQUIRED**
   - **Enable here:** https://console.cloud.google.com/apis/library/firebaseextensions.googleapis.com?project=ecommerce-2f366
   - Click the "Enable" button
   - Wait 2-3 minutes for it to activate

5. **Firebase Hosting API** (Usually enabled by default)
   - **Check here:** https://console.cloud.google.com/apis/library/firebasehosting.googleapis.com?project=ecommerce-2f366
   - Should already be enabled, but verify if needed

> **Note:** You don't need to install `gcloud` CLI. The web console links above are the easiest way to enable these APIs.

### Service Account Permissions

Ensure your Firebase service account (`FIREBASE_SERVICE_ACCOUNT_ECOMMERCE_2F366`) has the following roles:

**Required Roles:**
- **Firebase Admin** ⚠️ **REQUIRED** - Includes `firebaseextensions.instances.list` permission needed for framework deployments
- **Firebase Admin SDK Administrator Service Agent** - Usually auto-assigned, but verify it exists
- **Cloud Functions Admin** - Required for deploying Cloud Functions
- **Service Account User** - Required for Cloud Functions to use service accounts
- **Cloud Build Service Account** - Required for building functions

**Important Notes:**
- The **Firebase Admin** role is required (not just the service agent role). The service agent role alone doesn't include all necessary permissions.
- Your service account is typically named: `firebase-adminsdk-xxxxx@ecommerce-2f366.iam.gserviceaccount.com`
- To check/update roles, go to [IAM page](https://console.cloud.google.com/iam-admin/iam?project=ecommerce-2f366) (not the Roles page)

## Common Build Failures

### "Permissions denied enabling artifactregistry.googleapis.com"

If you see this error:

```
Error: Permissions denied enabling artifactregistry.googleapis.com.
Please ask a project owner to visit the following URL to enable this service:
```

**Solution:**
1. Visit: https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=ecommerce-2f366
2. Click "Enable"
3. Also enable Cloud Build API: https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=ecommerce-2f366
4. Wait 2-3 minutes for the APIs to propagate
5. Retry the deployment

**Why this happens:** The GitHub Actions service account doesn't have permission to enable APIs programmatically. You need to enable them manually in the Google Cloud Console.

### "firebaseextensions.instances.list permission denied" or "The caller does not have permission"

If you see this error:

```
[iam] error while checking permissions, command may fail: Authorization failed. This account is missing the following required permissions on project ***:
  firebaseextensions.instances.list

Error: Request to https://firebaseextensions.googleapis.com/v1beta/projects/***/instances had HTTP Error: 403, The caller does not have permission
```

**Solution:**
1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam?project=ecommerce-2f366) (make sure you're on the IAM page, not Roles)
2. Find your service account (typically named `firebase-adminsdk-xxxxx@ecommerce-2f366.iam.gserviceaccount.com`)
   - If you can't find it, check your GitHub Actions secret `FIREBASE_SERVICE_ACCOUNT_ECOMMERCE_2F366` for the exact email
3. Click "Edit" (pencil icon) next to the service account
4. Click "Add Another Role"
5. Search for and select: **Firebase Admin** (not "Firebase Admin SDK Administrator Service Agent")
6. Click "Save"
7. Wait 1-2 minutes for permissions to propagate
8. Retry the deployment

**Why this happens:** The service account needs the `firebaseextensions.instances.list` IAM permission to query Firebase Extensions instances. While "Firebase Admin SDK Administrator Service Agent" is a service agent role, it doesn't include all permissions. The broader **Firebase Admin** role includes this permission and is required for framework deployments.

### "Cloud Functions API has not been used"

If you see this error during deployment:

```
Cloud Functions API has not been used in project *** before or it is disabled.
```

**Solution:**
1. Visit: https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=ecommerce-2f366
2. Click "Enable"
3. Wait 2-3 minutes for the API to propagate
4. Retry the deployment

## Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

## CI/CD Deployment

The GitHub Actions workflows will automatically:
1. Build the Next.js application
2. Deploy to Firebase Hosting
3. Create/update Cloud Functions for SSR routes

Make sure all required APIs are enabled and the service account has the correct IAM roles before the first deployment.

## Quick Checklist

Before deploying, verify:

- [ ] Cloud Functions API is enabled
- [ ] Cloud Build API is enabled
- [ ] Artifact Registry API is enabled
- [ ] Firebase Extensions API is enabled
- [ ] Service account has **Firebase Admin** role (not just the service agent role)
- [ ] Service account has **Cloud Functions Admin** role
- [ ] Service account has **Service Account User** role
- [ ] Service account has **Cloud Build Service Account** role

