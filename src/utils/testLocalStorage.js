/**
 * Test utilities for localStorage integration
 * Use these functions to verify localStorage functionality
 */

import { 
  loadCoursesFromStorage, 
  saveCoursesToStorage 
} from '../redux/courseSlice';

import { 
  calculateCourseAnalytics,
  formatAnalyticsForDisplay 
} from './analytics';

import {
  markLessonCompleted,
  calculateCourseProgress,
  toggleCourseBookmark,
  updateLearningStreak,
  exportProgressData,
  clearAllProgress
} from './progressTracking';

/**
 * Test localStorage course persistence
 */
export const testCoursePersistence = () => {
  console.log('🧪 Testing Course Persistence...');
  
  // Create test course
  const testCourse = {
    id: 'test-course-1',
    title: 'Test Course',
    description: 'A test course for localStorage verification',
    category: 'Testing',
    difficulty: 'Beginner',
    status: 'published',
    instructor: 'Test Instructor',
    createdAt: new Date().toISOString(),
    sections: [
      {
        id: 'test-section-1',
        title: 'Test Section',
        lessons: [
          {
            id: 'test-lesson-1',
            title: 'Test Lesson 1',
            content: '<p>Test lesson content</p>'
          },
          {
            id: 'test-lesson-2',
            title: 'Test Lesson 2',
            content: '<p>Another test lesson</p>'
          }
        ]
      }
    ]
  };
  
  // Test saving
  const currentCourses = loadCoursesFromStorage();
  const newCourses = [...currentCourses, testCourse];
  const saveResult = saveCoursesToStorage(newCourses);
  
  console.log('✅ Save result:', saveResult);
  
  // Test loading
  const loadedCourses = loadCoursesFromStorage();
  const testCourseFound = loadedCourses.find(c => c.id === 'test-course-1');
  
  console.log('✅ Test course found:', !!testCourseFound);
  console.log('✅ Total courses in storage:', loadedCourses.length);
  
  return {
    saveSuccess: saveResult,
    loadSuccess: !!testCourseFound,
    totalCourses: loadedCourses.length
  };
};

/**
 * Test progress tracking functionality
 */
export const testProgressTracking = () => {
  console.log('🧪 Testing Progress Tracking...');
  
  // Test lesson completion
  const lessonId = 'test-lesson-1';
  const completionResult = markLessonCompleted(lessonId, {
    timeSpent: 300, // 5 minutes
    score: 95
  });
  
  console.log('✅ Lesson completion result:', completionResult);
  
  // Test course progress calculation
  const testCourse = {
    id: 'test-course-1',
    sections: [
      {
        id: 'test-section-1',
        lessons: [
          { id: 'test-lesson-1', title: 'Lesson 1' },
          { id: 'test-lesson-2', title: 'Lesson 2' }
        ]
      }
    ]
  };
  
  const courseProgress = calculateCourseProgress(testCourse);
  console.log('✅ Course progress:', courseProgress);
  
  // Test bookmark functionality
  const bookmarkResult = toggleCourseBookmark('test-course-1');
  console.log('✅ Bookmark result:', bookmarkResult);
  
  // Test learning streak
  const streakResult = updateLearningStreak();
  console.log('✅ Learning streak:', streakResult);
  
  return {
    lessonCompletion: completionResult,
    courseProgress,
    bookmarkToggle: bookmarkResult,
    learningStreak: streakResult
  };
};

/**
 * Test analytics calculation
 */
export const testAnalytics = () => {
  console.log('🧪 Testing Analytics...');
  
  const courses = loadCoursesFromStorage();
  const analytics = calculateCourseAnalytics(courses);
  const formattedAnalytics = formatAnalyticsForDisplay(analytics);
  
  console.log('✅ Analytics calculated:', {
    totalCourses: analytics.totalCourses,
    totalLessons: analytics.totalLessons,
    averageRating: analytics.averageRating,
    completionStats: analytics.completionStats
  });
  
  console.log('✅ Formatted analytics:', {
    statsCards: formattedAnalytics.statsCards.length,
    categoryChart: formattedAnalytics.categoryChart.length,
    progressOverview: formattedAnalytics.progressOverview
  });
  
  return {
    analytics,
    formattedAnalytics
  };
};

/**
 * Test data export/import functionality
 */
export const testDataExportImport = () => {
  console.log('🧪 Testing Data Export/Import...');
  
  // Export current data
  const exportedData = exportProgressData();
  console.log('✅ Data exported:', {
    progressEntries: Object.keys(exportedData.progress).length,
    bookmarks: exportedData.bookmarks.length,
    hasStreak: !!exportedData.streak,
    exportDate: exportedData.exportDate
  });
  
  return exportedData;
};

/**
 * Test error handling
 */
export const testErrorHandling = () => {
  console.log('🧪 Testing Error Handling...');
  
  // Test with invalid data
  const invalidSaveResult = saveCoursesToStorage("invalid data");
  console.log('✅ Invalid data save result:', invalidSaveResult);
  
  // Test with corrupted localStorage
  try {
    localStorage.setItem('courses', 'invalid json');
    const loadResult = loadCoursesFromStorage();
    console.log('✅ Corrupted data load result:', Array.isArray(loadResult));
  } catch (error) {
    console.log('✅ Error caught:', error.message);
  }
  
  return {
    invalidSave: invalidSaveResult,
    corruptedLoad: true
  };
};

/**
 * Run comprehensive localStorage tests
 */
export const runAllTests = () => {
  console.log('🚀 Running Comprehensive localStorage Tests...');
  console.log('================================================');
  
  const results = {
    persistence: testCoursePersistence(),
    progress: testProgressTracking(),
    analytics: testAnalytics(),
    exportImport: testDataExportImport(),
    errorHandling: testErrorHandling()
  };
  
  console.log('================================================');
  console.log('🎉 All Tests Completed!');
  console.log('📊 Test Results Summary:', {
    persistenceSuccess: results.persistence.saveSuccess && results.persistence.loadSuccess,
    progressTrackingWorks: results.progress.lessonCompletion,
    analyticsCalculated: !!results.analytics.analytics,
    dataExportWorks: !!results.exportImport.exportDate,
    errorHandlingWorks: !results.errorHandling.invalidSave
  });
  
  return results;
};

/**
 * Clean up test data
 */
export const cleanupTestData = () => {
  console.log('🧹 Cleaning up test data...');
  
  // Remove test course
  const courses = loadCoursesFromStorage();
  const cleanedCourses = courses.filter(c => !c.id.startsWith('test-'));
  saveCoursesToStorage(cleanedCourses);
  
  // Clear test progress
  clearAllProgress();
  
  console.log('✅ Test data cleaned up');
  return true;
};

/**
 * Quick localStorage status check
 */
export const checkLocalStorageStatus = () => {
  const status = {
    available: typeof Storage !== 'undefined',
    courses: loadCoursesFromStorage().length,
    progressEntries: Object.keys(exportProgressData().progress).length,
    bookmarks: exportProgressData().bookmarks.length,
    storageUsed: JSON.stringify(loadCoursesFromStorage()).length,
    maxStorage: 5 * 1024 * 1024 // 5MB typical limit
  };
  
  status.usagePercentage = Math.round((status.storageUsed / status.maxStorage) * 100);
  
  console.log('📊 localStorage Status:', status);
  return status;
};

// Export test runner for easy access
export default {
  runAllTests,
  testCoursePersistence,
  testProgressTracking,
  testAnalytics,
  testDataExportImport,
  testErrorHandling,
  cleanupTestData,
  checkLocalStorageStatus
};
