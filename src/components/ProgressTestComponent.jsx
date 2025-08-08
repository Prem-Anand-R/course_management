/**
 * Test component to verify real-time progress updates
 * This component can be temporarily added to any page to test progress functionality
 */

import React from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { useSelector } from 'react-redux';

const ProgressTestComponent = () => {
  const { 
    progress, 
    toggleLessonCompletion, 
    calculateCourseProgress,
    learningStreak 
  } = useProgress();
  
  const courses = useSelector((state) => Array.isArray(state.course) ? state.course : []);

  // Get first course for testing
  const testCourse = courses[0];
  const testLessons = testCourse?.sections?.[0]?.lessons || [];

  if (!testCourse || testLessons.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
        <h3 className="text-lg font-medium text-yellow-800">Progress Test Component</h3>
        <p className="text-yellow-700">No courses or lessons available for testing.</p>
      </div>
    );
  }

  const courseStats = calculateCourseProgress(testCourse);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 m-4">
      <h3 className="text-lg font-medium text-blue-800 mb-4">🧪 Real-Time Progress Test</h3>
      
      {/* Course Progress Display */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Course: {testCourse.title}</h4>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-blue-600">
              {courseStats.completedLessons}/{courseStats.totalLessons} lessons ({courseStats.completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${courseStats.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Learning Streak Display */}
      <div className="mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-medium text-gray-900 mb-2">Learning Streak</h4>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{learningStreak.currentStreak}</div>
              <div className="text-xs text-gray-500">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{learningStreak.longestStreak}</div>
              <div className="text-xs text-gray-500">Longest</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Lessons */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Test Lessons (Click to toggle completion)</h4>
        <div className="space-y-2">
          {testLessons.slice(0, 3).map((lesson, index) => {
            const isCompleted = progress[lesson.id]?.completed;
            const completedAt = progress[lesson.id]?.completedAt;
            
            return (
              <div 
                key={lesson.id}
                className="bg-white rounded-lg p-3 border hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => toggleLessonCompletion(lesson.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => {}} // Handled by onClick
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                        Lesson {index + 1}: {lesson.title}
                      </span>
                      {isCompleted && (
                        <span className="text-xs text-green-600">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    {isCompleted && completedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Completed: {new Date(completedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Data Display */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Raw Progress Data</h4>
        <div className="bg-gray-100 rounded p-3 text-xs font-mono">
          <div className="mb-2">
            <strong>Total Progress Entries:</strong> {Object.keys(progress).length}
          </div>
          <div className="mb-2">
            <strong>Completed Lessons:</strong> {Object.values(progress).filter(p => p.completed).length}
          </div>
          <div className="max-h-32 overflow-y-auto">
            <strong>Progress Object:</strong>
            <pre className="mt-1 text-xs">
              {JSON.stringify(progress, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Testing Instructions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click lesson checkboxes to toggle completion</li>
          <li>• Watch progress bar update immediately</li>
          <li>• Check that percentage changes in real-time</li>
          <li>• Verify learning streak updates when lessons are completed</li>
          <li>• Open Dashboard in another tab to see cross-component updates</li>
        </ul>
      </div>

      {/* Test Actions */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => {
            testLessons.forEach(lesson => {
              if (!progress[lesson.id]?.completed) {
                toggleLessonCompletion(lesson.id);
              }
            });
          }}
          className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          Complete All Test Lessons
        </button>
        
        <button
          onClick={() => {
            testLessons.forEach(lesson => {
              if (progress[lesson.id]?.completed) {
                toggleLessonCompletion(lesson.id);
              }
            });
          }}
          className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Reset All Test Lessons
        </button>
      </div>
    </div>
  );
};

export default ProgressTestComponent;
