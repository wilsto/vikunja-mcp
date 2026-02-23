import type { VikunjaProject, VikunjaTask, VikunjaLabel, VikunjaView, VikunjaBucket } from './types.js';

export class VikunjaClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    const url = process.env.VIKUNJA_URL;
    const token = process.env.VIKUNJA_API_TOKEN;

    if (!url) throw new Error('VIKUNJA_URL environment variable is required');
    if (!token) throw new Error('VIKUNJA_API_TOKEN environment variable is required');

    this.baseUrl = url.replace(/\/$/, '') + '/api/v1';
    this.token = token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Vikunja API error ${response.status}: ${text}`);
    }

    if (response.status === 204) return {} as T;

    return response.json() as Promise<T>;
  }

  // Projects
  async listProjects(): Promise<VikunjaProject[]> {
    return this.request<VikunjaProject[]>('GET', '/projects');
  }

  async getProject(id: number): Promise<VikunjaProject> {
    return this.request<VikunjaProject>('GET', `/projects/${id}`);
  }

  async createProject(data: { title: string; description?: string; parent_project_id?: number; hex_color?: string }): Promise<VikunjaProject> {
    return this.request<VikunjaProject>('PUT', '/projects', data);
  }

  async updateProject(id: number, data: Partial<{ title: string; description: string; is_archived: boolean; hex_color: string }>): Promise<VikunjaProject> {
    return this.request<VikunjaProject>('POST', `/projects/${id}`, data);
  }

  async deleteProject(id: number): Promise<void> {
    await this.request<{ message: string }>('DELETE', `/projects/${id}`);
  }

  // Views (needed for listing tasks in a project)
  async getProjectViews(projectId: number): Promise<VikunjaView[]> {
    return this.request<VikunjaView[]>('GET', `/projects/${projectId}/views`);
  }

  async createView(projectId: number, data: { title: string; view_kind: number; filter?: string; bucket_configuration_mode?: number; default_bucket_id?: number; done_bucket_id?: number }): Promise<VikunjaView> {
    return this.request<VikunjaView>('PUT', `/projects/${projectId}/views`, data);
  }

  async updateView(projectId: number, viewId: number, data: Partial<{ title: string; filter: string; position: number; bucket_configuration_mode: number; default_bucket_id: number; done_bucket_id: number }>): Promise<VikunjaView> {
    return this.request<VikunjaView>('POST', `/projects/${projectId}/views/${viewId}`, data);
  }

  async deleteView(projectId: number, viewId: number): Promise<void> {
    await this.request<{ message: string }>('DELETE', `/projects/${projectId}/views/${viewId}`);
  }

  // Buckets
  async listBuckets(projectId: number, viewId: number): Promise<VikunjaBucket[]> {
    return this.request<VikunjaBucket[]>('GET', `/projects/${projectId}/views/${viewId}/buckets`);
  }

  async createBucket(projectId: number, viewId: number, data: { title: string; limit?: number }): Promise<VikunjaBucket> {
    return this.request<VikunjaBucket>('PUT', `/projects/${projectId}/views/${viewId}/buckets`, data);
  }

  async updateBucket(projectId: number, viewId: number, bucketId: number, data: Partial<{ title: string; limit: number; position: number }>): Promise<VikunjaBucket> {
    return this.request<VikunjaBucket>('POST', `/projects/${projectId}/views/${viewId}/buckets/${bucketId}`, data);
  }

  async deleteBucket(projectId: number, viewId: number, bucketId: number): Promise<void> {
    await this.request<{ message: string }>('DELETE', `/projects/${projectId}/views/${viewId}/buckets/${bucketId}`);
  }

  async moveTaskToBucket(projectId: number, viewId: number, data: { task_id: number; bucket_id: number }): Promise<void> {
    await this.request<unknown>('POST', `/projects/${projectId}/views/${viewId}/buckets/tasks`, data);
  }

  // Tasks
  async listTasks(params?: { page?: number; per_page?: number; s?: string; sort_by?: string; order_by?: string; filter?: string }): Promise<VikunjaTask[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.s) query.set('s', params.s);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.order_by) query.set('order_by', params.order_by);
    if (params?.filter) query.set('filter', params.filter);
    const qs = query.toString();
    return this.request<VikunjaTask[]>('GET', `/tasks${qs ? '?' + qs : ''}`);
  }

  async listProjectTasks(projectId: number, viewId: number, params?: { page?: number; per_page?: number; filter?: string }): Promise<VikunjaTask[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.filter) query.set('filter', params.filter);
    const qs = query.toString();
    return this.request<VikunjaTask[]>('GET', `/projects/${projectId}/views/${viewId}/tasks${qs ? '?' + qs : ''}`);
  }

  async getTask(id: number): Promise<VikunjaTask> {
    return this.request<VikunjaTask>('GET', `/tasks/${id}`);
  }

  async createTask(projectId: number, data: { title: string; description?: string; done?: boolean; priority?: number; due_date?: string; hex_color?: string }): Promise<VikunjaTask> {
    return this.request<VikunjaTask>('PUT', `/projects/${projectId}/tasks`, data);
  }

  async updateTask(id: number, data: Partial<{ title: string; description: string; done: boolean; priority: number; due_date: string; hex_color: string }>): Promise<VikunjaTask> {
    return this.request<VikunjaTask>('POST', `/tasks/${id}`, data);
  }

  async deleteTask(id: number): Promise<void> {
    await this.request<{ message: string }>('DELETE', `/tasks/${id}`);
  }

  // Labels
  async listLabels(): Promise<VikunjaLabel[]> {
    return this.request<VikunjaLabel[]>('GET', '/labels');
  }

  async createLabel(data: { title: string; hex_color?: string; description?: string }): Promise<VikunjaLabel> {
    return this.request<VikunjaLabel>('PUT', '/labels', data);
  }

  async addLabelToTask(taskId: number, labelId: number): Promise<VikunjaLabel> {
    return this.request<VikunjaLabel>('PUT', `/tasks/${taskId}/labels`, { label_id: labelId });
  }

  async removeLabelFromTask(taskId: number, labelId: number): Promise<void> {
    await this.request<{ message: string }>('DELETE', `/tasks/${taskId}/labels/${labelId}`);
  }
}
