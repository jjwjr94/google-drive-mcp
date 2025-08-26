import { google } from "googleapis";
import { InternalToolResponse } from "./types.js";

export const schema = {
  name: "gdrive_share_file",
  description: "Share a file with specific permissions in Google Drive",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to share",
      },
      emailAddress: {
        type: "string",
        description: "Email address of the person to share with",
      },
      role: {
        type: "string",
        description: "Role to assign (reader, writer, owner, commenter)",
        enum: ["reader", "writer", "owner", "commenter"],
      },
      type: {
        type: "string",
        description: "Type of permission (user, group, domain, anyone)",
        enum: ["user", "group", "domain", "anyone"],
        default: "user",
      },
      sendNotificationEmail: {
        type: "boolean",
        description: "Whether to send notification email",
        default: true,
      },
    },
    required: ["fileId", "emailAddress", "role"],
  },
} as const;

const drive = google.drive("v3");

export async function shareFile(args: {
  fileId: string;
  emailAddress: string;
  role: string;
  type?: string;
  sendNotificationEmail?: boolean;
}): Promise<InternalToolResponse> {
  try {
    const permission = {
      type: args.type || "user",
      role: args.role,
      emailAddress: args.emailAddress,
    };

    const result = await drive.permissions.create({
      fileId: args.fileId,
      requestBody: permission,
      sendNotificationEmail: args.sendNotificationEmail !== false,
      fields: "id,emailAddress,role,type",
    });

    return {
      content: [
        {
          type: "text",
          text: `File shared successfully!\n\nPermission ID: ${result.data.id}\nEmail: ${result.data.emailAddress}\nRole: ${result.data.role}\nType: ${result.data.type}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error sharing file: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
