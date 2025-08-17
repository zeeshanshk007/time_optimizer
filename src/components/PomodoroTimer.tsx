import React from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { usePomodoro } from '../hooks/usePomodoro';

interface PomodoroTimerProps {
  activeTaskId?: string;
}

export function PomodoroTimer({ activeTaskId }: PomodoroTimerProps) {
  const {
    currentSession,
    timeRemaining,
    isActive,
    sessionCount,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    formatTime,
  } = usePomodoro();

  const getNextSessionType = () => {
    if (sessionCount > 0 && sessionCount % 4 === 0) {
      return 'long-break';
    }
    return currentSession?.type === 'work' ? 'short-break' : 'work';
  };

  const progress = currentSession 
    ? ((currentSession.duration - timeRemaining) / currentSession.duration) * 100
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Focus Timer</h2>
        
        {currentSession ? (
          <div className="mb-6">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  className={
                    currentSession.type === 'work' 
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                {currentSession.type === 'work' ? '🍅 Work Session' : 
                 currentSession.type === 'short-break' ? '☕ Short Break' : 
                 '🌴 Long Break'}
              </p>
              <p className="text-xs text-gray-500">
                Session {sessionCount + 1}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🍅</span>
            </div>
            <p className="text-gray-600">Ready to start a focus session?</p>
          </div>
        )}

        <div className="flex justify-center gap-3 mb-6">
          {!currentSession ? (
            <>
              <button
                onClick={() => startSession('work', activeTaskId)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Play size={16} />
                Start Work (25m)
              </button>
              <button
                onClick={() => startSession('short-break')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play size={16} />
                Short Break (5m)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={isActive ? pauseSession : resumeSession}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
                {isActive ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={stopSession}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Square size={16} />
                Stop
              </button>
            </>
          )}
        </div>

        {sessionCount > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Completed sessions today: <span className="font-semibold">{sessionCount}</span>
            </p>
            <button
              onClick={() => {
                const nextType = getNextSessionType();
                startSession(nextType, nextType === 'work' ? activeTaskId : undefined);
              }}
              className="flex items-center gap-2 mx-auto px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              Start {getNextSessionType().replace('-', ' ')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}