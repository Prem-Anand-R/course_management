/**
 * Progress tracking utility for course management system
 * Handles localStorage integration for course and lesson progress
 */

const PROGRESS_STORAGE_KEY = "course_progress";
const COURSE_BOOKMARKS_KEY = "course_bookmarks";
const LEARNING_STREAK_KEY = "learning_streak";

/**
 * Load all progress data from localStorage
 * @returns {Object} Progress data object
 */
export const loadProgressFromStorage = () => {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading progress from localStorage:', error);
    return {};
  }
};

/**
 * Save progress data to localStorage
 * @param {Object} progress - Progress data object
 * @returns {boolean} Success status
 */
export const saveProgressToStorage = (progress) => {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    console.debug('Progress saved to localStorage');
    return true;
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
    return false;
  }
};

/**
 * Get progress for a specific lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Object|null} Lesson progress data
 */
export const getLessonProgress = (lessonId) => {
  const allProgress = loadProgressFromStorage();
  return allProgress[lessonId] || null;
};

/**
 * Mark a lesson as completed
 * @param {string} lessonId - Lesson ID
 * @param {Object} additionalData - Additional progress data
 * @returns {boolean} Success status
 */
export const markLessonCompleted = (lessonId, additionalData = {}) => {
  try {
    const progress = loadProgressFromStorage();
    progress[lessonId] = {
      completed: true,
      completedAt: new Date().toISOString(),
      ...additionalData
    };
    
    // Update learning streak
    updateLearningStreak();
    
    return saveProgressToStorage(progress);
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    return false;
  }
};

/**
 * Mark a lesson as incomplete
 * @param {string} lessonId - Lesson ID
 * @returns {boolean} Success status
 */
export const markLessonIncomplete = (lessonId) => {
  try {
    const progress = loadProgressFromStorage();
    delete progress[lessonId];
    return saveProgressToStorage(progress);
  } catch (error) {
    console.error('Error marking lesson as incomplete:', error);
    return false;
  }
};

/**
 * Toggle lesson completion status
 * @param {string} lessonId - Lesson ID
 * @param {Object} additionalData - Additional progress data
 * @returns {boolean} New completion status
 */
export const toggleLessonCompletion = (lessonId, additionalData = {}) => {
  const currentProgress = getLessonProgress(lessonId);
  
  if (currentProgress && currentProgress.completed) {
    markLessonIncomplete(lessonId);
    return false;
  } else {
    markLessonCompleted(lessonId, additionalData);
    return true;
  }
};

/**
 * Calculate course progress statistics
 * @param {Object} course - Course object with sections and lessons
 * @returns {Object} Course progress statistics
 */
export const calculateCourseProgress = (course) => {
  if (!course || !course.sections) {
    return {
      totalLessons: 0,
      completedLessons: 0,
      completionPercentage: 0,
      completedSections: 0,
      totalSections: 0
    };
  }

  const progress = loadProgressFromStorage();
  let totalLessons = 0;
  let completedLessons = 0;
  let completedSections = 0;

  course.sections.forEach(section => {
    if (!section.lessons) return;
    
    let sectionLessons = section.lessons.length;
    let sectionCompleted = 0;
    
    section.lessons.forEach(lesson => {
      totalLessons++;
      const lessonProgress = progress[lesson.id];
      if (lessonProgress && lessonProgress.completed) {
        completedLessons++;
        sectionCompleted++;
      }
    });
    
    // Consider section completed if all lessons are completed
    if (sectionLessons > 0 && sectionCompleted === sectionLessons) {
      completedSections++;
    }
  });

  const completionPercentage = totalLessons > 0 ? 
    Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    totalLessons,
    completedLessons,
    completionPercentage,
    completedSections,
    totalSections: course.sections.length
  };
};

/**
 * Get all course progress for multiple courses
 * @param {Array} courses - Array of course objects
 * @returns {Object} Progress data for all courses
 */
export const getAllCoursesProgress = (courses) => {
  if (!Array.isArray(courses)) return {};
  
  const allProgress = {};
  
  courses.forEach(course => {
    allProgress[course.id] = calculateCourseProgress(course);
  });
  
  return allProgress;
};

