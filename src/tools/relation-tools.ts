import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { VikunjaClient } from '../client.js';

const relationKinds = [
  'subtask', 'parenttask', 'related', 'duplicateof', 'duplicates',
  'blocking', 'blocked', 'precedes', 'follows', 'copiedfrom', 'copiedto',
] as const;

export function relationTools(server: McpServer, client: VikunjaClient): void {
  // @ts-expect-error TS2589 - MCP SDK deep type instantiation with Zod enum schemas
  server.registerTool('vikunja_create_relation', {
    description: 'Create a relation between two tasks. Kinds: subtask, parenttask, related, duplicateof, duplicates, blocking, blocked, precedes, follows, copiedfrom, copiedto',
    inputSchema: {
      task_id: z.number().describe('Source task ID'),
      other_task_id: z.number().describe('Target task ID'),
      relation_kind: z.enum(relationKinds).describe('Relation kind'),
    },
  }, async ({ task_id, other_task_id, relation_kind }) => {
    await client.createRelation(task_id, other_task_id, relation_kind);
    return {
      content: [{ type: 'text', text: `Created relation: task #${task_id} —[${relation_kind}]→ task #${other_task_id}` }],
    };
  });

  server.registerTool('vikunja_delete_relation', {
    description: 'Remove a relation between two tasks',
    inputSchema: {
      task_id: z.number().describe('Source task ID'),
      other_task_id: z.number().describe('Target task ID'),
      relation_kind: z.enum(relationKinds).describe('Relation kind to remove'),
    },
  }, async ({ task_id, other_task_id, relation_kind }) => {
    await client.deleteRelation(task_id, relation_kind, other_task_id);
    return {
      content: [{ type: 'text', text: `Deleted relation: task #${task_id} —[${relation_kind}]→ task #${other_task_id}` }],
    };
  });
}
