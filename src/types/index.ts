export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  deadline?: Date;
  completed: boolean;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'skipped';
  createdAt: Date;
}

export interface ScheduleBlock {
  id: string;
  type: 'task' | 'break' | 'deep-work' | 'buffer';
  taskId?: string;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  color: string;
}

export interface Analytics {
  totalTasks: number;
  completedTasks: number;
  totalTimeScheduled: number;
  totalTimeCompleted: number;
  productivityScore: number;
  categoriesData: { category: string; time: number; color: string }[];
  weeklyProgress: { day: string; completed: number; scheduled: number }[];
  priorityDistribution: { priority: string; count: number; color: string }[];
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  type: 'work' | 'short-break' | 'long-break';
  duration: number;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}