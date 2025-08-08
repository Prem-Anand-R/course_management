/**
 * Progress Context for real-time progress tracking across components
 * Provides centralized state management for course progress with localStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  loadProgressFromStorage, 
  saveProgressToStorage,
  loadBookmarkedCourses,
  saveBookmarkedCourses,
  updateLearningStreak,
  getLearningStreak
} from '../utils/progressTracking';

// Create the context
const ProgressContext = createContext();

// Custom hook to use the progress context
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

// Progress Provider component
export const ProgressProvider = ({ children }) => {
  // State for progress tracking
  const [progress, setProgress] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [learningStreak, setLearningStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const savedProgress = loadProgressFromStorage();
      const savedBookmarks = loadBookmarkedCourses();
      const savedStreak = getLearningStreak();

      setProgress(savedProgress);
      setBookmarks(savedBookmarks);
      setLearningStreak(savedStreak);
      
      console.debug('Progress context initialized:', {
        progressEntries: Object.keys(savedProgress).length,
        bookmarks: savedBookmarks.length,
        streak: savedStreak.currentStreak
      });
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle lesson completion with real-time updates
  const toggleLessonCompletion = useCallback((lessonId, additionalData = {}) => {
    setProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      
      if (newProgress[lessonId]?.completed) {
        // Mark as incomplete
        delete newProgress[lessonId];
      } else {
        // Mark as complete
        newProgress[lessonId] = {
          completed: true,
          completedAt: new Date().toISOString(),
          ...additionalData
        };
        
        // Update learning streak when lesson is completed
        const updatedStreak = updateLearningStreak();
        setLearningStreak(updatedStreak);
      }
      
      // Save to localStorage
      saveProgressToStorage(newProgress);
      
      console.debug('Lesson completion toggled:', {
        lessonId,
        completed: !!newProgress[lessonId]?.completed,
        totalCompleted: Object.keys(newProgress).filter(id => newProgress[id]?.completed).length
      });
      
      return newProgress;
    });
  }, []);

  // Mark lesson as completed
  const markLessonCompleted = useCallback((lessonId, additionalData = {}) => {
    setProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      newProgress[lessonId] = {
        completed: true,
        completedAt: new Date().toISOString(),
        ...additionalData
      }; 
      
      saveProgressToStorage(newProgress);
      
      // Update learning streak
      const updatedStreak = updateLearningStreak();
      setLearningStreak(updatedStreak);
      
      return newProgress;
    });
  }, []);

  // Mark lesson as incomplete
  const markLessonIncomplete = useCallback((lessonId) => {
    setProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      delete newProgress[lessonId];
       
      saveProgressToStorage(newProgress);
      return newProgress;
    });
  }, []);

  // Toggle course bookmark
  const toggleCourseBookmark = useCallback((courseId) => {
    setBookmarks(prevBookmarks => {
      const isBookmarked = prevBookmarks.includes(courseId);
      let newBookmarks;
      
      if (isBookmarked) {
        newBookmarks = prevBookmarks.filter(id => id !== courseId);
      } else {
        newBookmarks = [...prevBookmarks, courseId];
      }
      
      saveBookmarkedCourses(newBookmarks);
      
      console.debug('Course bookmark toggled:', {
        courseId,
        bookmarked: !isBookmarked,
        totalBookmarks: newBookmarks.length
      });
      
      return newBookmarks;
    }); 
  }, []);

  // Check if course is bookmarked
  const isCourseBookmarked = useCallback((courseId) => {
    return bookmarks.includes(courseId);
  }, [bookmarks]);

  // Get lesson progress
  const getLessonProgress = useCallback((lessonId) => {
    return progress[lessonId] || null;
  }, [progress]);

  // Calculate course progress
  const calculateCourseProgress = useCallback((course) => {
    if (!course || !course.sections) {
      return {
        totalLessons: 0,
        completedLessons: 0,
        completionPercentage: 0,
        completedSections: 0,
        totalSections: 0
      };
    }

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
  }, [progress]);

  // Get all courses progress
  const getAllCoursesProgress = useCallback((courses) => {
    if (!Array.isArray(courses)) return {};
    
    const allProgress = {};
    
    courses.forEach(course => {
      allProgress[course.id] = calculateCourseProgress(course);
    });
    
    return allProgress;
  }, [calculateCourseProgress]);

  // Clear all progress (for reset functionality)
  const clearAllProgress = useCallback(() => {
    setProgress({});
    setBookmarks([]);
    setLearningStreak({
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null
    });
    
    // Clear localStorage
    saveProgressToStorage({});
    saveBookmarkedCourses([]);
    localStorage.removeItem('learning_streak');
    
    console.debug('All progress cleared');
  }, []);

  // Export progress data
  const exportProgressData = useCallback(() => {
    return {
      progress,
      bookmarks,
      streak: learningStreak,
      exportDate: new Date().toISOString()
    };
  }, [progress, bookmarks, learningStreak]);

  // Import progress data
  const importProgressData = useCallback((data) => {
    try {
      if (data.progress) {
        setProgress(data.progress);
        saveProgressToStorage(data.progress);
      }
      if (data.bookmarks) {
        setBookmarks(data.bookmarks);
        saveBookmarkedCourses(data.bookmarks);
      }
      if (data.streak) {
        setLearningStreak(data.streak);
        localStorage.setItem('learning_streak', JSON.stringify(data.streak));
      }
      
      console.debug('Progress data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing progress data:', error);
      return false;
    }
  }, []);

  // Context value
  const value = {
    // State
    progress,
    bookmarks,
    learningStreak,
    loading,
    
    // Lesson progress functions
    toggleLessonCompletion,
    markLessonCompleted,
    markLessonIncomplete,
    getLessonProgress,
    
    // Course progress functions
    calculateCourseProgress,
    getAllCoursesProgress,
    
    // Bookmark functions
    toggleCourseBookmark,
    isCourseBookmarked,
    
    // Utility functions
    clearAllProgress,
    exportProgressData,
    importProgressData
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">Loading progress data...</span>
      </div>
    );
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressContext;
