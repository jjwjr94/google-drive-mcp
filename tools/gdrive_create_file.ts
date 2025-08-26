import { google } from "googleapis";
import { InternalToolResponse } from "./types.js";

export const schema = {
  name: "gdrive_create_file",
  description: "Create a new file in Google Drive",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the file to create",
      },
      mimeType: {
        type: "string",
        description: "MIME type of the file (e.g., 'text/plain', 'application/vnd.google-apps.document')",
      },
      content: {
        type: "string",
        description: "Content of the file (for text files)",
        optional: true,
      },
      parentFolderId: {
        type: "string",
        description: "ID of the parent folder (optional, defaults to root)",
        optional: true,
      },
    },
    required: ["name", "mimeType"],
  },
} as const;

const drive = google.drive("v3");

export async function createFile(args: {
  name: string;
  mimeType: string;
  content?: string;
  parentFolderId?: string;
}): Promise<InternalToolResponse> {
  try {
    const fileMetadata: any = {
      name: args.name,
      mimeType: args.mimeType,
    };

    if (args.parentFolderId) {
      fileMetadata.parents = [args.parentFolderId];
    }

    let media: any = null;
    if (args.content && !args.mimeType.startsWith("application/vnd.google-apps")) {
      media = {
        mimeType: args.mimeType,
        body: args.content,
      };
    }

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id,name,mimeType,webViewLink",
    });

    return {
      content: [
        {
          type: "text",
          text: `File created successfully!\n\nName: ${file.data.name}\nID: ${file.data.id}\nType: ${file.data.mimeType}\nLink: ${file.data.webViewLink}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating file: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
