import { google } from "googleapis";

export const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
];

// Get access token from environment variable
function getAccessToken(): string | null {
  const token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  if (!token) {
    console.error("GOOGLE_DRIVE_ACCESS_TOKEN environment variable is not set");
    return null;
  }
  return token;
}

// Create OAuth2 client with access token
export function createOAuth2Client() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Google Drive access token not available");
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return oauth2Client;
}

// Get valid credentials using access token
export async function getValidCredentials() {
  const oauth2Client = createOAuth2Client();
  
  // Set the auth for googleapis
  google.options({ auth: oauth2Client });
  
  return oauth2Client;
}

// Load credentials quietly (for background operations)
export async function loadCredentialsQuietly() {
  try {
    return await getValidCredentials();
  } catch (error) {
    console.error("Error loading credentials:", error);
    return null;
  }
}

// Validate that the access token is working
export async function validateAccessToken(): Promise<boolean> {
  try {
    const auth = await getValidCredentials();
    const drive = google.drive("v3");
    
    // Make a simple API call to test the token
    await drive.files.list({
      pageSize: 1,
      fields: "files(id, name)",
    });
    
    console.error("Access token validation successful");
    return true;
  } catch (error) {
    console.error("Access token validation failed:", error);
    return false;
  }
}
