#!/usr/bin/env node
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { google } from "googleapis";
import {
  getValidCredentials,
  loadCredentialsQuietly,
  validateAccessToken,
  setDynamicAccessToken,
} from "./auth.js";
import { tools } from "./tools/index.js";

const drive = google.drive("v3");
const sheets = google.sheets("v4");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Global access token storage
let currentAccessToken: string | null = null;

// Middleware to extract access token from headers
app.use((req, res, next) => {
  const token = req.headers['x-access-token'] as string;
  if (token) {
    currentAccessToken = token;
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'gdrive-mcp-server',
    hasToken: !!currentAccessToken 
  });
});

// Set access token endpoint
app.post('/set-token', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Validate the token
    const isValid = await validateAccessToken(accessToken);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid access token' });
    }

    // Set the token globally
    currentAccessToken = accessToken;
    setDynamicAccessToken(accessToken);
    
    res.json({ success: true, message: 'Access token set successfully' });
  } catch (error) {
    console.error('Error setting access token:', error);
    res.status(500).json({ error: 'Failed to set access token' });
  }
});

// List available tools
app.get('/tools', (req, res) => {
  const toolList = tools.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  }));
  
  res.json({ tools: toolList });
});

// Google Drive Search
app.post('/tools/gdrive_search', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'Access token not set. Use /set-token or x-access-token header.' });
    }

    await ensureAuth(currentAccessToken);
    const tool = tools.find(t => t.name === 'gdrive_search');
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    const result = await tool.handler(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in gdrive_search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Drive Read File
app.post('/tools/gdrive_read_file', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'Access token not set. Use /set-token or x-access-token header.' });
    }

    await ensureAuth(currentAccessToken);
    const tool = tools.find(t => t.name === 'gdrive_read_file');
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    const result = await tool.handler(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in gdrive_read_file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Sheets Read
app.post('/tools/gsheets_read', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'Access token not set. Use /set-token or x-access-token header.' });
    }

    await ensureAuth(currentAccessToken);
    const tool = tools.find(t => t.name === 'gsheets_read');
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    const result = await tool.handler(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in gsheets_read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Sheets Update Cell
app.post('/tools/gsheets_update_cell', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'Access token not set. Use /set-token or x-access-token header.' });
    }

    await ensureAuth(currentAccessToken);
    const tool = tools.find(t => t.name === 'gsheets_update_cell');
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    const result = await tool.handler(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in gsheets_update_cell:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List Google Drive files
app.get('/files', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'Access token not set. Use /set-token or x-access-token header.' });
    }

    await ensureAuth(currentAccessToken);
    
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const pageToken = req.query.pageToken as string;
    
    const params: any = {
      pageSize,
      fields: "nextPageToken, files(id, name, mimeType)",
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const driveResponse = await drive.files.list(params);
    const files = driveResponse.data.files!;

    res.json({
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        uri: `gdrive:///${file.id}`,
      })),
      nextPageToken: driveResponse.data.nextPageToken,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Read file content
app.get('/files/:fileId/content', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'Access token not set. Use /set-token or x-access-token header.' });
    }

    await ensureAuth(currentAccessToken);
    const { fileId } = req.params;
    
    const tool = tools.find(t => t.name === 'gdrive_read_file');
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // Create a proper input object for the tool
    const toolInput = { fileId: fileId as string };
    const result = await tool.handler(toolInput as any);
    res.json(result);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ensure we have valid credentials before making API calls
async function ensureAuth(accessToken?: string) {
  const auth = await getValidCredentials(accessToken);
  google.options({ auth });
  return auth;
}

async function startServer() {
  try {
    console.error("Starting Google Drive MCP server with HTTP transport");
    
    // Start the Express server
    app.listen(PORT, () => {
      console.error(`🚀 MCP Server running on http://localhost:${PORT}`);
      console.error(`📋 Health check: http://localhost:${PORT}/health`);
      console.error(`🔧 Set token: POST http://localhost:${PORT}/set-token`);
      console.error(`📋 List tools: GET http://localhost:${PORT}/tools`);
      console.error(`📁 List files: GET http://localhost:${PORT}/files`);
      console.error(`📄 Read file: GET http://localhost:${PORT}/files/:fileId/content`);
      console.error(`🔍 Search files: POST http://localhost:${PORT}/tools/gdrive_search`);
      console.error(`📖 Read sheets: POST http://localhost:${PORT}/tools/gsheets_read`);
      console.error(`✏️ Update sheets: POST http://localhost:${PORT}/tools/gsheets_update_cell`);
    });
    
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Start server immediately
startServer().catch(console.error);
