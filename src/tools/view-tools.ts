import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { VikunjaClient } from '../client.js';

const VIEW_KINDS: Record<number, string> = { 0: 'list', 1: 'gantt', 2: 'table', 3: 'kanban' };

export function viewTools(server: McpServer, client: VikunjaClient): void {
  server.registerTool('vikunja_list_views', {
    description: 'List all views for a project (list, kanban, table, gantt)',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
    },
  }, async ({ project_id }) => {
    const views = await client.getProjectViews(project_id);
    if (!views.length) return { content: [{ type: 'text', text: 'No views found for this project.' }] };

    const lines = views.map(v => {
      const kind = VIEW_KINDS[v.view_kind] ?? `unknown(${v.view_kind})`;
      const defaultBucket = v.default_bucket_id ? ` default_bucket:#${v.default_bucket_id}` : '';
      const doneBucket = v.done_bucket_id ? ` done_bucket:#${v.done_bucket_id}` : '';
      return `[${v.id}] "${v.title}" (${kind})${defaultBucket}${doneBucket}`;
    }).join('\n');

    return {
      content: [{ type: 'text', text: `${views.length} view(s) in project #${project_id}:\n${lines}` }],
    };
  });

  server.registerTool('vikunja_create_view', {
    description: 'Create a new view in a project. View kinds: 0=list, 1=gantt, 2=table, 3=kanban',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
      title: z.string().describe('View title'),
      view_kind: z.number().describe('View kind: 0=list, 1=gantt, 2=table, 3=kanban'),
      filter: z.string().optional().describe('Filter string for this view'),
    },
  }, async ({ project_id, ...data }) => {
    const view = await client.createView(project_id, data);
    const kind = VIEW_KINDS[view.view_kind] ?? `unknown(${view.view_kind})`;
    return {
      content: [{ type: 'text', text: `Created view [${view.id}] "${view.title}" (${kind}) in project #${project_id}` }],
    };
  });

  server.registerTool('vikunja_update_view', {
    description: 'Update a project view (title, filter, bucket configuration)',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
      view_id: z.number().describe('View ID'),
      title: z.string().optional().describe('New title'),
      filter: z.string().optional().describe('New filter string'),
      default_bucket_id: z.number().optional().describe('Default bucket ID for new tasks'),
      done_bucket_id: z.number().optional().describe('Bucket ID where completed tasks go'),
    },
  }, async ({ project_id, view_id, ...data }) => {
    const view = await client.updateView(project_id, view_id, data);
    return {
      content: [{ type: 'text', text: `Updated view [${view.id}] "${view.title}"` }],
    };
  });

  server.registerTool('vikunja_delete_view', {
    description: 'Delete a project view',
    inputSchema: {
      project_id: z.number().describe('Project ID'),
      view_id: z.number().describe('View ID to delete'),
    },
  }, async ({ project_id, view_id }) => {
    await client.deleteView(project_id, view_id);
    return {
      content: [{ type: 'text', text: `Deleted view #${view_id} from project #${project_id}` }],
    };
  });
}
