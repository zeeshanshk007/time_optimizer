import { useState, useEffect, useCallback } from 'react';
import { PomodoroSession } from '../types';

export function usePomodoro() {
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            completeCurrentSession();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const startSession = useCallback((type: 'work' | 'short-break' | 'long-break', taskId?: string) => {
    const durations = {
      work: 25 * 60, // 25 minutes
      'short-break': 5 * 60, // 5 minutes
      'long-break': 15 * 60, // 15 minutes
    };

    const session: PomodoroSession = {
      id: `session-${Date.now()}`,
      taskId,
      type,
      duration: durations[type],
      completed: false,
      startTime: new Date(),
    };

    setCurrentSession(session);
    setTimeRemaining(durations[type]);
    setIsActive(true);
  }, []);

  const pauseSession = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeSession = useCallback(() => {
    setIsActive(true);
  }, []);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setCurrentSession(null);
    setTimeRemaining(0);
  }, []);

  const completeCurrentSession = useCallback(() => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        completed: true,
        endTime: new Date(),
      };
      
      if (completedSession.type === 'work') {
        setSessionCount(prev => prev + 1);
      }
      
      setCurrentSession(null);
    }
  }, [currentSession]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    currentSession,
    timeRemaining,
    isActive,
    sessionCount,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    formatTime,
  };
}