import { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const defaultCourse = {
  id: null,
  title: '',
  description: '',
  thumbnail: '',
  category: 'Programming',
  difficulty: 'Beginner',
  status: 'draft',
  sections: [],
  createdAt: null,
  updatedAt: null,
  instructor: '',
  duration: '',
  price: 0,
  enrolledStudents: 0,
  rating: 0
};

const categories = ["Programming", "Design", "Business", "Marketing", "Data Science"];
const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

// Storage keys
const STORAGE_KEY = 'course_draft_';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export default function CourseForm({ onSubmit, initialData = null, mode = 'create' }) {
  const [courseData, setCourseData] = useState(() => {
    // Load from localStorage or use initial data or default
    const courseId = initialData?.id || 'new';
    const savedData = localStorage.getItem(STORAGE_KEY + courseId);

    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved course data:', error);
      }
    }

    return initialData || { ...defaultCourse, id: courseId, createdAt: new Date().toISOString() };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const autoSaveTimeoutRef = useRef(null);

  // Auto-save functionality
  const saveToLocalStorage = useCallback((data) => {
    try {
      setIsAutoSaving(true);
      localStorage.setItem(STORAGE_KEY + data.id, JSON.stringify({
        ...data,
        updatedAt: new Date().toISOString()
      }));
      setLastSaved(new Date());
      setTimeout(() => setIsAutoSaving(false), 1000);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      setIsAutoSaving(false);
    }
  }, []);

  // Auto-save on data change
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (courseData.title || courseData.description || courseData.sections.length > 0) {
        saveToLocalStorage(courseData);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [courseData, saveToLocalStorage]);

  // Manual save on blur
  const handleBlur = useCallback(() => {
    if (courseData.title || courseData.description || courseData.sections.length > 0) {
      saveToLocalStorage(courseData);
    }
  }, [courseData, saveToLocalStorage]);

  // Validation functions
  const validateTitle = (title) => {
    if (!title.trim()) return 'Title is required';
    if (title.length < 10) return 'Title must be at least 10 characters';
    if (title.length > 60) return 'Title must not exceed 60 characters';
    return null;
  };

  const validateThumbnail = (url) => {
    if (!url.trim()) return null; // Optional field
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlPattern.test(url)) return 'Please enter a valid image URL';
    return null;
  };

  const validateCourse = () => {
    const newErrors = {};

    // Validate title
    const titleError = validateTitle(courseData.title);
    if (titleError) newErrors.title = titleError;

    // Validate thumbnail (optional but if provided, must be valid)
    const thumbnailError = validateThumbnail(courseData.thumbnail);
    if (thumbnailError) newErrors.thumbnail = thumbnailError;

    // Validate description
    if (!courseData.description || !courseData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (courseData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    // Validate category and difficulty (should always be set due to defaults)
    if (!courseData.category) {
      newErrors.category = 'Category is required';
    }

    if (!courseData.difficulty) {
      newErrors.difficulty = 'Difficulty level is required';
    }

    // Log validation results for debugging
    console.log('Validation results:', {
      courseData: {
        title: courseData.title,
        description: courseData.description?.length,
        category: courseData.category,
        difficulty: courseData.difficulty,
        sections: courseData.sections?.length
      },
      errors: newErrors
    });

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      console.warn('Validation failed with errors:', newErrors);
    }

    return isValid;
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDescriptionChange = (value) => {
    setCourseData((prev) => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: null }));
    }
  };

  // Section management
  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: '',
      description: '',
      lessons: [],
      order: courseData.sections.length
    };
    setCourseData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionId, updates) => {
    setCourseData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId) => {
    setCourseData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const reorderSections = (dragIndex, hoverIndex) => {
    setCourseData(prev => {
      const sections = [...prev.sections];
      const draggedSection = sections[dragIndex];
      sections.splice(dragIndex, 1);
      sections.splice(hoverIndex, 0, draggedSection);
      return {
        ...prev,
        sections: sections.map((section, index) => ({ ...section, order: index }))
      };
    });
  };

  // Lesson management
  const addLesson = (sectionId) => {
    const newLesson = {
      id: Date.now().toString(),
      title: '',
      content: '',
      type: 'text',
      order: 0
    };

    setCourseData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: [...section.lessons, { ...newLesson, order: section.lessons.length }]
          };
        }
        return section;
      })
    }));
  };

  const updateLesson = (sectionId, lessonId, updates) => {
    setCourseData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, ...updates } : lesson
            )
          };
        }
        return section;
      })
    }));
  };

  const deleteLesson = (sectionId, lessonId) => {
    setCourseData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.filter(lesson => lesson.id !== lessonId)
          };
        }
        return section;
      })
    }));
  };

  const reorderLessons = (sectionId, dragIndex, hoverIndex) => {
    setCourseData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          const lessons = [...section.lessons];
          const draggedLesson = lessons[dragIndex];
          lessons.splice(dragIndex, 1);
          lessons.splice(hoverIndex, 0, draggedLesson);
          return {
            ...section,
            lessons: lessons.map((lesson, index) => ({ ...lesson, order: index }))
          };
        }
        return section;
      })
    }));
  };

  // Utility functions
  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY + courseData.id);
    setLastSaved(null);
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 4; // Basic fields: title, description, category, difficulty

    if (courseData.title.trim()) completed++;
    if (courseData.description.trim()) completed++;
    if (courseData.category) completed++;
    if (courseData.difficulty) completed++;

    // Add sections and lessons to calculation
    if (courseData.sections.length > 0) {
      total += courseData.sections.length;
      completed += courseData.sections.filter(section =>
        section.title.trim() && section.lessons.length > 0
      ).length;
    }

    return Math.round((completed / total) * 100);
  };

  // Enhanced form submission with better error handling
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Form submission started...', { currentStep, courseData });

    // Validate the course data
    if (!validateCourse()) {
      console.error('Validation failed:', errors);
      alert('Please fix the validation errors before submitting.');
      return;
    }

    try {
      const finalCourseData = {
        ...courseData,
        id: courseData.id === 'new' ? Date.now().toString() : courseData.id,
        createdAt: courseData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        instructor: courseData.instructor || 'Unknown',
        duration: calculateDuration(),
        status: 'published',
        enrolledStudents: 0,
        rating: 0,
        price: courseData.price || 0
      };

      console.log('Final course data:', finalCourseData);

      // Call the onSubmit prop function
      onSubmit(finalCourseData);

      // Clear localStorage after successful submission
      clearStorage();

      console.log('Course submission completed successfully');
    } catch (error) {
      console.error('Error during form submission:', error);
      alert('An error occurred while creating the course. Please try again.');
    }
  };

  const calculateDuration = () => {
    const totalLessons = courseData.sections.reduce((total, section) =>
      total + section.lessons.length, 0
    );
    return `${Math.max(1, Math.ceil(totalLessons / 3))} weeks`;
  };

  // Step validation functions
  const validateStep1 = () => {
    const step1Errors = {};

    const titleError = validateTitle(courseData.title);
    if (titleError) step1Errors.title = titleError;

    if (!courseData.description || !courseData.description.trim()) {
      step1Errors.description = 'Description is required';
    } else if (courseData.description.trim().length < 50) {
      step1Errors.description = 'Description must be at least 50 characters';
    }

    const thumbnailError = validateThumbnail(courseData.thumbnail);
    if (thumbnailError) step1Errors.thumbnail = thumbnailError;

    return step1Errors;
  };

  const validateStep2 = () => {
    const step2Errors = {};

    if (courseData.sections.length === 0) {
      step2Errors.sections = 'At least one section is required';
    } else {
      // Check if sections have titles
      const sectionsWithoutTitles = courseData.sections.filter(section => !section.title.trim());
      if (sectionsWithoutTitles.length > 0) {
        step2Errors.sections = 'All sections must have titles';
      }

      // Check if at least one section has lessons
      const totalLessons = courseData.sections.reduce((total, section) => total + section.lessons.length, 0);
      if (totalLessons === 0) {
        step2Errors.lessons = 'At least one lesson is required';
      }
    }

    return step2Errors;
  };

  // Enhanced step navigation with validation
  const handleNextStep = () => {
    let stepErrors = {};

    if (currentStep === 1) {
      stepErrors = validateStep1();
    } else if (currentStep === 2) {
      stepErrors = validateStep2();
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      console.warn(`Step ${currentStep} validation failed:`, stepErrors);

      // Show user-friendly error message
      const errorMessages = Object.values(stepErrors);
      alert(`Please fix the following issues before proceeding:\n\n${errorMessages.join('\n')}`);
      return;
    }

    // Clear errors and proceed to next step
    setErrors({});
    setCurrentStep(currentStep + 1);
    console.log(`Proceeding to step ${currentStep + 1}`);
  };

  const handleReset = () => {
    if (courseData.title || courseData.description || courseData.sections.length > 0) {
      setShowConfirmDialog(true);
      setPendingAction('reset');
    } else {
      setCourseData(defaultCourse);
      clearStorage();
    }
  };

  const confirmAction = () => {
    if (pendingAction === 'reset') {
      setCourseData({ ...defaultCourse, id: 'new', createdAt: new Date().toISOString() });
      clearStorage();
      setCurrentStep(1);
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const steps = [
    { id: 1, name: 'Basic Information', description: 'Course title, description, and details' },
    { id: 2, name: 'Course Content', description: 'Sections and lessons structure' },
    { id: 3, name: 'Review & Publish', description: 'Review and finalize your course' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="text-gray-600 mt-1">
              {mode === 'edit' ? 'Update your course information and content' : 'Build an engaging learning experience'}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => window.history.back()}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{getCompletionPercentage()}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>

        {/* Auto-save indicator */}
        {(isAutoSaving || lastSaved) && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            {isAutoSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Last saved {lastSaved?.toLocaleTimeString()}
              </>
            )}
          </div>
        )}

        {/* Step Navigation */}
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={`relative w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      currentStep === step.id
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : currentStep > step.id
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    } hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </button>
                  <div className="ml-4 min-w-0">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="hidden sm:block absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Course Information</h3>

                {/* Error Summary for Step 1 */}
                {Object.keys(errors).length > 0 && (
                  <div className="mb-6 p-4 border border-red-300 rounded-md bg-red-50">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Please fix the following errors:
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {Object.entries(errors).map(([field, error]) => (
                              <li key={field}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Title Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">
                    Course Title *
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 transition duration-200`}
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Enter a descriptive title (10-60 characters)"
                    value={courseData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>
                    <p className={`text-xs ${
                      courseData.title.length > 60 ? 'text-red-500' :
                      courseData.title.length < 10 ? 'text-yellow-500' : 'text-gray-500'
                    }`}>
                      {courseData.title.length}/60 characters
                    </p>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                    Course Description *
                  </label>
                  <div className={`border rounded-lg overflow-hidden ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}>
                    <ReactQuill
                      className="h-64"
                      value={courseData.description}
                      onChange={handleDescriptionChange}
                      onBlur={handleBlur}
                      placeholder="Describe your course content, objectives, and what students will learn..."
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'blockquote'],
                          ['clean']
                        ]
                      }}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Thumbnail Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="thumbnail">
                    Course Thumbnail
                  </label>
                  <input
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.thumbnail ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } focus:outline-none focus:ring-2 transition duration-200`}
                    id="thumbnail"
                    type="url"
                    name="thumbnail"
                    placeholder="https://example.com/image.jpg"
                    value={courseData.thumbnail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.thumbnail && (
                    <p className="text-sm text-red-600 mt-1">{errors.thumbnail}</p>
                  )}
                  {courseData.thumbnail && !errors.thumbnail && (
                    <div className="mt-3">
                      <img
                        src={courseData.thumbnail}
                        alt="Course thumbnail preview"
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          setErrors(prev => ({ ...prev, thumbnail: 'Invalid image URL' }));
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Category and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">
                      Category *
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                      id="category"
                      name="category"
                      value={courseData.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level *
                    </label>
                    <div className="space-y-2">
                      {difficultyLevels.map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="radio"
                            name="difficulty"
                            value={level}
                            checked={courseData.difficulty === level}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Course Content Structure */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Course Content Structure</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Organize your course into sections and lessons. Each section should cover a specific topic or learning objective.
                </p>

                {/* Error Summary for Step 2 */}
                {Object.keys(errors).length > 0 && (
                  <div className="mb-6 p-4 border border-red-300 rounded-md bg-red-50">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Please fix the following issues:
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {Object.entries(errors).map(([field, error]) => (
                              <li key={field}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sections */}
                <div className="space-y-4">
                  {courseData.sections.map((section, sectionIndex) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Section {sectionIndex + 1}</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => deleteSection(section.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete Section
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Title *
                          </label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            onBlur={handleBlur}
                            placeholder="Enter section title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Description
                          </label>
                          <textarea
                            value={section.description}
                            onChange={(e) => updateSection(section.id, { description: e.target.value })}
                            onBlur={handleBlur}
                            placeholder="Describe what students will learn in this section"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Lessons */}
                      <div className="ml-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-700">Lessons</h5>
                          <button
                            type="button"
                            onClick={() => addLesson(section.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            + Add Lesson
                          </button>
                        </div>

                        {section.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="border border-gray-100 rounded-md p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Lesson {lessonIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => deleteLesson(section.id, lesson.id)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })}
                                onBlur={handleBlur}
                                placeholder="Lesson title"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <div className="border border-gray-300 rounded-md overflow-hidden">
                                <ReactQuill
                                  value={lesson.content}
                                  onChange={(content) => updateLesson(section.id, lesson.id, { content })}
                                  placeholder="Lesson content..."
                                  className="h-32"
                                  modules={{
                                    toolbar: [
                                      ['bold', 'italic', 'underline'],
                                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                      ['link']
                                    ]
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {section.lessons.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No lessons yet. Click "Add Lesson" to get started.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {courseData.sections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-4">No sections yet. Start building your course structure.</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addSection}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors duration-200"
                  >
                    + Add New Section
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Publish */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Publish</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Review your course information before publishing. You can always edit it later.
                </p>

                {/* Course Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Course Summary</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Title</dt>
                      <dd className="text-sm text-gray-900">{courseData.title || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="text-sm text-gray-900">{courseData.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Difficulty</dt>
                      <dd className="text-sm text-gray-900">{courseData.difficulty}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sections</dt>
                      <dd className="text-sm text-gray-900">{courseData.sections.length}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Lessons</dt>
                      <dd className="text-sm text-gray-900">
                        {courseData.sections.reduce((total, section) => total + section.lessons.length, 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estimated Duration</dt>
                      <dd className="text-sm text-gray-900">{calculateDuration()}</dd>
                    </div>
                  </dl>
                </div>

                {/* Validation Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Readiness Check</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${courseData.title.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm text-gray-700">Course title</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${courseData.description.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm text-gray-700">Course description</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${courseData.sections.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm text-gray-700">At least one section</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        courseData.sections.some(section => section.lessons.length > 0) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm text-gray-700">At least one lesson</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m0 0H3" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {mode === 'edit' ? 'Update Course' : 'Publish Course'}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Confirm Reset</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to reset the form? All unsaved changes will be lost.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
