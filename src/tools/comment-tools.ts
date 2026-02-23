import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { VikunjaClient } from '../client.js';

export function commentTools(server: McpServer, client: VikunjaClient): void {
  server.registerTool('vikunja_list_comments', {
    description: 'List all comments on a task',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
    },
  }, async ({ task_id }) => {
    const comments = await client.listComments(task_id);
    if (!comments.length) return { content: [{ type: 'text', text: 'No comments on this task.' }] };

    const lines = comments.map(c => {
      const date = c.created.slice(0, 10);
      return `[${c.id}] ${c.author.username} (${date}): ${c.comment}`;
    }).join('\n');

    return {
      content: [{ type: 'text', text: `${comments.length} comment(s) on task #${task_id}:\n${lines}` }],
    };
  });

  server.registerTool('vikunja_create_comment', {
    description: 'Add a comment to a task',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
      comment: z.string().describe('Comment text'),
    },
  }, async ({ task_id, comment }) => {
    const created = await client.createComment(task_id, comment);
    return {
      content: [{ type: 'text', text: `Created comment [${created.id}] on task #${task_id}` }],
    };
  });

  server.registerTool('vikunja_update_comment', {
    description: 'Update an existing task comment',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
      comment_id: z.number().describe('Comment ID'),
      comment: z.string().describe('New comment text'),
    },
  }, async ({ task_id, comment_id, comment }) => {
    const updated = await client.updateComment(task_id, comment_id, comment);
    return {
      content: [{ type: 'text', text: `Updated comment [${updated.id}] on task #${task_id}` }],
    };
  });

  server.registerTool('vikunja_delete_comment', {
    description: 'Delete a task comment',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
      comment_id: z.number().describe('Comment ID'),
    },
  }, async ({ task_id, comment_id }) => {
    await client.deleteComment(task_id, comment_id);
    return {
      content: [{ type: 'text', text: `Deleted comment #${comment_id} from task #${task_id}` }],
    };
  });
}
