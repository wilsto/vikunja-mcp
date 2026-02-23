import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { VikunjaClient } from '../client.js';
import { projectTools } from './project-tools.js';
import { viewTools } from './view-tools.js';
import { bucketTools } from './bucket-tools.js';
import { taskTools } from './task-tools.js';
import { labelTools } from './label-tools.js';

export function registerTools(server: McpServer, client: VikunjaClient): void {
  projectTools(server, client);
  viewTools(server, client);
  bucketTools(server, client);
  taskTools(server, client);
  labelTools(server, client);
}
