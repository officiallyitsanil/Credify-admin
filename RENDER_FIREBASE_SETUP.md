# Firebase Admin SDK Setup for Render Deployment

## Issue
Backend returns 500 error: "Unable to detect a Project Id"
This means Firebase Admin SDK is not properly configured on Render.

## Solution

### Step 1: Get Firebase Service Account Key

1. Go to https://console.firebase.google.com/
2. Select project: **credify-600f7**
3. Click gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate New Private Key"** button
6. Click **Generate Key** to download the JSON file
7. Open the downloaded JSON file and copy ALL the content

### Step 2: Add to Render Environment Variables

1. Go to https://dashboard.render.com/
2. Select your backend service (credifyapp-admin)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Paste the ENTIRE JSON content from the downloaded file
   
   Example format (your actual file will have different values):
   ```json
   {"type":"service_account","project_id":"credify-600f7","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
   ```

6. Click **Save Changes**
7. Render will automatically redeploy your service

### Step 3: Verify

After redeployment:
1. Check the Render logs for: `✅ Firebase Admin initialized successfully`
2. Try logging in again with phone number: +918500216667
3. Login should now work properly

## Important Notes

- The service account JSON is DIFFERENT from the frontend Firebase config
- Frontend uses: apiKey, authDomain, projectId (client-side)
- Backend needs: Service Account Key (server-side private key)
- NEVER commit service account keys to Git
- The service account must be added as an environment variable on Render

## If It Still Doesn't Work

Check Render logs:
1. Go to your service on Render
2. Click "Logs" tab
3. Look for initialization messages or errors
4. The log should show "✅ Firebase Admin initialized successfully"
