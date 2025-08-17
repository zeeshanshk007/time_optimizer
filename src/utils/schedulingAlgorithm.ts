import { Task, ScheduleBlock } from '../types';

export interface ScheduleConfig {
  workDayStart: number; // hour (0-23)
  workDayEnd: number; // hour (0-23)
  breakDuration: number; // minutes
  deepWorkSessionMin: number; // minutes
  bufferTime: number; // minutes between tasks
}

const DEFAULT_CONFIG: ScheduleConfig = {
  workDayStart: 9,
  workDayEnd: 18,
  breakDuration: 15,
  deepWorkSessionMin: 90,
  bufferTime: 10,
};

export class IntelligentScheduler {
  private config: ScheduleConfig;

  constructor(config: Partial<ScheduleConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main scheduling algorithm using priority-based greedy approach
   */
  generateOptimalSchedule(tasks: Task[], targetDate: Date = new Date()): ScheduleBlock[] {
    const schedule: ScheduleBlock[] = [];
    const availableTasks = tasks.filter(task => !task.completed && task.status !== 'skipped');
    
    // Sort tasks by priority and deadline
    const sortedTasks = this.prioritizeTasks(availableTasks, targetDate);
    
    // Create time slots for the day
    const timeSlots = this.generateTimeSlots(targetDate);
    let currentTime = timeSlots.start;
    
    for (const task of sortedTasks) {
      // Check if we can fit this task today
      if (this.canFitTask(task, currentTime, timeSlots.end)) {
        // Add buffer time before task
        if (schedule.length > 0) {
          const bufferBlock = this.createBufferBlock(currentTime, this.config.bufferTime);
          schedule.push(bufferBlock);
          currentTime = new Date(currentTime.getTime() + this.config.bufferTime * 60000);
        }

        // Schedule the task
        const taskBlock = this.createTaskBlock(task, currentTime);
        schedule.push(taskBlock);
        currentTime = new Date(currentTime.getTime() + task.duration * 60000);

        // Add break after long tasks
        if (task.duration >= this.config.deepWorkSessionMin) {
          const breakBlock = this.createBreakBlock(currentTime, this.config.breakDuration);
          schedule.push(breakBlock);
          currentTime = new Date(currentTime.getTime() + this.config.breakDuration * 60000);
        }
      }
    }

    return schedule;
  }

  /**
   * Dynamic rescheduling when tasks are delayed or skipped
   */
  rescheduleFromCurrentTime(
    currentSchedule: ScheduleBlock[],
    currentTime: Date,
    updatedTasks: Task[]
  ): ScheduleBlock[] {
    const completedBlocks = currentSchedule.filter(block => 
      block.endTime <= currentTime
    );

    const remainingTasks = updatedTasks.filter(task => 
      !task.completed && task.status !== 'skipped'
    );

    const newSchedule = this.generateOptimalSchedule(remainingTasks, currentTime);
    
    return [...completedBlocks, ...newSchedule];
  }

  private prioritizeTasks(tasks: Task[], referenceDate: Date): Task[] {
    return tasks.sort((a, b) => {
      // Priority scoring system
      const priorityScores = { urgent: 4, high: 3, medium: 2, low: 1 };
      
      const aScore = priorityScores[a.priority];
      const bScore = priorityScores[b.priority];
      
      // Factor in deadline urgency
      const aDeadlineScore = this.calculateDeadlineUrgency(a, referenceDate);
      const bDeadlineScore = this.calculateDeadlineUrgency(b, referenceDate);
      
      const aTotalScore = aScore * 0.6 + aDeadlineScore * 0.4;
      const bTotalScore = bScore * 0.6 + bDeadlineScore * 0.4;
      
      return bTotalScore - aTotalScore;
    });
  }

  private calculateDeadlineUrgency(task: Task, referenceDate: Date): number {
    if (!task.deadline) return 1;
    
    const timeUntilDeadline = task.deadline.getTime() - referenceDate.getTime();
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
    
    if (hoursUntilDeadline <= 24) return 4; // Very urgent
    if (hoursUntilDeadline <= 72) return 3; // Urgent
    if (hoursUntilDeadline <= 168) return 2; // Moderate
    return 1; // Not urgent
  }

  private generateTimeSlots(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setHours(this.config.workDayStart, 0, 0, 0);
    
    const end = new Date(date);
    end.setHours(this.config.workDayEnd, 0, 0, 0);
    
    return { start, end };
  }

  private canFitTask(task: Task, startTime: Date, endTime: Date): boolean {
    const taskEndTime = new Date(startTime.getTime() + task.duration * 60000);
    return taskEndTime <= endTime;
  }

  private createTaskBlock(task: Task, startTime: Date): ScheduleBlock {
    const endTime = new Date(startTime.getTime() + task.duration * 60000);
    
    return {
      id: `task-${task.id}`,
      type: 'task',
      taskId: task.id,
      title: task.title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: task.duration,
      color: this.getPriorityColor(task.priority),
    };
  }

  private createBreakBlock(startTime: Date, duration: number): ScheduleBlock {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    return {
      id: `break-${Date.now()}`,
      type: 'break',
      title: 'Break',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      color: '#10B981',
    };
  }

  private createBufferBlock(startTime: Date, duration: number): ScheduleBlock {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    return {
      id: `buffer-${Date.now()}`,
      type: 'buffer',
      title: 'Buffer Time',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      color: '#6B7280',
    };
  }

  private getPriorityColor(priority: Task['priority']): string {
    const colors = {
      urgent: '#EF4444',
      high: '#F97316',
      medium: '#3B82F6',
      low: '#10B981',
    };
    return colors[priority];
  }
}