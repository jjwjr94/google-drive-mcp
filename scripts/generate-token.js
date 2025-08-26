#!/usr/bin/env node

/**
 * Helper script to generate access tokens using service account credentials
 * This is useful for production deployments where you need to generate tokens programmatically
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
];

async function generateAccessToken() {
  try {
    // Check if service account key file exists
    const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './service-account-key.json';
    
    if (!fs.existsSync(keyFilePath)) {
      console.error('Service account key file not found. Please set GOOGLE_SERVICE_ACCOUNT_KEY_FILE environment variable or place service-account-key.json in the project root.');
      console.error('You can download this file from Google Cloud Console > IAM & Admin > Service Accounts > Create Key');
      process.exit(1);
    }

    // Load service account credentials
    const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    
    // Create JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      SCOPES
    );

    // Generate access token
    const { token } = await auth.getAccessToken();
    
    if (!token) {
      throw new Error('Failed to generate access token');
    }

    console.log('Access token generated successfully!');
    console.log('Add this to your environment variables:');
    console.log(`GOOGLE_DRIVE_ACCESS_TOKEN=${token}`);
    
    // Optionally save to .env file
    const envPath = path.join(process.cwd(), '.env');
    const envContent = `GOOGLE_DRIVE_ACCESS_TOKEN=${token}\n`;
    
    fs.writeFileSync(envPath, envContent);
    console.log(`Token saved to ${envPath}`);
    
  } catch (error) {
    console.error('Error generating access token:', error.message);
    process.exit(1);
  }
}

// Run the script
generateAccessToken();
