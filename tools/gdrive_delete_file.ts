import { google } from "googleapis";
import { InternalToolResponse } from "./types.js";

export const schema = {
  name: "gdrive_delete_file",
  description: "Delete a file from Google Drive",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to delete",
      },
    },
    required: ["fileId"],
  },
} as const;

const drive = google.drive("v3");

export async function deleteFile(args: {
  fileId: string;
}): Promise<InternalToolResponse> {
  try {
    await drive.files.delete({
      fileId: args.fileId,
    });

    return {
      content: [
        {
          type: "text",
          text: `File with ID ${args.fileId} has been deleted successfully.`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting file: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
