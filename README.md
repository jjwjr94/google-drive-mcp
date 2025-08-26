# Google Drive MCP Server - Access Token Authentication

This is a modified version of the [@isaacphi/mcp-gdrive](https://github.com/isaacphi/mcp-gdrive) server that uses Google Drive access tokens for authentication instead of OAuth flow. This makes it suitable for deployment on platforms like Render where interactive authentication flows are not possible.

## Features

- **Access Token Authentication**: Uses Google Drive access tokens instead of OAuth flow
- **Google Drive Integration**: List, read, and search files in Google Drive
- **Google Sheets Support**: Read and write to Google Sheets
- **MCP Protocol**: Implements the Model Context Protocol for AI integration
- **Deployment Ready**: Suitable for deployment on Render and other cloud platforms

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud project with the following APIs enabled:
   - Google Drive API
   - Google Sheets API
   - Google Docs API (for document export)

2. **Service Account or OAuth2 Access Token**: You'll need either:
   - A service account with appropriate permissions, OR
   - An OAuth2 access token with the required scopes

## Required Scopes

The access token must have the following scopes:
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/spreadsheets`

## Local Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd gdrive-mcp-token-auth
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the project root:
   ```env
   GOOGLE_DRIVE_ACCESS_TOKEN=your_access_token_here
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run the server**:
   ```bash
   npm start
   ```

## Getting a Google Drive Access Token

### Option 1: Using Google Cloud Console (Recommended for testing)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID (Desktop application)
5. Download the client configuration
6. Use a tool like [Google OAuth Playground](https://developers.google.com/oauthplayground/) to get an access token:
   - Set your OAuth 2.0 credentials
   - Add the required scopes
   - Exchange authorization code for access token

### Option 2: Using Service Account (Recommended for production)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Create a Service Account
5. Download the JSON key file
6. Use the service account to generate access tokens programmatically

## Deployment on Render

1. **Create a new Web Service** on Render
2. **Connect your repository**
3. **Configure the service**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

4. **Add Environment Variables**:
   - `GOOGLE_DRIVE_ACCESS_TOKEN`: Your Google Drive access token

5. **Deploy**

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_DRIVE_ACCESS_TOKEN` | Google Drive access token with required scopes | Yes |

## Available Tools

### Google Drive Tools

- **gdrive_search**: Search for files in Google Drive
- **gdrive_read_file**: Read contents of a file from Google Drive

### Google Sheets Tools

- **gsheets_read**: Read data from a Google Spreadsheet
- **gsheets_update_cell**: Update a cell value in a Google Spreadsheet

## Usage with MCP Clients

Add this server to your MCP client configuration:

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "GOOGLE_DRIVE_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

## Security Considerations

- **Access Token Security**: Keep your access tokens secure and never commit them to version control
- **Token Expiration**: Access tokens expire after a certain time. You'll need to refresh them periodically
- **Scope Limitation**: Use the minimum required scopes for your use case
- **Service Accounts**: For production deployments, consider using service accounts instead of user access tokens

## Troubleshooting

### Common Issues

1. **"Access token validation failed"**
   - Check that your access token is valid and not expired
   - Ensure the token has the required scopes
   - Verify the Google APIs are enabled in your project

2. **"Permission denied" errors**
   - Ensure the account associated with the access token has access to the files/sheets
   - Check that the required APIs are enabled

3. **Build errors**
   - Ensure you're using Node.js 18 or higher
   - Run `npm install` to install dependencies
   - Check that TypeScript is properly configured

## License

This project is based on the original [@isaacphi/mcp-gdrive](https://github.com/isaacphi/mcp-gdrive) and is licensed under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests!
