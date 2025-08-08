/**
 * Data Migration Utility for localStorage HTML Cleanup
 * Handles migration of existing course data to remove HTML tags
 */

import { sanitizeCoursesForStorage, containsHtmlTags, stripHtmlTags } from './htmlSanitizer';

const COURSES_STORAGE_KEY = "courses";
const MIGRATION_VERSION_KEY = "course_data_migration_version";
const CURRENT_MIGRATION_VERSION = "1.0.0";

/**
 * Check if data migration is needed
 * @returns {boolean} True if migration is required
 */
export const isMigrationNeeded = () => {
  try {
    const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
    return currentVersion !== CURRENT_MIGRATION_VERSION;
  } catch (error) {
    console.warn('Error checking migration version:', error);
    return true; // Assume migration is needed if we can't check
  }
};

/**
 * Analyze existing course data for HTML content
 * @returns {Object} Analysis results
 */
export const analyzeExistingData = () => {
  try {
    const stored = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!stored) {
      return {
        hasData: false,
        totalCourses: 0,
        coursesWithHtml: 0,
        sectionsWithHtml: 0,
        lessonsWithHtml: 0,
        estimatedSavings: 0
      };
    }

    const courses = JSON.parse(stored);
    if (!Array.isArray(courses)) {
      return { hasData: false, error: 'Invalid data format' };
    }

    let coursesWithHtml = 0;
    let sectionsWithHtml = 0;
    let lessonsWithHtml = 0;
    let totalOriginalSize = 0;
    let totalCleanedSize = 0;

    courses.forEach(course => {
      // Analyze course description
      if (course.description && containsHtmlTags(course.description)) {
        coursesWithHtml++;
        totalOriginalSize += course.description.length;
        totalCleanedSize += stripHtmlTags(course.description).length;
      }

      // Analyze sections
      if (course.sections && Array.isArray(course.sections)) {
        course.sections.forEach(section => {
          if (section.description && containsHtmlTags(section.description)) {
            sectionsWithHtml++;
            totalOriginalSize += section.description.length;
            totalCleanedSize += stripHtmlTags(section.description).length;
          }

          // Analyze lessons
          if (section.lessons && Array.isArray(section.lessons)) {
            section.lessons.forEach(lesson => {
              if (lesson.content && containsHtmlTags(lesson.content)) {
                lessonsWithHtml++;
                totalOriginalSize += lesson.content.length;
                totalCleanedSize += stripHtmlTags(lesson.content).length;
              }
            });
          }
        });
      }
    });

    const estimatedSavings = totalOriginalSize - totalCleanedSize;
    const savingsPercentage = totalOriginalSize > 0 ? 
      Math.round((estimatedSavings / totalOriginalSize) * 100) : 0;

    return {
      hasData: true,
      totalCourses: courses.length,
      coursesWithHtml,
      sectionsWithHtml,
      lessonsWithHtml,
      estimatedSavings,
      savingsPercentage,
      originalSize: totalOriginalSize,
      cleanedSize: totalCleanedSize
    };
  } catch (error) {
    console.error('Error analyzing existing data:', error);
    return { hasData: false, error: error.message };
  }
};

/**
 * Migrate existing course data to remove HTML tags
 * @param {boolean} createBackup - Whether to create a backup before migration
 * @returns {Object} Migration results
 */
