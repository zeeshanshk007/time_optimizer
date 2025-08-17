import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  BarChart3, 
  CheckSquare, 
  Clock, 
  Brain,
  Menu,
  X
} from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { ScheduleView } from './components/ScheduleView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AnalyticsEngine } from './utils/analytics';

type ViewType = 'tasks' | 'schedule' | 'analytics' | 'focus';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    markTaskInProgress,
  } = useTasks();

  const analytics = useMemo(() => AnalyticsEngine.generateAnalytics(tasks), [tasks]);
  const recommendations = useMemo(() => AnalyticsEngine.getSmartRecommendations(tasks, analytics), [tasks, analytics]);

  const handleTaskStart = (taskId: string) => {
    setActiveTaskId(taskId);
    markTaskInProgress(taskId);
    setCurrentView('focus');
  };

  const navigation = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'focus', label: 'Focus', icon: Clock },
  ] as const;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            onToggleComplete={toggleTaskComplete}
            onDelete={deleteTask}
            onStart={handleTaskStart}
          />
        );
      case 'schedule':
        return (
          <ScheduleView
            tasks={tasks}
            onReschedule={() => {
              // Force re-render by updating tasks
              const updatedTasks = tasks.map(task => ({ ...task }));
              // This would trigger the schedule recalculation
            }}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard
            analytics={analytics}
            recommendations={recommendations}
          />
        );
      case 'focus':
        return (
          <div className="max-w-md mx-auto">
            <PomodoroTimer activeTaskId={activeTaskId} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="text-blue-600" size={28} />
              <h1 className="text-xl font-bold text-gray-900">Time Optimizer</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${currentView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {currentView === 'tasks' && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Task</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-3">
              <nav className="flex flex-col space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors
                        ${currentView === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={(taskData) => {
            addTask(taskData);
            setShowTaskForm(false);
          }}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {/* Quick Stats Floating Panel - Only show on tasks view */}
      {currentView === 'tasks' && tasks.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 hidden lg:block">
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-gray-600">
                {analytics.completedTasks}/{analytics.totalTasks} tasks completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <span className="text-gray-600">
                {analytics.productivityScore}% productivity score
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}