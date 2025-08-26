# Quick Start Guide

This guide will get you up and running with the Google Drive MCP server in under 10 minutes.

## Prerequisites

- Google Cloud account
- GitHub account
- Render account (free)

## Step 1: Get Google Drive Access Token

### Option A: OAuth Playground (Fastest)
1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click settings (⚙️) and check "Use your own OAuth credentials"
3. Add these scopes:
   ```
   https://www.googleapis.com/auth/drive.readonly
   https://www.googleapis.com/auth/spreadsheets
   ```
4. Click "Authorize APIs" and follow the flow
5. Click "Exchange authorization code for tokens"
6. Copy the access token

### Option B: Service Account (More Secure)
1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Place it as `service-account-key.json` in the project root
4. Run: `npm run generate-token`
5. Copy the generated token

## Step 2: Deploy to Render

1. **Push to GitHub**: Upload the `gdrive-mcp-token-auth` folder to a new GitHub repository

2. **Create Render Service**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
   - Add environment variable:
     - **Key**: `GOOGLE_DRIVE_ACCESS_TOKEN`
     - **Value**: Your access token from Step 1

3. **Deploy**: Click "Create Web Service"

## Step 3: Test Your Deployment

1. Check the Render logs for "Access token validated successfully"
2. Your service is now running at `https://your-service-name.onrender.com`

## Local Testing

1. Copy `env.example` to `.env`
2. Add your access token to `.env`
3. Run: `npm run test-auth`
4. If successful, run: `npm start`

## What's Included

- ✅ Google Drive file listing and reading
- ✅ Google Drive file search
- ✅ Google Sheets reading and writing
- ✅ Access token authentication
- ✅ Render deployment ready
- ✅ TypeScript support
- ✅ Error handling and validation

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for advanced deployment options
- Customize the tools in the `tools/` directory
- Add your own Google Drive integrations

## Support

- Check the logs in Render dashboard
- Verify your access token has the correct scopes
- Ensure Google APIs are enabled in your project
