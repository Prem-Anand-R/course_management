import { createSlice } from "@reduxjs/toolkit";
import { sanitizeCoursesForStorage } from '../utils/htmlSanitizer';
import { runAutoMigration } from '../utils/dataMigration';

// localStorage utility functions with comprehensive error handling
const COURSES_STORAGE_KEY = "courses";
const PROGRESS_STORAGE_KEY = "course_progress";

/**
 * Load courses from localStorage with error handling, validation, and auto-migration
 * @returns {Array} Array of courses or empty array if none found/invalid
 */
const loadCoursesFromStorage = () => {
  try {
    // Run auto-migration to clean HTML from existing data
    const migrationResult = runAutoMigration();
    if (migrationResult.migrationRun) {
      console.info('Data migration completed:', migrationResult.message);
    }

    const stored = localStorage.getItem(COURSES_STORAGE_KEY);

    if (!stored) {
      console.info('No courses found in localStorage, starting with empty state');
      return [];
    }

    const parsed = JSON.parse(stored);

    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn('Invalid course data structure in localStorage, expected array but got:', typeof parsed);
      return [];
    }

    // Validate each course object has required properties
    const validCourses = parsed.filter(course => {
      const isValid = course &&
                     typeof course.id === 'string' &&
                     typeof course.title === 'string' &&
                     typeof course.description === 'string';

      if (!isValid) {
        console.warn('Invalid course object found and filtered out:', course);
      }

      return isValid;
    });

    console.info(`Loaded ${validCourses.length} valid courses from localStorage`);
    return validCourses;

  } catch (error) {
    console.error('Error loading courses from localStorage:', error);

    // If data is corrupted, clear it to prevent future errors
    try {
      localStorage.removeItem(COURSES_STORAGE_KEY);
      console.info('Cleared corrupted course data from localStorage');
    } catch (clearError) {
      console.error('Error clearing corrupted localStorage data:', clearError);
    }

    return [];
  }
};

/**
 * Save courses to localStorage with HTML sanitization and error handling
 * @param {Array} courses - Array of course objects to save
 */
const saveCoursesToStorage = (courses) => {
  try {
    // Validate input
    if (!Array.isArray(courses)) {
      console.error('Cannot save courses to localStorage: expected array but got', typeof courses);
      return false;
    }

    // Sanitize courses before saving (strip HTML tags and inline styles)
    const sanitizedCourses = sanitizeCoursesForStorage(courses);

    const serialized = JSON.stringify(sanitizedCourses);

    // Check localStorage quota (approximate)
    const currentSize = new Blob([serialized]).size;
    const originalSize = new Blob([JSON.stringify(courses)]).size;
    const savings = originalSize - currentSize;
    const savingsPercentage = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

    if (currentSize > 5 * 1024 * 1024) { // 5MB limit
      console.warn('Course data size approaching localStorage limits:', currentSize, 'bytes');
    }

    localStorage.setItem(COURSES_STORAGE_KEY, serialized);
    console.debug(`Saved ${courses.length} courses to localStorage`);
    console.debug(`Storage optimization: ${savings} bytes saved (${savingsPercentage}% reduction)`);
    return true;

  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider implementing data cleanup.');
      // Could implement cleanup logic here
    } else {
      console.error('Error saving courses to localStorage:', error);
    }
    return false;
  }
};

/**
 * Load course progress from localStorage
 * @returns {Object} Progress data object or empty object
 */
const loadProgressFromStorage = () => {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading progress from localStorage:', error);
    return {};
  }
};

/**
 * Save course progress to localStorage
 * @param {Object} progress - Progress data object
 */
const saveProgressToStorage = (progress) => {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
    return false;
  }
};

const courseSlices = createSlice({
  name: "course",
  initialState: loadCoursesFromStorage(), // Initialize with localStorage data
  reducers: {
    addCourse(state, action) {
      const newState = [...state, action.payload];
      saveCoursesToStorage(newState); // Auto-save to localStorage
      return newState;
    },
    updateCourse(state, action) {
      // action.payload should be the updated course object with id
      const updatedCourse = action.payload;
      const index = state.findIndex(course => course.id === updatedCourse.id);

      let newState;
      if (index !== -1) {
        // Update existing course
        newState = [...state];
        newState[index] = updatedCourse;
      } else {
        // If course not found, add it (fallback)
        newState = [...state, updatedCourse];
      }

      saveCoursesToStorage(newState); // Auto-save to localStorage
      return newState;
    },
    removeCourse(state, action) {
      // action.payload should be the course ID (string)
      const newState = state.filter((course) => course.id !== action.payload);
      saveCoursesToStorage(newState); // Auto-save to localStorage
      return newState;
    },
    // New action for bulk operations
    setCourses(_, action) {
      const newState = Array.isArray(action.payload) ? action.payload : [];
      saveCoursesToStorage(newState);
      return newState;
    },
    // Action for clearing all courses (useful for reset functionality)
    clearCourses() {
      saveCoursesToStorage([]);
      return [];
    }
  },
});



// Export actions including new ones
export const { addCourse, updateCourse, removeCourse, setCourses, clearCourses } = courseSlices.actions;

// Export utility functions for use in components
export { loadCoursesFromStorage, saveCoursesToStorage, loadProgressFromStorage, saveProgressToStorage };

export default courseSlices.reducer;



// const saveCoursesToStorage = (courses) => {
//   localStorage.setItem("courses", JSON.stringify(courses));
// };

// const courseSlice = createSlice({
//   name: 'courses',
//   initialState: {
//     items: loadCoursesFromStorage(),
//   },
//   reducers: {
// addCourse(state, action) {
//   const newCourse = { ...action.payload, id: Date.now().toString() };
//   state.items.push(newCourse);
//   saveCoursesToStorage(state.items);
// },
//   },
// });

// export const { addCourse } = courseSlice.actions;
// export default courseSlice.reducer;
