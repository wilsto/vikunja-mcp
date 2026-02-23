# vikunja-mcp

MCP server for [Vikunja](https://vikunja.io), the open-source task management app. Provides 25 tools for managing projects, views, kanban buckets, tasks, and labels through Claude Code or any MCP-compatible client.

## Setup

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VIKUNJA_URL` | Yes | Your Vikunja instance URL (e.g., `https://vikunja.example.com`) |
| `VIKUNJA_API_TOKEN` | Yes | API token from Vikunja Settings > API Tokens |

### Claude Code Configuration

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "vikunja": {
      "command": "npx",
      "args": ["-y", "vikunja-mcp"],
      "env": {
        "VIKUNJA_URL": "https://vikunja.example.com",
        "VIKUNJA_API_TOKEN": "tk_your_token_here"
      }
    }
  }
}
```

Or run from a local clone:

```json
{
  "mcpServers": {
    "vikunja": {
      "command": "node",
      "args": ["/path/to/vikunja-mcp/dist/index.js"],
      "env": {
        "VIKUNJA_URL": "https://vikunja.example.com",
        "VIKUNJA_API_TOKEN": "tk_your_token_here"
      }
    }
  }
}
```

## Tools (25)

### Projects
- **vikunja_list_projects** — List all projects
- **vikunja_create_project** — Create a project (supports nesting via `parent_project_id`)
- **vikunja_update_project** — Update project title, description, archive status
- **vikunja_delete_project** — Delete a project and all its tasks

### Views
- **vikunja_list_views** — List all views for a project (list, kanban, table, gantt)
- **vikunja_create_view** — Create a new view (view kinds: "list", "gantt", "table", "kanban")
- **vikunja_update_view** — Update a view's title, filter, or bucket configuration
- **vikunja_delete_view** — Delete a project view

### Buckets (Kanban)
- **vikunja_list_buckets** — List all buckets (columns) in a kanban view
- **vikunja_create_bucket** — Create a new bucket with optional WIP limit
- **vikunja_update_bucket** — Update a bucket's title, WIP limit, or position
- **vikunja_delete_bucket** — Delete a bucket from a kanban view
- **vikunja_move_task_to_bucket** — Move a task to a different bucket (column)

### Tasks
- **vikunja_list_tasks** — List tasks across all projects (search, filter, sort, paginate)
- **vikunja_list_project_tasks** — List tasks in a specific project
- **vikunja_get_task** — Get full task details
- **vikunja_create_task** — Create a task in a project
- **vikunja_update_task** — Update task fields
- **vikunja_complete_task** — Mark a task as done
- **vikunja_delete_task** — Delete a task
- **vikunja_bulk_create_tasks** — Create multiple tasks at once

### Labels
- **vikunja_list_labels** — List all labels
- **vikunja_create_label** — Create a label with optional color
- **vikunja_add_label_to_task** — Assign a label to a task
- **vikunja_remove_label_from_task** — Remove a label from a task

## Build from Source

```bash
git clone https://github.com/jrejaud/vikunja-mcp.git
cd vikunja-mcp
npm install
npm run build
```

## API Notes

This MCP wraps the [Vikunja REST API v1](https://vikunja.io/docs/api/). A few quirks:

- Vikunja uses **PUT for creation** and **POST for updates** (opposite of typical REST)
- Listing tasks in a project requires a View ID — the MCP handles this automatically by fetching the first view
- Since Vikunja v0.22, **buckets are view-level** (not project-level). Use `vikunja_list_views` to find kanban views, then operate on their buckets
- Dates use ISO 8601 format: `2026-03-15T00:00:00Z`
- API tokens can be created in Vikunja under Settings > API Tokens

## License

MIT
