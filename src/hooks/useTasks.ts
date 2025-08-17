import { useState, useCallback, useEffect } from 'react';
import { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'time-optimizer-tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTasks = JSON.parse(stored);
        return parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          deadline: task.deadline ? new Date(task.deadline) : undefined,
          scheduledStart: task.scheduledStart ? new Date(task.scheduledStart) : undefined,
          scheduledEnd: task.scheduledEnd ? new Date(task.scheduledEnd) : undefined,
          actualStart: task.actualStart ? new Date(task.actualStart) : undefined,
          actualEnd: task.actualEnd ? new Date(task.actualEnd) : undefined,
        }));
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'completed' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      completed: false,
      status: 'pending',
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const isCompleting = !task.completed;
        return {
          ...task,
          completed: isCompleting,
          status: isCompleting ? 'completed' : 'pending',
          actualEnd: isCompleting ? new Date() : undefined,
        };
      }
      return task;
    }));
  }, []);

  const markTaskInProgress = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, status: 'in-progress', actualStart: new Date() }
        : task
    ));
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    markTaskInProgress,
  };
}