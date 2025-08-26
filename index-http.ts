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
    hasToken: !!currentAccessToken,
    type: 'HTTP Streamable MCP Server'
  });
});

// Set access token endpoint (for initial setup)
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

// HTTP Streamable MCP Endpoint - Main endpoint for all MCP operations
app.post('/mcp', async (req, res) => {
  try {
    const { jsonrpc, method, params, id } = req.body;
    
    if (jsonrpc !== "2.0") {
      return res.status(400).json({ 
        jsonrpc: "2.0",
        error: { code: -32600, message: 'Invalid Request' },
        id: id 
      });
    }

    // Set up streaming response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Handle different MCP methods
    switch (method) {
      case 'initialize':
        // Send initialization response
        const initResponse = {
          jsonrpc: "2.0",
          result: {
            protocolVersion: "2025-06-18",
            capabilities: {
              tools: {},
              resources: {}
            },
            serverInfo: {
              name: "gdrive-mcp-server",
              version: "1.0.0"
            }
          },
          id: id
        };
        res.write(JSON.stringify(initResponse) + '\n');
        break;

      case 'tools/list':
        // Send tools list
        const toolsList = tools.map(({ name, description, inputSchema }) => ({
          name,
          description,
          inputSchema,
        }));
        
        const toolsResponse = {
          jsonrpc: "2.0",
          result: { tools: toolsList },
          id: id
        };
        res.write(JSON.stringify(toolsResponse) + '\n');
        break;

      case 'tools/call':
        // Check if we have an access token
        if (!currentAccessToken) {
          const errorResponse = {
            jsonrpc: "2.0",
            error: {
              code: -32001,
              message: 'Access token not set. Use /set-token endpoint or x-access-token header.'
            },
            id: id
          };
          res.write(JSON.stringify(errorResponse) + '\n');
          break;
        }

        // Ensure authentication
        await ensureAuth(currentAccessToken);
        
        const { name, arguments: toolArgs } = params;
        const tool = tools.find(t => t.name === name);
        
        if (!tool) {
          const errorResponse = {
            jsonrpc: "2.0",
            error: {
              code: -32601,
              message: `Tool '${name}' not found`
            },
            id: id
          };
          res.write(JSON.stringify(errorResponse) + '\n');
          break;
        }

        // Send tool call start notification
        const callStartResponse = {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name,
            arguments: toolArgs,
            callId: id
          }
        };
        res.write(JSON.stringify(callStartResponse) + '\n');

        // Execute tool
        const result = await tool.handler(toolArgs);
        
        // Send tool result
        const callResultResponse = {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            callId: id,
            content: result.content,
            isError: result.isError
          }
        };
        res.write(JSON.stringify(callResultResponse) + '\n');
        break;

      default:
        const methodNotFoundResponse = {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: `Method '${method}' not found`
          },
          id: id
        };
        res.write(JSON.stringify(methodNotFoundResponse) + '\n');
    }

    res.end();
    
  } catch (error) {
    console.error('Error in MCP endpoint:', error);
    const errorResponse = {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: 'Internal server error',
        data: (error as Error).message
      },
      id: req.body.id || "1"
    };
    res.write(JSON.stringify(errorResponse) + '\n');
    res.end();
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
    console.error("Starting Google Drive HTTP Streamable MCP server");
    
    // Check if we have an initial access token (optional for MCP server)
    const initialToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
    if (initialToken) {
      console.error("Initial access token found, validating...");
      const isValid = await validateAccessToken(initialToken);
      if (isValid) {
        currentAccessToken = initialToken;
        setDynamicAccessToken(initialToken);
        console.error("Initial access token validated successfully");
      } else {
        console.error("Initial access token validation failed, but server will start anyway");
      }
    } else {
      console.error("No initial access token found - server will start and wait for dynamic token");
    }
    
    // Start the Express server
    app.listen(PORT, () => {
      console.error(`🚀 HTTP Streamable MCP Server running on http://localhost:${PORT}`);
      console.error(`📋 Health check: http://localhost:${PORT}/health`);
      console.error(`🔧 Set token: POST http://localhost:${PORT}/set-token`);
      console.error(`🚀 MCP endpoint: POST http://localhost:${PORT}/mcp`);
      console.error(``);
      console.error(`📋 Available MCP methods:`);
      console.error(`   - initialize: Initialize MCP connection`);
      console.error(`   - tools/list: List available tools`);
      console.error(`   - tools/call: Execute tools with streaming responses`);
      console.error(``);
      console.error(`🔧 Available tools (8 total):`);
      console.error(`   - gdrive_search: Search for files`);
      console.error(`   - gdrive_read_file: Read file contents`);
      console.error(`   - gsheets_read: Read Google Sheets`);
      console.error(`   - gsheets_update_cell: Update Google Sheets cells`);
      console.error(`   - gdrive_create_file: Create new files`);
      console.error(`   - gdrive_create_folder: Create new folders`);
      console.error(`   - gdrive_delete_file: Delete files`);
      console.error(`   - gdrive_share_file: Share files with permissions`);
    });
    
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Start server immediately
startServer().catch(console.error);
