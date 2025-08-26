import { google } from "googleapis";
import { InternalToolResponse } from "./types.js";

export const schema = {
  name: "gdrive_create_folder",
  description: "Create a new folder in Google Drive",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the folder to create",
      },
      parentFolderId: {
        type: "string",
        description: "ID of the parent folder (optional, defaults to root)",
        optional: true,
      },
    },
    required: ["name"],
  },
} as const;

const drive = google.drive("v3");

export async function createFolder(args: {
  name: string;
  parentFolderId?: string;
}): Promise<InternalToolResponse> {
  try {
    const fileMetadata: any = {
      name: args.name,
      mimeType: "application/vnd.google-apps.folder",
    };

    if (args.parentFolderId) {
      fileMetadata.parents = [args.parentFolderId];
    }

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id,name,mimeType,webViewLink",
    });

    return {
      content: [
        {
          type: "text",
          text: `Folder created successfully!\n\nName: ${folder.data.name}\nID: ${folder.data.id}\nLink: ${folder.data.webViewLink}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating folder: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
