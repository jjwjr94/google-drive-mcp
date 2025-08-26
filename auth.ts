import { google } from "googleapis";

export const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
];

// Global auth instance that can be updated
let currentAuth: any = null;

// Get access token from environment variable (for static deployment)
function getAccessToken(): string | null {
  const token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  if (!token) {
    console.error("GOOGLE_DRIVE_ACCESS_TOKEN environment variable is not set");
    return null;
  }
  return token;
}

// Create OAuth2 client with access token
export function createOAuth2Client(accessToken?: string) {
  const token = accessToken || getAccessToken();
  if (!token) {
    throw new Error("Google Drive access token not available");
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: token,
  });

  return oauth2Client;
}

// Set dynamic access token (for n8n integration)
export function setDynamicAccessToken(accessToken: string) {
  currentAuth = createOAuth2Client(accessToken);
  google.options({ auth: currentAuth });
  console.error("Dynamic access token set successfully");
}

// Get valid credentials using access token
export async function getValidCredentials(accessToken?: string) {
  if (accessToken) {
    // Use provided token
    const oauth2Client = createOAuth2Client(accessToken);
    google.options({ auth: oauth2Client });
    return oauth2Client;
  } else if (currentAuth) {
    // Use previously set dynamic token
    google.options({ auth: currentAuth });
    return currentAuth;
  } else {
    // Use environment variable token
    const oauth2Client = createOAuth2Client();
    google.options({ auth: oauth2Client });
    return oauth2Client;
  }
}

// Load credentials quietly (for background operations)
export async function loadCredentialsQuietly(accessToken?: string) {
  try {
    return await getValidCredentials(accessToken);
  } catch (error) {
    console.error("Error loading credentials:", error);
    return null;
  }
}

// Validate that the access token is working
export async function validateAccessToken(accessToken?: string): Promise<boolean> {
  try {
    const auth = await getValidCredentials(accessToken);
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
