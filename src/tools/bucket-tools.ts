import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { VikunjaClient } from '../client.js';

export function bucketTools(server: McpServer, client: VikunjaClient): void {
  server.registerTool('vikunja_list_buckets', {
    description: 'List all buckets (columns) in a kanban view. Requires a project ID and a kanban view ID.',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
      view_id: z.number().describe('View ID (must be a kanban view)'),
    },
  }, async ({ project_id, view_id }) => {
    const buckets = await client.listBuckets(project_id, view_id);
    if (!buckets.length) return { content: [{ type: 'text', text: 'No buckets found in this view.' }] };

    const lines = buckets.map(b => {
      const limit = b.limit > 0 ? `limit: ${b.limit}` : 'no limit';
      return `[${b.id}] "${b.title}" (${b.count} task(s), ${limit})`;
    }).join('\n');

    return {
      content: [{ type: 'text', text: `${buckets.length} bucket(s) in view #${view_id}:\n${lines}` }],
    };
  });

  server.registerTool('vikunja_create_bucket', {
    description: 'Create a new bucket (column) in a kanban view',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
      view_id: z.number().describe('View ID (must be a kanban view)'),
      title: z.string().describe('Bucket title'),
      limit: z.number().optional().describe('WIP limit (0 or omit for unlimited)'),
    },
  }, async ({ project_id, view_id, ...data }) => {
    const bucket = await client.createBucket(project_id, view_id, data);
    return {
      content: [{ type: 'text', text: `Created bucket [${bucket.id}] "${bucket.title}" in view #${view_id}` }],
    };
  });

  server.registerTool('vikunja_update_bucket', {
    description: 'Update a bucket (title, WIP limit, or position)',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
      view_id: z.number().describe('View ID'),
      bucket_id: z.number().describe('Bucket ID'),
      title: z.string().optional().describe('New title'),
      limit: z.number().optional().describe('New WIP limit (0 for unlimited)'),
      position: z.number().optional().describe('New position'),
    },
  }, async ({ project_id, view_id, bucket_id, ...data }) => {
    const bucket = await client.updateBucket(project_id, view_id, bucket_id, data);
    return {
      content: [{ type: 'text', text: `Updated bucket [${bucket.id}] "${bucket.title}"` }],
    };
  });

  server.registerTool('vikunja_delete_bucket', {
    description: 'Delete a bucket from a kanban view',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
      view_id: z.number().describe('View ID'),
      bucket_id: z.number().describe('Bucket ID to delete'),
    },
  }, async ({ project_id, view_id, bucket_id }) => {
    await client.deleteBucket(project_id, view_id, bucket_id);
    return {
      content: [{ type: 'text', text: `Deleted bucket #${bucket_id} from view #${view_id}` }],
    };
  });

  server.registerTool('vikunja_move_task_to_bucket', {
    description: 'Move a task to a different bucket (column) in a kanban view',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
      view_id: z.number().describe('View ID (must be a kanban view)'),
      task_id: z.number().describe('Task ID to move'),
      bucket_id: z.number().describe('Target bucket ID'),
    },
  }, async ({ project_id, view_id, task_id, bucket_id }) => {
    const result = await client.moveTaskToBucket(project_id, view_id, bucket_id, task_id);
    return {
      content: [{ type: 'text', text: `Moved task #${result.task_id} to bucket #${result.bucket_id} in view #${view_id}` }],
    };
  });
}