/**
 * Load bookmarked courses from localStorage
 * @returns {Array} Array of bookmarked course IDs
 */
export const loadBookmarkedCourses = () => {
  try {
    const stored = localStorage.getItem(COURSE_BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading bookmarks from localStorage:', error);
    return [];
  }
};

/**
 * Save bookmarked courses to localStorage
 * @param {Array} bookmarks - Array of course IDs
 * @returns {boolean} Success status
 */
export const saveBookmarkedCourses = (bookmarks) => {
  try {
    localStorage.setItem(COURSE_BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true;
  } catch (error) {
    console.error('Error saving bookmarks to localStorage:', error);
    return false;
  }
};

/**
 * Toggle course bookmark status
 * @param {string} courseId - Course ID
 * @returns {boolean} New bookmark status
 */
export const toggleCourseBookmark = (courseId) => {
  try {
    const bookmarks = loadBookmarkedCourses();
    const isBookmarked = bookmarks.includes(courseId);
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(id => id !== courseId);
      saveBookmarkedCourses(newBookmarks);
      return false;
    } else {
      const newBookmarks = [...bookmarks, courseId];
      saveBookmarkedCourses(newBookmarks);
      return true;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return false;
  }
};

/**
 * Check if a course is bookmarked
 * @param {string} courseId - Course ID
 * @returns {boolean} Bookmark status
 */
export const isCourseBookmarked = (courseId) => {
  const bookmarks = loadBookmarkedCourses();
  return bookmarks.includes(courseId);
};

/**
 * Update learning streak data
 * @returns {Object} Updated streak data
 */
export const updateLearningStreak = () => {
  try {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(LEARNING_STREAK_KEY);
    let streakData = stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null,
      activityDates: []
    };

    // Add today to activity dates if not already present
    if (!streakData.activityDates.includes(today)) {
      streakData.activityDates.push(today);
      streakData.lastActivity = today;
      
      // Calculate current streak
      const sortedDates = streakData.activityDates
        .map(date => new Date(date))
        .sort((a, b) => b - a);
      
      let currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const dayDiff = Math.floor((sortedDates[i-1] - sortedDates[i]) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      streakData.currentStreak = currentStreak;
      streakData.longestStreak = Math.max(streakData.longestStreak, currentStreak);
      
      localStorage.setItem(LEARNING_STREAK_KEY, JSON.stringify(streakData));
    }
    
    return streakData;
  } catch (error) {
    console.error('Error updating learning streak:', error);
    return { currentStreak: 0, longestStreak: 0, lastActivity: null };
  }
};

/**
 * Get learning streak data
 * @returns {Object} Streak data
 */
export const getLearningStreak = () => {
  try {
    const stored = localStorage.getItem(LEARNING_STREAK_KEY);
    return stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null,
      activityDates: []
    };
  } catch (error) {
    console.error('Error getting learning streak:', error);
    return { currentStreak: 0, longestStreak: 0, lastActivity: null };
  }
};

/**
 * Clear all progress data (useful for reset functionality)
 * @returns {boolean} Success status
 */
export const clearAllProgress = () => {
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    localStorage.removeItem(COURSE_BOOKMARKS_KEY);
    localStorage.removeItem(LEARNING_STREAK_KEY);
    console.info('All progress data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing progress data:', error);
    return false;
  }
};

/**
 * Export progress data for backup
 * @returns {Object} All progress data
 */
export const exportProgressData = () => {
  return {
    progress: loadProgressFromStorage(),
    bookmarks: loadBookmarkedCourses(),
    streak: getLearningStreak(),
    exportDate: new Date().toISOString()
  };
};

/**
 * Import progress data from backup
 * @param {Object} data - Progress data to import
 * @returns {boolean} Success status
 */
export const importProgressData = (data) => {
  try {
    if (data.progress) {
      saveProgressToStorage(data.progress);
    }
    if (data.bookmarks) {
      saveBookmarkedCourses(data.bookmarks);
    }
    if (data.streak) {
      localStorage.setItem(LEARNING_STREAK_KEY, JSON.stringify(data.streak));
    }
    console.info('Progress data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing progress data:', error);
    return false;
  }
};
