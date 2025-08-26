#!/usr/bin/env node

/**
 * Test script to verify Google Drive authentication is working
 */

import 'dotenv/config';
import { validateAccessToken } from '../dist/auth.js';

async function testAuthentication() {
  console.log('Testing Google Drive authentication...');
  
  try {
    const isValid = await validateAccessToken();
    
    if (isValid) {
      console.log('✅ Authentication successful!');
      console.log('Your access token is valid and working.');
    } else {
      console.log('❌ Authentication failed!');
      console.log('Please check your GOOGLE_DRIVE_ACCESS_TOKEN environment variable.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during authentication test:', error.message);
    process.exit(1);
  }
}

// Run the test
testAuthentication();
