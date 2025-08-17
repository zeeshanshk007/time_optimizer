import React from 'react';
import { Clock, Flag, Calendar, Play, Check, Trash2 } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
}

export function TaskCard({ task, onToggleComplete, onDelete, onStart }: TaskCardProps) {
  const priorityColors = {
    urgent: 'border-red-400 bg-red-50',
    high: 'border-orange-400 bg-orange-50',
    medium: 'border-blue-400 bg-blue-50',
    low: 'border-green-400 bg-green-50',
  };

  const priorityTextColors = {
    urgent: 'text-red-800',
    high: 'text-orange-800',
    medium: 'text-blue-800',
    low: 'text-green-800',
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) {
      return 'Overdue';
    } else if (hours < 24) {
      return `${hours}h left`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
  };

  const isOverdue = task.deadline && new Date() > task.deadline && !task.completed;

  return (
    <div
      className={`
        p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md
        ${priorityColors[task.priority]}
        ${task.completed ? 'opacity-70' : ''}
        ${isOverdue ? 'border-red-500 bg-red-100' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-medium text-lg ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3">
          {!task.completed && (
            <button
              onClick={() => onStart(task.id)}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              title="Start working on this task"
            >
              <Play size={16} className="text-gray-600" />
            </button>
          )}
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`
              p-2 rounded-lg transition-colors
              ${task.completed 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'hover:bg-white hover:bg-opacity-50'
              }
            `}
            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-500" />
            <span className="text-gray-600">{formatDuration(task.duration)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Flag size={14} className={priorityTextColors[task.priority]} />
            <span className={`capitalize ${priorityTextColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          
          <div className="px-2 py-1 bg-white bg-opacity-60 rounded-md text-xs font-medium">
            {task.category}
          </div>
        </div>

        {task.deadline && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar size={14} />
            <span className="text-xs">
              {formatDeadline(task.deadline)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}