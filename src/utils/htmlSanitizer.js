/**
 * HTML Sanitization Utility for localStorage Storage
 * Strips HTML tags and inline styles while preserving plain text content
 */

/**
 * Strip HTML tags and inline styles from text content
 * @param {string} htmlString - HTML string to sanitize
 * @returns {string} Plain text content without HTML tags or styles
 */
export const stripHtmlTags = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return '';
  }

  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Get plain text content
    let plainText = tempDiv.textContent || tempDiv.innerText || '';

    // Clean up extra whitespace and line breaks
    plainText = plainText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple line breaks with single line break
      .trim(); // Remove leading/trailing whitespace

    return plainText;
  } catch (error) {
    console.warn('Error stripping HTML tags:', error);
    // Fallback: use regex to remove HTML tags (less reliable but safer)
    return htmlString
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Clean up whitespace
      .trim();
  }
};

/**
 * Remove inline styles from HTML string while preserving structure
 * @param {string} htmlString - HTML string with inline styles
 * @returns {string} HTML string without inline styles
 */
export const removeInlineStyles = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return '';
  }

  try {
    // Remove style attributes using regex
    return htmlString
      .replace(/\s*style\s*=\s*["'][^"']*["']/gi, '') // Remove style attributes
      .replace(/\s*class\s*=\s*["'][^"']*["']/gi, '') // Remove class attributes
      .replace(/\s*id\s*=\s*["'][^"']*["']/gi, '') // Remove id attributes
      .replace(/\s+>/g, '>') // Clean up extra spaces before closing tags
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim();
  } catch (error) {
    console.warn('Error removing inline styles:', error);
    return htmlString;
  }
};

/**
 * Sanitize course data for localStorage storage
 * Strips HTML from description fields while preserving structure
 * @param {Object} course - Course object to sanitize
 * @returns {Object} Sanitized course object with plain text descriptions
 */
export const sanitizeCourseForStorage = (course) => {
  if (!course || typeof course !== 'object') {
    return course;
  }

  try {
    // Create a deep copy to avoid mutating the original object
    const sanitizedCourse = JSON.parse(JSON.stringify(course));

    // Sanitize course-level description
    if (sanitizedCourse.description) {
      sanitizedCourse.description = stripHtmlTags(sanitizedCourse.description);
    }

    // Sanitize sections and lessons
    if (sanitizedCourse.sections && Array.isArray(sanitizedCourse.sections)) {
      sanitizedCourse.sections = sanitizedCourse.sections.map(section => {
        const sanitizedSection = { ...section };

        // Sanitize section description
        if (sanitizedSection.description) {
          sanitizedSection.description = stripHtmlTags(sanitizedSection.description);
        }

        // Sanitize lesson content
        if (sanitizedSection.lessons && Array.isArray(sanitizedSection.lessons)) {
          sanitizedSection.lessons = sanitizedSection.lessons.map(lesson => {
            const sanitizedLesson = { ...lesson };

            // Sanitize lesson content (store as plain text)
            if (sanitizedLesson.content) {
              sanitizedLesson.content = stripHtmlTags(sanitizedLesson.content);
            }

            // Sanitize lesson description if it exists
            if (sanitizedLesson.description) {
              sanitizedLesson.description = stripHtmlTags(sanitizedLesson.description);
            }

            return sanitizedLesson;
          });
        }

        return sanitizedSection;
      });
    }

    return sanitizedCourse;
  } catch (error) {
    console.error('Error sanitizing course for storage:', error);
    return course; // Return original course if sanitization fails
  }
};

/**
 * Sanitize multiple courses for localStorage storage
 * @param {Array} courses - Array of course objects to sanitize
 * @returns {Array} Array of sanitized course objects
 */
export const sanitizeCoursesForStorage = (courses) => {
  if (!Array.isArray(courses)) {
    return courses;
  }

  try {
    return courses.map(course => sanitizeCourseForStorage(course));
  } catch (error) {
    console.error('Error sanitizing courses for storage:', error);
    return courses;
  }
};

/**
 * Restore HTML formatting for display purposes
 * Converts plain text back to basic HTML for rich text editor
 * @param {string} plainText - Plain text content
 * @returns {string} Basic HTML formatted text
 */
export const restoreBasicHtmlFormatting = (plainText) => {
  if (!plainText || typeof plainText !== 'string') {
    return '';
  }

  try {
    // Convert line breaks to paragraph tags
    const paragraphs = plainText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => `<p>${line.trim()}</p>`)
      .join('');

    return paragraphs || `<p>${plainText}</p>`;
  } catch (error) {
    console.warn('Error restoring HTML formatting:', error);
    return `<p>${plainText}</p>`;
  }
};

/**
 * Check if content contains HTML tags
 * @param {string} content - Content to check
 * @returns {boolean} True if content contains HTML tags
 */
export const containsHtmlTags = (content) => {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const htmlTagRegex = /<[^>]*>/;
  return htmlTagRegex.test(content);
};

/**
 * Get content preview for display (first N characters of plain text)
 * @param {string} content - HTML or plain text content
 * @param {number} maxLength - Maximum length of preview (default: 100)
 * @returns {string} Plain text preview
 */
export const getContentPreview = (content, maxLength = 100) => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const plainText = stripHtmlTags(content);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
};

/**
 * Calculate storage size reduction after HTML stripping
 * @param {string} originalContent - Original HTML content
 * @param {string} strippedContent - Stripped plain text content
 * @returns {Object} Size comparison data
 */
export const calculateStorageSavings = (originalContent, strippedContent) => {
  if (!originalContent || !strippedContent) {
    return { originalSize: 0, strippedSize: 0, savings: 0, savingsPercentage: 0 };
  }

  const originalSize = new Blob([originalContent]).size;
  const strippedSize = new Blob([strippedContent]).size;
  const savings = originalSize - strippedSize;
  const savingsPercentage = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

  return {
    originalSize,
    strippedSize,
    savings,
    savingsPercentage
  };
};

// Export all functions as default object for easy importing
export default {
  stripHtmlTags,
  removeInlineStyles,
  sanitizeCourseForStorage,
  sanitizeCoursesForStorage,
  restoreBasicHtmlFormatting,
  containsHtmlTags,
  getContentPreview,
  calculateStorageSavings
};
