import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { VikunjaClient } from '../client.js';

export function projectTools(server: McpServer, client: VikunjaClient): void {
  server.registerTool('vikunja_list_projects', {
    description: 'List all projects the user has access to in Vikunja',
  }, async () => {
    const projects = await client.listProjects();
    const summary = projects.map(p => {
      const archived = p.is_archived ? ' [ARCHIVED]' : '';
      const parent = p.parent_project_id ? ` (child of #${p.parent_project_id})` : '';
      return `[${p.id}] ${p.title}${archived}${parent}`;
    }).join('\n');

    return {
      content: [{ type: 'text', text: `${projects.length} project(s):\n${summary}` }],
    };
  });

  server.registerTool('vikunja_create_project', {
    description: 'Create a new project in Vikunja',
    inputSchema: {
      title: z.string().describe('Project title'),
      description: z.string().optional().describe('Project description'),
      parent_project_id: z.number().optional().describe('Parent project ID for nesting'),
      hex_color: z.string().optional().describe('Hex color code (e.g., "#ff0000")'),
    },
  }, async ({ title, description, parent_project_id, hex_color }) => {
    const project = await client.createProject({ title, description, parent_project_id, hex_color });
    return {
      content: [{ type: 'text', text: `Created project [${project.id}] "${project.title}"` }],
    };
  });

  server.registerTool('vikunja_update_project', {
    description: 'Update an existing project in Vikunja',
    inputSchema: {
      id: z.number().describe('Project ID'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      is_archived: z.boolean().optional().describe('Archive or unarchive the project'),
      hex_color: z.string().optional().describe('Hex color code'),
    },
  }, async ({ id, ...data }) => {
    const project = await client.updateProject(id, data);
    return {
      content: [{ type: 'text', text: `Updated project [${project.id}] "${project.title}"` }],
    };
  });

  server.registerTool('vikunja_delete_project', {
    description: 'Delete a project and all its tasks in Vikunja',
    inputSchema: {
      id: z.number().describe('Project ID to delete'),
    },
  }, async ({ id }) => {
    await client.deleteProject(id);
    return {
      content: [{ type: 'text', text: `Deleted project #${id}` }],
    };
  });
}
