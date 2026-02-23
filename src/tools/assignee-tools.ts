import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { VikunjaClient } from '../client.js';

export function assigneeTools(server: McpServer, client: VikunjaClient): void {
  server.registerTool('vikunja_list_assignees', {
    description: 'List all users assigned to a task',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
    },
  }, async ({ task_id }) => {
    const assignees = await client.listAssignees(task_id);
    if (!assignees.length) return { content: [{ type: 'text', text: 'No assignees on this task.' }] };

    const lines = assignees.map(u => `[${u.id}] ${u.username}${u.name ? ` (${u.name})` : ''}`).join('\n');
    return {
      content: [{ type: 'text', text: `${assignees.length} assignee(s) on task #${task_id}:\n${lines}` }],
    };
  });

  server.registerTool('vikunja_assign_user', {
    description: 'Assign a user to a task',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
      user_id: z.number().describe('User ID to assign'),
    },
  }, async ({ task_id, user_id }) => {
    await client.assignUser(task_id, user_id);
    return {
      content: [{ type: 'text', text: `Assigned user #${user_id} to task #${task_id}` }],
    };
  });

  server.registerTool('vikunja_unassign_user', {
    description: 'Remove a user from a task',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
      user_id: z.number().describe('User ID to unassign'),
    },
  }, async ({ task_id, user_id }) => {
    await client.unassignUser(task_id, user_id);
    return {
      content: [{ type: 'text', text: `Unassigned user #${user_id} from task #${task_id}` }],
    };
  });
}