export const migrateExistingData = (createBackup = true) => {
  try {
    const stored = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!stored) {
      // No data to migrate, just set the migration version
      localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
      return {
        success: true,
        message: 'No existing data to migrate',
        coursesProcessed: 0
      };
    }

    // Create backup if requested
    if (createBackup) {
      const backupKey = `${COURSES_STORAGE_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, stored);
      console.info(`Backup created with key: ${backupKey}`);
    }

    const courses = JSON.parse(stored);
    if (!Array.isArray(courses)) {
      throw new Error('Invalid course data format');
    }

    // Analyze data before migration
    const beforeAnalysis = analyzeExistingData();

    // Sanitize the courses
    const sanitizedCourses = sanitizeCoursesForStorage(courses);

    // Save the cleaned data
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(sanitizedCourses));

    // Mark migration as complete
    localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);

    // Calculate actual savings
    const originalSize = new Blob([stored]).size;
    const newSize = new Blob([JSON.stringify(sanitizedCourses)]).size;
    const actualSavings = originalSize - newSize;
    const actualSavingsPercentage = originalSize > 0 ? 
      Math.round((actualSavings / originalSize) * 100) : 0;

    console.info('Data migration completed successfully:', {
      coursesProcessed: courses.length,
      originalSize,
      newSize,
      actualSavings,
      actualSavingsPercentage
    });

    return {
      success: true,
      message: 'Data migration completed successfully',
      coursesProcessed: courses.length,
      beforeAnalysis,
      originalSize,
      newSize,
      actualSavings,
      actualSavingsPercentage
    };
  } catch (error) {
    console.error('Error during data migration:', error);
    return {
      success: false,
      error: error.message,
      message: 'Data migration failed'
    };
  }
};

/**
 * Restore data from backup
 * @param {string} backupKey - The backup key to restore from
 * @returns {Object} Restoration results
 */
export const restoreFromBackup = (backupKey) => {
  try {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) {
      throw new Error('Backup not found');
    }

    // Validate backup data
    const courses = JSON.parse(backupData);
    if (!Array.isArray(courses)) {
      throw new Error('Invalid backup data format');
    }

    // Restore the data
    localStorage.setItem(COURSES_STORAGE_KEY, backupData);

    // Reset migration version to trigger re-migration if needed
    localStorage.removeItem(MIGRATION_VERSION_KEY);

    return {
      success: true,
      message: 'Data restored from backup successfully',
      coursesRestored: courses.length
    };
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to restore from backup'
    };
  }
};

/**
 * List available backups
 * @returns {Array} List of backup keys with metadata
 */
export const listBackups = () => {
  try {
    const backups = [];
    const backupPrefix = `${COURSES_STORAGE_KEY}_backup_`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(backupPrefix)) {
        const timestamp = key.replace(backupPrefix, '');
        const date = new Date(parseInt(timestamp));
        const data = localStorage.getItem(key);
        
        try {
          const courses = JSON.parse(data);
          backups.push({
            key,
            timestamp: parseInt(timestamp),
            date: date.toLocaleString(),
            coursesCount: Array.isArray(courses) ? courses.length : 0,
            size: new Blob([data]).size
          });
        } catch (parseError) {
          console.warn(`Invalid backup data for key ${key}:`, parseError);
        }
      }
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
};

/**
 * Clean up old backups (keep only the most recent N backups)
 * @param {number} keepCount - Number of backups to keep (default: 3)
 * @returns {Object} Cleanup results
 */
export const cleanupOldBackups = (keepCount = 3) => {
  try {
    const backups = listBackups();
    
    if (backups.length <= keepCount) {
      return {
        success: true,
        message: 'No cleanup needed',
        backupsRemoved: 0,
        backupsRemaining: backups.length
      };
    }

    const backupsToRemove = backups.slice(keepCount);
    let removedCount = 0;

    backupsToRemove.forEach(backup => {
      try {
        localStorage.removeItem(backup.key);
        removedCount++;
      } catch (error) {
        console.warn(`Failed to remove backup ${backup.key}:`, error);
      }
    });

    return {
      success: true,
      message: `Cleaned up ${removedCount} old backups`,
      backupsRemoved: removedCount,
      backupsRemaining: backups.length - removedCount
    };
  } catch (error) {
    console.error('Error cleaning up backups:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to cleanup backups'
    };
  }
};

/**
 * Run automatic migration check and migrate if needed
 * This should be called on app startup
 * @returns {Object} Migration results
 */
export const runAutoMigration = () => {
  try {
    if (!isMigrationNeeded()) {
      return {
        success: true,
        message: 'No migration needed',
        migrationRun: false
      };
    }

    console.info('Running automatic data migration...');
    const result = migrateExistingData(true);
    
    if (result.success) {
      // Clean up old backups after successful migration
      cleanupOldBackups(3);
    }

    return {
      ...result,
      migrationRun: true
    };
  } catch (error) {
    console.error('Error during auto migration:', error);
    return {
      success: false,
      error: error.message,
      message: 'Auto migration failed',
      migrationRun: false
    };
  }
};

// Export all functions
export default {
  isMigrationNeeded,
  analyzeExistingData,
  migrateExistingData,
  restoreFromBackup,
  listBackups,
  cleanupOldBackups,
  runAutoMigration
};
