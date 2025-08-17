import { Task, Analytics } from '../types';

export class AnalyticsEngine {
  static generateAnalytics(tasks: Task[]): Analytics {
    const completedTasks = tasks.filter(task => task.completed);
    const totalTimeScheduled = tasks.reduce((sum, task) => sum + task.duration, 0);
    const totalTimeCompleted = completedTasks.reduce((sum, task) => sum + task.duration, 0);
    
    const productivityScore = Math.round((totalTimeCompleted / Math.max(totalTimeScheduled, 1)) * 100);

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      totalTimeScheduled,
      totalTimeCompleted,
      productivityScore,
      categoriesData: this.getCategoriesData(tasks),
      weeklyProgress: this.getWeeklyProgress(tasks),
      priorityDistribution: this.getPriorityDistribution(tasks),
    };
  }

  private static getCategoriesData(tasks: Task[]): Analytics['categoriesData'] {
    const categoryMap = new Map<string, number>();
    const colors = ['#3B82F6', '#10B981', '#F97316', '#EF4444', '#8B5CF6', '#F59E0B'];
    
    tasks.forEach(task => {
      if (task.completed) {
        const current = categoryMap.get(task.category) || 0;
        categoryMap.set(task.category, current + task.duration);
      }
    });

    return Array.from(categoryMap.entries()).map(([category, time], index) => ({
      category,
      time,
      color: colors[index % colors.length],
    }));
  }

  private static getWeeklyProgress(tasks: Task[]): Analytics['weeklyProgress'] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);

    return days.map((day, index) => {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + index);
      
      const dayTasks = tasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === currentDay.toDateString();
      });

      const completed = dayTasks.filter(task => task.completed).reduce((sum, task) => sum + task.duration, 0);
      const scheduled = dayTasks.reduce((sum, task) => sum + task.duration, 0);

      return { day, completed: completed / 60, scheduled: scheduled / 60 };
    });
  }

  private static getPriorityDistribution(tasks: Task[]): Analytics['priorityDistribution'] {
    const priorityColors = {
      urgent: '#EF4444',
      high: '#F97316',
      medium: '#3B82F6',
      low: '#10B981',
    };

    const distribution = { urgent: 0, high: 0, medium: 0, low: 0 };
    
    tasks.forEach(task => {
      distribution[task.priority]++;
    });

    return Object.entries(distribution).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
      color: priorityColors[priority as keyof typeof priorityColors],
    }));
  }

  static getSmartRecommendations(tasks: Task[], analytics: Analytics): string[] {
    const recommendations: string[] = [];

    if (analytics.productivityScore < 70) {
      recommendations.push("Consider breaking large tasks into smaller, manageable chunks");
    }

    const urgentTasks = tasks.filter(task => task.priority === 'urgent' && !task.completed);
    if (urgentTasks.length > 0) {
      recommendations.push(`You have ${urgentTasks.length} urgent task(s) pending. Focus on these first.`);
    }

    const overdueTasks = tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      return new Date() > task.deadline;
    });
    
    if (overdueTasks.length > 0) {
      recommendations.push(`${overdueTasks.length} task(s) are overdue. Consider rescheduling or reassessing priorities.`);
    }

    if (analytics.totalTimeScheduled > 480) { // 8 hours
      recommendations.push("You have a heavy workload today. Consider scheduling breaks between intensive tasks.");
    }

    return recommendations;
  }
}