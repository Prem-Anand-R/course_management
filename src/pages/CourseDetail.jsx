import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { removeCourse } from '../redux/courseSlice';
import DOMPurify from 'dompurify';
import { useProgress } from '../contexts/ProgressContext';

export default function CourseDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Use progress context for real-time updates
  const {
    progress,
    toggleLessonCompletion,
    calculateCourseProgress,
    toggleCourseBookmark,
    isCourseBookmarked
  } = useProgress();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced state for new features
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get courses from Redux store
  const courses = useSelector((state) => Array.isArray(state.course) ? state.course : []);

  // Bookmark state (still using local state for this component)
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Initialize bookmark status
  useEffect(() => {
    setIsBookmarked(isCourseBookmarked(courseId));
  }, [courseId, isCourseBookmarked]);

  // Bookmark toggle function
  const handleToggleBookmark = useCallback(() => {
    const newStatus = toggleCourseBookmark(courseId);
    setIsBookmarked(newStatus);
  }, [courseId, toggleCourseBookmark]);

  const toggleSectionExpansion = useCallback((sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  }, [expandedSections]);

  const handleDeleteCourse = useCallback(() => {
    try {
      dispatch(removeCourse(courseId));
      alert('Course deleted successfully!');
      navigate('/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course. Please try again.');
    }
  }, [dispatch, courseId, navigate]);

  useEffect(() => {
    // Find the course to display
    const foundCourse = courses.find(c => c.id === courseId);

    if (foundCourse) {
      setCourse(foundCourse);
      // Bookmark status is handled by the separate useEffect above
    } else {
      setError('Course not found');
    }

    setLoading(false);
  }, [courseId, courses]);

  // Enhanced calculation functions using new progress tracking system
  const courseStats = useCallback(() => {
    return calculateCourseProgress(course);
  }, [course, calculateCourseProgress]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Programming':
        return 'bg-blue-100 text-blue-800';
      case 'Design':
        return 'bg-purple-100 text-purple-800';
      case 'Business':
        return 'bg-green-100 text-green-800';
      case 'Marketing':
        return 'bg-pink-100 text-pink-800';
      case 'Data Science':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Course not found'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/courses" className="text-gray-400 hover:text-gray-500">
                <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="sr-only">Courses</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/courses" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Courses
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500" aria-current="page">
                  {course.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Enhanced Course Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="relative">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
            alt={course.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(course.category)}`}>
                    {course.category}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === 'published' ? 'bg-green-100 text-green-800' :
                    course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status || 'Draft'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-gray-200 text-lg">By {course.instructor || 'Unknown'}</p>

                {/* Course Stats */}
                <div className="flex items-center space-x-4 mt-3 text-gray-200 text-sm">
                  <span>{courseStats().totalSections} sections</span>
                  <span>•</span>
                  <span>{courseStats().totalLessons} lessons</span>
                  <span>•</span>
                  <span>{course.enrolledStudents || 0} students</span>
                  {courseStats().completionPercentage > 0 && (
                    <>
                      <span>•</span>
                      <span>{courseStats().completionPercentage}% complete</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleToggleBookmark}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isBookmarked
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                <Link
                  to={`/courses/${course.id}/edit`}
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Main Content */}
            <div className="lg:col-span-2">
              {/* Course Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Course Description</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description) }}
                />
              </div>

              {/* Progress Overview */}
              {courseStats().totalLessons > 0 && (
                <div className="mb-6 bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Your Progress</h3>
                    <span className="text-sm font-medium text-indigo-600">
                      {courseStats().completedLessons} of {courseStats().totalLessons} lessons completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${courseStats().completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {courseStats().completionPercentage}% complete
                    {courseStats().completionPercentage === 100 && (
                      <span className="ml-2 text-green-600 font-medium">🎉 Congratulations! Course completed!</span>
                    )}
                  </p>
                </div>
              )}

              {/* Enhanced Course Content with Expandable Sections */}
              {course.sections && course.sections.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
                    <button
                      onClick={() => {
                        if (expandedSections.size === course.sections.length) {
                          setExpandedSections(new Set());
                        } else {
                          setExpandedSections(new Set(course.sections.map(s => s.id)));
                        }
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {expandedSections.size === course.sections.length ? 'Collapse All' : 'Expand All'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {course.sections.map((section, sectionIndex) => {
                      const isExpanded = expandedSections.has(section.id);
                      const sectionLessons = section.lessons || [];
                      const completedInSection = sectionLessons.filter(lesson => progress[lesson.id]?.completed).length;

                      return (
                        <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div
                            className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => toggleSectionExpansion(section.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h3 className="font-medium text-gray-900 mr-3">
                                    Section {sectionIndex + 1}: {section.title}
                                  </h3>
                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                    {sectionLessons.length} lesson{sectionLessons.length !== 1 ? 's' : ''}
                                  </span>
                                  {completedInSection > 0 && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                                      {completedInSection}/{sectionLessons.length} completed
                                    </span>
                                  )}
                                </div>
                                {section.description && (
                                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                )}
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>

                          {/* Expandable Lessons */}
                          {isExpanded && sectionLessons.length > 0 && (
                            <div className="p-4 bg-white">
                              <div className="space-y-3">
                                {sectionLessons.map((lesson, lessonIndex) => {
                                  const isCompleted = progress[lesson.id]?.completed;
                                  const lessonContent = lesson.content || '';
                                  const contentPreview = lessonContent.replace(/<[^>]*>/g, '').substring(0, 100);

                                  return (
                                    <div key={lesson.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                                      <div className="flex-shrink-0 mt-1">
                                        <input
                                          type="checkbox"
                                          checked={isCompleted}
                                          onChange={() => toggleLessonCompletion(lesson.id)}
                                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <h4 className={`text-sm font-medium ${isCompleted ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                                            Lesson {lessonIndex + 1}: {lesson.title}
                                          </h4>
                                          <Link
                                            to={`/courses/${courseId}/sections/${section.id}/lessons/${lesson.id}`}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                          >
                                            View Lesson
                                          </Link>
                                        </div>
                                        {contentPreview && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {contentPreview}{lessonContent.length > 100 ? '...' : ''}
                                          </p>
                                        )}
                                        {isCompleted && progress[lesson.id]?.completedAt && (
                                          <p className="text-xs text-green-600 mt-1">
                                            Completed on {new Date(progress[lesson.id].completedAt).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                <div className="space-y-6">
                  {/* Rating and Enrollment */}
                  <div>
                    <div className="flex items-center mb-2">
                      {renderStars(course.rating || 0)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({course.rating || 0})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{course.enrolledStudents || 0} students enrolled</p>
                  </div>

                  {/* Progress Statistics */}
                  {courseStats().totalLessons > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Learning Progress</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Completed:</span>
                          <span className="font-medium text-gray-900">
                            {courseStats().completedLessons}/{courseStats().totalLessons} lessons
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress:</span>
                          <span className="font-medium text-indigo-600">
                            {courseStats().completionPercentage}%
                          </span>
                        </div>
                        {courseStats().completionPercentage === 100 && (
                          <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-green-800">Course Completed!</span>
                            </div>
                            <button className="mt-2 text-xs text-green-700 hover:text-green-900 underline">
                              Generate Certificate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Course Information */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Course Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sections:</span>
                        <span className="font-medium text-gray-900">{courseStats().totalSections}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Lessons:</span>
                        <span className="font-medium text-gray-900">{courseStats().totalLessons}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium text-gray-900">{course.duration || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className={`text-sm font-medium ${
                          course.status === 'published' ? 'text-green-600' :
                          course.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {course.status || 'Draft'}
                        </span>
                      </div>
                      {course.price && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Price:</span>
                          <span className="text-lg font-bold text-indigo-600">${course.price}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <Link
                      to={`/courses/${course.id}/edit`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Course
                    </Link>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Course
                    </button>

                    <button
                      onClick={() => navigate('/courses')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      Back to Courses
                    </button>
                  </div>

                  {/* Social Sharing */}
                  {courseStats().completionPercentage === 100 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Share Your Achievement</h4>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors duration-200">
                          Twitter
                        </button>
                        <button className="flex-1 bg-blue-800 text-white text-xs py-2 px-3 rounded hover:bg-blue-900 transition-colors duration-200">
                          LinkedIn
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Course
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{course.title}"? This action cannot be undone and will permanently remove the course and all its content.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteCourse();
                  setShowDeleteConfirm(false);
                }}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
