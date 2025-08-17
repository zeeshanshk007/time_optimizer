import React, { useMemo } from 'react';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { Task, ScheduleBlock } from '../types';
import { IntelligentScheduler } from '../utils/schedulingAlgorithm';

interface ScheduleViewProps {
  tasks: Task[];
  onReschedule: () => void;
}

export function ScheduleView({ tasks, onReschedule }: ScheduleViewProps) {
  const scheduler = useMemo(() => new IntelligentScheduler(), []);
  
  const schedule = useMemo(() => {
    return scheduler.generateOptimalSchedule(tasks);
  }, [tasks, scheduler]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getBlockIcon = (type: ScheduleBlock['type']) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'break':
        return '☕';
      case 'deep-work':
        return '🧠';
      case 'buffer':
        return '⏱️';
      default:
        return '📋';
    }
  };

  const totalScheduledTime = schedule.reduce((sum, block) => sum + block.duration, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <button
            onClick={onReschedule}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Reschedule
          </button>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Total: {formatDuration(totalScheduledTime)}</span>
          </div>
          <div>
            {schedule.filter(block => block.type === 'task').length} tasks scheduled
          </div>
        </div>
      </div>

      <div className="p-6">
        {schedule.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No tasks scheduled for today</p>
            <p className="text-sm text-gray-400">Add some tasks to see your optimized schedule</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                style={{ borderLeftColor: block.color, borderLeftWidth: '4px' }}
              >
                <div className="text-2xl">{getBlockIcon(block.type)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{block.title}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDuration(block.duration)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatTime(block.startTime)} - {formatTime(block.endTime)}
                  </p>
                </div>

                {block.type === 'task' && (
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${block.color}20`, 
                      color: block.color 
                    }}
                  >
                    Task
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}