import { InternalToolResponse } from "./types.js";
import { setDynamicAccessToken, validateAccessToken } from "../auth.js";

export const setAccessToken = {
  name: "gdrive_set_access_token",
  description: "Set a Google Drive access token dynamically. Use this before calling other Google Drive tools.",
  inputSchema: {
    type: "object",
    properties: {
      accessToken: {
        type: "string",
        description: "Google Drive access token with required scopes (drive.readonly, spreadsheets)",
      },
    },
    required: ["accessToken"],
  },
  handler: async ({ accessToken }: { accessToken: string }): Promise<InternalToolResponse> => {
    try {
      // Set the dynamic access token
      setDynamicAccessToken(accessToken);
      
      // Validate the token
      const isValid = await validateAccessToken(accessToken);
      
      if (isValid) {
        return {
          content: [
            {
              type: "text",
              text: `✅ Access token set successfully and validated. You can now use other Google Drive tools.`,
            },
          ],
          isError: false,
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `❌ Access token validation failed. Please check your token and ensure it has the required scopes: https://www.googleapis.com/auth/drive.readonly and https://www.googleapis.com/auth/spreadsheets`,
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error setting access token: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  },
};
