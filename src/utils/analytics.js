/**
 * Analytics utility for course management dashboard
 * Provides comprehensive analytics and progress tracking functionality
 */

import { loadProgressFromStorage } from '../redux/courseSlice';

/**
 * Calculate comprehensive course analytics for dashboard display
 * @param {Array} courses - Array of course objects
 * @returns {Object} Analytics data object
 */
export const calculateCourseAnalytics = (courses) => {
  // Ensure courses is a valid array
  const safeCourses = Array.isArray(courses) ? courses : [];
  
  if (safeCourses.length === 0) {
    return {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      archivedCourses: 0,
      totalStudents: 0,
      averageRating: 0,
      totalSections: 0,
      totalLessons: 0,
      coursesByCategory: {},
      coursesByDifficulty: {},
      recentCourses: [],
      topRatedCourses: [],
      mostPopularCourses: [],
      completionStats: {
        totalProgress: 0,
        averageCompletion: 0,
        completedCourses: 0,
        inProgressCourses: 0
      }
    };
  }

  // Basic course statistics
  const totalCourses = safeCourses.length;
  const publishedCourses = safeCourses.filter(c => c.status === 'published').length;
  const draftCourses = safeCourses.filter(c => c.status === 'draft').length;
  const archivedCourses = safeCourses.filter(c => c.status === 'archived').length;

  // Student and rating statistics
  const totalStudents = safeCourses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0);
  const totalRatings = safeCourses.reduce((sum, course) => sum + (course.rating || 0), 0);
  const averageRating = totalCourses > 0 ? (totalRatings / totalCourses) : 0;

  // Content statistics
  const totalSections = safeCourses.reduce((sum, course) => {
    return sum + (course.sections ? course.sections.length : 0);
  }, 0);

  const totalLessons = safeCourses.reduce((sum, course) => {
    if (!course.sections) return sum;
    return sum + course.sections.reduce((sectionSum, section) => {
      return sectionSum + (section.lessons ? section.lessons.length : 0);
    }, 0);
  }, 0);

  // Category distribution
  const coursesByCategory = safeCourses.reduce((acc, course) => {
    const category = course.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Difficulty distribution
  const coursesByDifficulty = safeCourses.reduce((acc, course) => {
    const difficulty = course.difficulty || 'Unknown';
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {});

  // Recent courses (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCourses = safeCourses
    .filter(course => {
      if (!course.createdAt) return false;
      const courseDate = new Date(course.createdAt);
      return courseDate >= thirtyDaysAgo;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Top rated courses
  const topRatedCourses = safeCourses
    .filter(course => course.rating && course.rating > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  // Most popular courses (by enrollment)
  const mostPopularCourses = safeCourses
    .filter(course => course.enrolledStudents && course.enrolledStudents > 0)
    .sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
    .slice(0, 5);

  // Load progress data for completion statistics
  const progressData = loadProgressFromStorage();
  const completionStats = calculateCompletionStats(safeCourses, progressData);

  return {
    totalCourses,
    publishedCourses,
    draftCourses,
    archivedCourses,
    totalStudents,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalSections,
    totalLessons,
    coursesByCategory,
    coursesByDifficulty,
    recentCourses,
    topRatedCourses,
    mostPopularCourses,
    completionStats
  };
};

/**
 * Calculate course completion statistics
 * @param {Array} courses - Array of course objects
 * @param {Object} progressData - Progress data from localStorage
 * @returns {Object} Completion statistics
 */
export const calculateCompletionStats = (courses, progressData = {}) => {
  const safeCourses = Array.isArray(courses) ? courses : [];
  
  if (safeCourses.length === 0) {
    return {
      totalProgress: 0,
      averageCompletion: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      courseProgress: {}
    };
  }

  const courseProgress = {};
  let totalCompletionPercentage = 0;
  let completedCourses = 0;
  let inProgressCourses = 0;

  safeCourses.forEach(course => {
    const courseId = course.id;
    const totalLessons = course.sections ? 
      course.sections.reduce((sum, section) => sum + (section.lessons ? section.lessons.length : 0), 0) : 0;

    if (totalLessons === 0) {
      courseProgress[courseId] = {
        completedLessons: 0,
        totalLessons: 0,
        completionPercentage: 0
      };
      return;
    }

    // Count completed lessons for this course
    let completedLessons = 0;
    if (course.sections) {
      course.sections.forEach(section => {
        if (section.lessons) {
          section.lessons.forEach(lesson => {
            const lessonProgress = progressData[lesson.id];
            if (lessonProgress && lessonProgress.completed) {
              completedLessons++;
            }
          });
        }
      });
    }

    const completionPercentage = Math.round((completedLessons / totalLessons) * 100);
    
    courseProgress[courseId] = {
      completedLessons,
      totalLessons,
      completionPercentage
    };

    totalCompletionPercentage += completionPercentage;

    if (completionPercentage === 100) {
      completedCourses++;
    } else if (completionPercentage > 0) {
      inProgressCourses++;
    }
  });

  const averageCompletion = safeCourses.length > 0 ? 
    Math.round(totalCompletionPercentage / safeCourses.length) : 0;

  return {
    totalProgress: totalCompletionPercentage,
    averageCompletion,
    completedCourses,
    inProgressCourses,
    courseProgress
  };
};

/**
 * Get learning streak information
 * @param {Object} progressData - Progress data from localStorage
 * @returns {Object} Streak information
 */
export const calculateLearningStreak = (progressData = {}) => {
  const completionDates = Object.values(progressData)
    .filter(progress => progress.completed && progress.completedAt)
    .map(progress => new Date(progress.completedAt).toDateString())
    .sort((a, b) => new Date(b) - new Date(a));

  if (completionDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null
    };
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // Check if there was activity today or yesterday
  if (completionDates.includes(today) || completionDates.includes(yesterdayStr)) {
    const uniqueDates = [...new Set(completionDates)];
    let streakDate = new Date();
    
    for (const dateStr of uniqueDates) {
      const date = new Date(dateStr);
      const expectedDate = new Date(streakDate);
      expectedDate.setDate(expectedDate.getDate() - currentStreak);
      
      if (date.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak (simplified version)
  const longestStreak = Math.max(currentStreak, Math.ceil(completionDates.length / 7));

  return {
    currentStreak,
    longestStreak,
    lastActivity: completionDates[0] ? new Date(completionDates[0]) : null
  };
};

/**
 * Format analytics data for dashboard display
 * @param {Object} analytics - Analytics data from calculateCourseAnalytics
 * @returns {Object} Formatted data for UI components
 */
export const formatAnalyticsForDisplay = (analytics) => {
  return {
    // Main stats cards
    statsCards: [
      {
        title: 'Total Courses',
        value: analytics.totalCourses,
        icon: 'book',
        color: 'indigo',
        change: analytics.recentCourses.length > 0 ? `+${analytics.recentCourses.length} this month` : null
      },
      {
        title: 'Published Courses',
        value: analytics.publishedCourses,
        icon: 'check-circle',
        color: 'green',
        percentage: analytics.totalCourses > 0 ? Math.round((analytics.publishedCourses / analytics.totalCourses) * 100) : 0
      },
      {
        title: 'Total Students',
        value: analytics.totalStudents.toLocaleString(),
        icon: 'users',
        color: 'blue',
        change: null
      },
      {
        title: 'Average Rating',
        value: analytics.averageRating.toFixed(1),
        icon: 'star',
        color: 'yellow',
        maxValue: 5
      }
    ],

    // Progress overview
    progressOverview: {
      averageCompletion: analytics.completionStats.averageCompletion,
      completedCourses: analytics.completionStats.completedCourses,
      inProgressCourses: analytics.completionStats.inProgressCourses,
      totalLessons: analytics.totalLessons
    },

    // Charts data
    categoryChart: Object.entries(analytics.coursesByCategory).map(([category, count]) => ({
      name: category,
      value: count,
      percentage: Math.round((count / analytics.totalCourses) * 100)
    })),

    difficultyChart: Object.entries(analytics.coursesByDifficulty).map(([difficulty, count]) => ({
      name: difficulty,
      value: count,
      percentage: Math.round((count / analytics.totalCourses) * 100)
    })),

    // Lists for dashboard sections
    recentActivity: analytics.recentCourses,
    topPerformers: analytics.topRatedCourses,
    popularCourses: analytics.mostPopularCourses
  };
};
