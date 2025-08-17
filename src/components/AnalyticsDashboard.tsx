import React from 'react';
import { BarChart3, Target, Clock, TrendingUp, Lightbulb } from 'lucide-react';
import { Analytics } from '../types';

interface AnalyticsDashboardProps {
  analytics: Analytics;
  recommendations: string[];
}

export function AnalyticsDashboard({ analytics, recommendations }: AnalyticsDashboardProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-blue-600" size={20} />
            <span className="text-2xl font-bold text-gray-900">
              {analytics.completedTasks}/{analytics.totalTasks}
            </span>
          </div>
          <p className="text-sm text-gray-600">Tasks Completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-green-600" size={20} />
            <span className="text-2xl font-bold text-gray-900">
              {formatTime(analytics.totalTimeCompleted)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Time Completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-purple-600" size={20} />
            <span className={`text-2xl font-bold px-2 py-1 rounded-lg ${getProductivityColor(analytics.productivityScore)}`}>
              {analytics.productivityScore}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Productivity Score</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-orange-600" size={20} />
            <span className="text-2xl font-bold text-gray-900">
              {formatTime(analytics.totalTimeScheduled)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Total Scheduled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
          <div className="space-y-3">
            {analytics.weeklyProgress.map((day) => {
              const completionRate = day.scheduled > 0 ? (day.completed / day.scheduled) * 100 : 0;
              return (
                <div key={day.day}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{day.day}</span>
                    <span className="text-sm text-gray-600">
                      {day.completed.toFixed(1)}h / {day.scheduled.toFixed(1)}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time by Category</h3>
          <div className="space-y-3">
            {analytics.categoriesData.map((category) => {
              const percentage = analytics.totalTimeCompleted > 0 
                ? (category.time / analytics.totalTimeCompleted) * 100 
                : 0;
              return (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {category.category}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatTime(category.time)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: category.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Priority Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics.priorityDistribution.map((priority) => (
            <div key={priority.priority} className="text-center">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-xl font-bold mb-2"
                style={{ backgroundColor: priority.color }}
              >
                {priority.count}
              </div>
              <p className="text-sm font-medium text-gray-700">{priority.priority}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
          </div>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}