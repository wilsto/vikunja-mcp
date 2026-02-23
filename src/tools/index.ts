import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { VikunjaClient } from '../client.js';
import { projectTools } from './project-tools.js';
import { viewTools } from './view-tools.js';
import { bucketTools } from './bucket-tools.js';
import { taskTools } from './task-tools.js';
import { labelTools } from './label-tools.js';
import { commentTools } from './comment-tools.js';
import { relationTools } from './relation-tools.js';
import { assigneeTools } from './assignee-tools.js';
import { attachmentTools } from './attachment-tools.js';

export function registerTools(server: McpServer, client: VikunjaClient): void {
  projectTools(server, client);
  viewTools(server, client);
  bucketTools(server, client);
  taskTools(server, client);
  labelTools(server, client);
  commentTools(server, client);
  relationTools(server, client);
  assigneeTools(server, client);
  attachmentTools(server, client);
}
