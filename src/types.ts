export interface VikunjaProject {
  id: number;
  title: string;
  description: string;
  identifier: string;
  hex_color: string;
  parent_project_id: number;
  is_archived: boolean;
  is_favorite: boolean;
  position: number;
  created: string;
  updated: string;
  owner?: VikunjaUser;
  views?: VikunjaView[];
}

export interface VikunjaTask {
  id: number;
  title: string;
  description: string;
  done: boolean;
  done_at: string;
  due_date: string;
  priority: number;
  start_date: string;
  end_date: string;
  percent_done: number;
  hex_color: string;
  identifier: string;
  index: number;
  position: number;
  project_id: number;
  bucket_id: number;
  repeat_after: number;
  repeat_mode: number;
  is_favorite: boolean;
  labels: VikunjaLabel[] | null;
  assignees: VikunjaUser[];
  related_tasks: Record<string, VikunjaTask[]> | null;
  attachments: unknown[] | null;
  comment_count: number;
  created: string;
  updated: string;
  created_by: VikunjaUser;
}

export interface VikunjaLabel {
  id: number;
  title: string;
  description: string;
  hex_color: string;
  created_by: VikunjaUser;
  created: string;
  updated: string;
}

export interface VikunjaUser {
  id: number;
  name: string;
  username: string;
  created: string;
  updated: string;
}

export interface VikunjaView {
  id: number;
  title: string;
  project_id: number;
  view_kind: string;
  position: number;
  filter?: string;
  bucket_configuration_mode?: string;
  default_bucket_id?: number;
  done_bucket_id?: number;
  created?: string;
  updated?: string;
}

export interface VikunjaTaskBucket {
  task_id: number;
  bucket_id: number;
  project_view_id: number;
  task_done?: boolean;
}

export interface VikunjaComment {
  id: number;
  comment: string;
  author: VikunjaUser;
  created: string;
  updated: string;
}

export interface VikunjaTaskRelation {
  task_id: number;
  other_task_id: number;
  relation_kind: string;
  created_by?: VikunjaUser;
  created?: string;
}

export interface VikunjaBucket {
  id: number;
  title: string;
  position: number;
  limit: number;
  count: number;
  created: string;
  updated: string;
  created_by: VikunjaUser;
}
