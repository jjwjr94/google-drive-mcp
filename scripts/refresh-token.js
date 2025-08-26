#!/usr/bin/env node

/**
 * Script to refresh Google Drive access tokens using a refresh token
 */

import { google } from 'googleapis';

// Your OAuth2 credentials (you'll need to get these from Google Cloud Console)
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
];

async function refreshAccessToken() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      console.error('❌ Missing OAuth2 credentials!');
      console.error('Please set these environment variables:');
      console.error('  GOOGLE_CLIENT_ID=your_client_id');
      console.error('  GOOGLE_CLIENT_SECRET=your_client_secret');
      console.error('  GOOGLE_REFRESH_TOKEN=your_refresh_token');
      console.error('');
      console.error('You can get these from:');
      console.error('  https://console.cloud.google.com/apis/credentials');
      process.exit(1);
    }

    console.log('🔄 Refreshing access token...');
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET
    );

    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });

    // Get new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Failed to get new access token');
    }

    console.log('✅ Access token refreshed successfully!');
    console.log('');
    console.log('🔑 New Access Token:');
    console.log(credentials.access_token);
    console.log('');
    console.log('📅 Expires at:', new Date(credentials.expiry_date).toISOString());
    console.log('');
    console.log('🌐 To use with your server:');
    console.log(`curl -X POST https://google-drive-mcp.onrender.com/set-token \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"accessToken": "${credentials.access_token}"}'`);
    
    // Optionally save to .env file
    const envPath = new URL('.env', import.meta.url).pathname;
    const envContent = `GOOGLE_DRIVE_ACCESS_TOKEN=${credentials.access_token}\n`;
    
    try {
      const fs = await import('fs');
      fs.writeFileSync(envPath, envContent);
      console.log('');
      console.log(`💾 Token saved to ${envPath}`);
    } catch (error) {
      console.log('');
      console.log('⚠️  Could not save to .env file (this is optional)');
    }
    
  } catch (error) {
    console.error('❌ Error refreshing access token:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.error('');
      console.error('🔍 This usually means:');
      console.error('  1. The refresh token has expired');
      console.error('  2. The refresh token is invalid');
      console.error('  3. The OAuth2 credentials are incorrect');
      console.error('');
      console.error('💡 Try getting a new refresh token from:');
      console.error('  https://developers.google.com/oauthplayground/');
    }
    
    process.exit(1);
  }
}

// Run the script
refreshAccessToken();
