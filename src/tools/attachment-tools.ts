import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { VikunjaClient } from '../client.js';

export function attachmentTools(server: McpServer, client: VikunjaClient): void {
  server.registerTool('vikunja_list_attachments', {
    description: 'List all attachments on a task',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
    },
  }, async ({ task_id }) => {
    const attachments = await client.listAttachments(task_id);
    if (!attachments.length) return { content: [{ type: 'text', text: 'No attachments on this task.' }] };

    const lines = attachments.map(a => {
      const size = a.file.size < 1024 ? `${a.file.size}B` : `${Math.round(a.file.size / 1024)}KB`;
      return `[${a.id}] ${a.file.name} (${a.file.mime}, ${size})`;
    }).join('\n');

    return {
      content: [{ type: 'text', text: `${attachments.length} attachment(s) on task #${task_id}:\n${lines}` }],
    };
  });

  server.registerTool('vikunja_upload_attachment', {
    description: 'Upload a file attachment to a task. Provide the file content as base64-encoded string.',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
      file_name: z.string().describe('File name (e.g., "report.pdf")'),
      file_content_base64: z.string().describe('File content encoded as base64 string'),
      mime_type: z.string().optional().describe('MIME type (default: application/octet-stream)'),
    },
  }, async ({ task_id, file_name, file_content_base64, mime_type }: { task_id: number; file_name: string; file_content_base64: string; mime_type?: string }) => {
    const buffer = Buffer.from(file_content_base64, 'base64');
    const attachment = await client.uploadAttachment(task_id, file_name, buffer, mime_type || 'application/octet-stream');
    return {
      content: [{ type: 'text', text: `Uploaded attachment [${attachment.id}] "${file_name}" to task #${task_id}` }],
    };
  });

  server.registerTool('vikunja_delete_attachment', {
    description: 'Delete an attachment from a task',
    inputSchema: {
      task_id: z.number().describe('Task ID'),
      attachment_id: z.number().describe('Attachment ID'),
    },
  }, async ({ task_id, attachment_id }) => {
    await client.deleteAttachment(task_id, attachment_id);
    return {
      content: [{ type: 'text', text: `Deleted attachment #${attachment_id} from task #${task_id}` }],
    };
  });
}
