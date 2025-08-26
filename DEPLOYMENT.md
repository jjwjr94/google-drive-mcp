# Deployment Guide for Render

This guide will walk you through deploying the Google Drive MCP server on Render using access token authentication.

## Prerequisites

1. **Google Cloud Project** with the following APIs enabled:
   - Google Drive API
   - Google Sheets API
   - Google Docs API

2. **Service Account** (recommended for production) or OAuth2 access token

3. **Render Account** (free tier works fine)

## Step 1: Set Up Google Cloud Project

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (required for API usage)

### 1.2 Enable Required APIs
1. Go to "APIs & Services" > "Library"
2. Search for and enable:
   - Google Drive API
   - Google Sheets API
   - Google Docs API

### 1.3 Create Service Account (Recommended)
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "mcp-gdrive-server"
4. Add description: "Service account for MCP Google Drive server"
5. Click "Create and Continue"
6. Grant the following roles:
   - "Drive File Stream" (for file access)
   - "Sheets API" (for spreadsheet access)
7. Click "Done"
8. Click on the created service account
9. Go to "Keys" tab
10. Click "Add Key" > "Create new key"
11. Choose "JSON" format
12. Download the key file

## Step 2: Prepare Your Repository

### 2.1 Push to GitHub
1. Create a new repository on GitHub
2. Push the `gdrive-mcp-token-auth` folder to your repository
3. Make sure the repository is public (Render free tier requirement)

### 2.2 Generate Access Token
You have two options:

#### Option A: Using Service Account (Recommended)
1. Place the downloaded service account key file in your project root as `service-account-key.json`
2. Run the token generation script:
   ```bash
   npm run generate-token
   ```
3. Copy the generated token

#### Option B: Using OAuth2 Playground
1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click the settings icon (⚙️)
3. Check "Use your own OAuth credentials"
4. Enter your OAuth2 client ID and secret
5. Add these scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/spreadsheets`
6. Click "Authorize APIs"
7. Click "Exchange authorization code for tokens"
8. Copy the access token

## Step 3: Deploy on Render

### 3.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your MCP server

### 3.2 Configure the Service
- **Name**: `gdrive-mcp-server` (or any name you prefer)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free (or paid if you need more resources)

### 3.3 Add Environment Variables
1. Go to the "Environment" tab
2. Add the following environment variable:
   - **Key**: `GOOGLE_DRIVE_ACCESS_TOKEN`
   - **Value**: Your access token from Step 2.2
   - **Sync**: Leave unchecked (for security)

### 3.4 Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your service
3. Wait for the deployment to complete (usually 2-5 minutes)

## Step 4: Verify Deployment

### 4.1 Check Build Logs
1. In your Render dashboard, go to your service
2. Check the "Logs" tab for any build or runtime errors
3. Look for the message "Access token validated successfully"

### 4.2 Test the Service
The service should be accessible at your Render URL. However, since this is an MCP server, it's designed to communicate via stdio, not HTTP.

## Step 5: Configure MCP Client

### 5.1 For Local Development
Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "curl",
      "args": ["-s", "https://your-render-url.onrender.com"],
      "env": {
        "GOOGLE_DRIVE_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

### 5.2 For Production
You'll need to modify the server to handle HTTP requests instead of stdio. This is a more complex setup that would require additional development.

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript is properly configured
   - Check the build logs in Render dashboard

2. **Access Token Validation Fails**
   - Verify the token is not expired
   - Check that the token has the required scopes
   - Ensure the Google APIs are enabled

3. **Permission Denied Errors**
   - Make sure the service account has access to the files/sheets
   - Check that the files are shared with the service account email

4. **Service Won't Start**
   - Check the start command in Render configuration
   - Verify the `dist/index.js` file exists after build
   - Check the runtime logs for errors

### Logs to Monitor
- Build logs: Check for compilation errors
- Runtime logs: Look for authentication and API call errors
- Access logs: Monitor for successful token validation

## Security Best Practices

1. **Never commit access tokens to version control**
2. **Use service accounts for production deployments**
3. **Rotate access tokens regularly**
4. **Use the minimum required scopes**
5. **Monitor API usage in Google Cloud Console**

## Cost Considerations

- **Render Free Tier**: 750 hours/month, suitable for development
- **Google APIs**: Free tier includes generous quotas
- **Service Account**: Free to create and use

## Next Steps

1. **Set up monitoring** for your deployed service
2. **Configure automatic deployments** from your main branch
3. **Set up alerts** for service downtime
4. **Consider upgrading** to a paid Render plan for production use

## Support

If you encounter issues:
1. Check the Render documentation
2. Review Google Cloud Console logs
3. Check the MCP server logs in Render dashboard
4. Open an issue in the original repository or your fork
