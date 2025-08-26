import { schema as gdriveSearchSchema, search } from './gdrive_search.js';
import { schema as gdriveReadFileSchema, readFile } from './gdrive_read_file.js';
import { schema as gsheetsUpdateCellSchema, updateCell } from './gsheets_update_cell.js';
import { schema as gsheetsReadSchema, readSheet } from './gsheets_read.js';
import { schema as gdriveCreateFileSchema, createFile } from './gdrive_create_file.js';
import { schema as gdriveCreateFolderSchema, createFolder } from './gdrive_create_folder.js';
import { schema as gdriveDeleteFileSchema, deleteFile } from './gdrive_delete_file.js';
import { schema as gdriveShareFileSchema, shareFile } from './gdrive_share_file.js';
import { 
  Tool, 
  GDriveSearchInput, 
  GDriveReadFileInput, 
  GSheetsUpdateCellInput,
  GSheetsReadInput,
  GDriveCreateFileInput,
  GDriveCreateFolderInput,
  GDriveDeleteFileInput,
  GDriveShareFileInput
} from './types.js';

export const tools: [
  Tool<GDriveSearchInput>,
  Tool<GDriveReadFileInput>, 
  Tool<GSheetsUpdateCellInput>,
  Tool<GSheetsReadInput>,
  Tool<GDriveCreateFileInput>,
  Tool<GDriveCreateFolderInput>,
  Tool<GDriveDeleteFileInput>,
  Tool<GDriveShareFileInput>
] = [
  {
    ...gdriveSearchSchema,
    handler: search,
  },
  {
    ...gdriveReadFileSchema,
    handler: readFile,
  },
  {
    ...gsheetsUpdateCellSchema,
    handler: updateCell,
  },
  {
    ...gsheetsReadSchema,
    handler: readSheet,
  },
  {
    ...gdriveCreateFileSchema,
    handler: createFile,
  },
  {
    ...gdriveCreateFolderSchema,
    handler: createFolder,
  },
  {
    ...gdriveDeleteFileSchema,
    handler: deleteFile,
  },
  {
    ...gdriveShareFileSchema,
    handler: shareFile,
  }
];