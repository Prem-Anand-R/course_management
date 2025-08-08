import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';

export default function LessonDetail() {
  const navigate = useNavigate();
  const { courseId, sectionId, lessonId } = useParams();
  const [course, setCourse] = useState(null);
  const [section, setSection] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({});
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [allLessons, setAllLessons] = useState([]);

  // Get courses from Redux store
  const courses = useSelector((state) => Array.isArray(state.course) ? state.course : []);

  // Progress tracking functions
  const loadProgress = useCallback(() => {
    try {
      const savedProgress = localStorage.getItem(`course_progress_${courseId}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, [courseId]);

  const saveProgress = useCallback((newProgress) => {
    try {
      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [courseId]);

  const toggleLessonCompletion = useCallback(() => {
    const newProgress = { ...progress };
    
    if (newProgress[lessonId]?.completed) {
      // Mark as incomplete
      delete newProgress[lessonId];
    } else {
      // Mark as complete
      newProgress[lessonId] = {
        completed: true,
        completedAt: new Date().toISOString()
      };
    }
    
    saveProgress(newProgress);
  }, [progress, saveProgress, lessonId]);

  // Navigation functions
  const goToPreviousLesson = useCallback(() => {
    if (currentLessonIndex > 0) {
      const prevLesson = allLessons[currentLessonIndex - 1];
      navigate(`/courses/${courseId}/sections/${prevLesson.sectionId}/lessons/${prevLesson.id}`);
    }
  }, [currentLessonIndex, allLessons, navigate, courseId]);

  const goToNextLesson = useCallback(() => {
    if (currentLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentLessonIndex + 1];
      navigate(`/courses/${courseId}/sections/${nextLesson.sectionId}/lessons/${nextLesson.id}`);
    }
  }, [currentLessonIndex, allLessons, navigate, courseId]);

  useEffect(() => {
    // Find the course, section, and lesson
    const foundCourse = courses.find(c => c.id === courseId);
    
    if (foundCourse) {
      setCourse(foundCourse);
      
      const foundSection = foundCourse.sections?.find(s => s.id === sectionId);
      if (foundSection) {
        setSection(foundSection);
        
        const foundLesson = foundSection.lessons?.find(l => l.id === lessonId);
        if (foundLesson) {
          setLesson(foundLesson);
          
          // Build flat list of all lessons for navigation
          const lessons = [];
          foundCourse.sections?.forEach(sec => {
            sec.lessons?.forEach(les => {
              lessons.push({
                ...les,
                sectionId: sec.id,
                sectionTitle: sec.title
              });
            });
          });
          setAllLessons(lessons);
          
          // Find current lesson index
          const index = lessons.findIndex(l => l.id === lessonId);
          setCurrentLessonIndex(index);
          
          loadProgress();
        } else {
          setError('Lesson not found');
        }
      } else {
        setError('Section not found');
      }
    } else {
      setError('Course not found');
    }
    
    setLoading(false);
  }, [courseId, sectionId, lessonId, courses, loadProgress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !course || !section || !lesson) {
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
              <p className="text-sm text-red-700">{error || 'Content not found'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = progress[lessonId]?.completed;
  const lessonNumber = allLessons.findIndex(l => l.id === lessonId) + 1;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/courses" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Courses</span>
                <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
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
                <Link to={`/courses/${courseId}`} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  {course.title}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500" aria-current="page">
                  {lesson.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Lesson Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm text-gray-500">Lesson {lessonNumber}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">{section.title}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleLessonCompletion}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isCompleted
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className={`w-4 h-4 mr-2 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="p-6">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content || '<p>No content available for this lesson.</p>') }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentLessonIndex > 0 && (
            <button
              onClick={goToPreviousLesson}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous Lesson
            </button>
          )}
        </div>

        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Course
        </Link>

        <div>
          {currentLessonIndex < allLessons.length - 1 && (
            <button
              onClick={goToNextLesson}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next Lesson
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
