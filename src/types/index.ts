export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress: number;
  budget: number;
  spent?: number;
  start_date: string;
  end_date: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
  project_name?: string;
  assignee?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  status: string;
  phone: string;
  email: string;
  hourly_rate: number;
  weekly_hours: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  date: string;
  injuries: number;
  project_name: string;
}

export interface Inspection {
  id: string;
  title: string;
  inspector_name: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  date: string;
  project_name: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'task' | 'project' | 'safety' | 'team' | 'general';
  read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  active_workers: number;
  pending_tasks: number;
  critical_incidents: number;
  total_budget: number;
  completed_tasks: number;
  total_tasks: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
}
