import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import CourseFilters from '../components/CourseFilters';
import ViewToggle from '../components/ViewToggle';
import Pagination from '../components/Pagination';
import Breadcrumb from '../components/Breadcrumb';
import BulkActions from '../components/BulkActions';
import ConfirmationDialog from '../components/ConfirmationDialog';
import SearchBar from '../components/SearchBar';
import { removeCourse } from '../redux/courseSlice';
import { useProgress } from '../contexts/ProgressContext';

const Courses = () => {
  const dispatch = useDispatch();
  const courses = useSelector((state) => Array.isArray(state.course) ? state.course : []);

  // Use progress context for real-time progress tracking
  const { getAllCoursesProgress } = useProgress();

  // Removed filteredCourses state - now using filteredAndSortedCourses directly
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    status: 'all',
    sortBy: 'newest'
  });

  // Enhanced state for new features
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const coursesPerPage = 10; // Changed to exactly 10 as specified

  // Mock data for demonstration when no courses exist


  // Ensure allCourses is always a valid array with proper type checking
  const allCourses = Array.isArray(courses) && courses.length > 0 ? courses : "No courses found";

  // Debounced search functionality
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);

    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
    }, 300);

    setSearchDebounceTimer(timer);
  }, [searchDebounceTimer]);

  // Clear search functionality
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilters(prev => ({ ...prev, search: '' }));
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
  }, [searchDebounceTimer]);

  // Bulk selection handlers
  const handleSelectCourse = useCallback((courseId) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  }, []);

  // Course management handlers
  const handleDeleteCourse = useCallback((courseId) => {
    setConfirmAction({
      type: 'delete',
      courseIds: [courseId],
      message: 'Are you sure you want to delete this course? This action cannot be undone.'
    });
    setShowConfirmDialog(true);
  }, []);

  const handleBulkDelete = useCallback(() => {
    const selectedIds = Array.from(selectedCourses);
    setConfirmAction({
      type: 'bulkDelete',
      courseIds: selectedIds,
      message: `Are you sure you want to delete ${selectedIds.length} course(s)? This action cannot be undone.`
    });
    setShowConfirmDialog(true);
  }, [selectedCourses]);

  const confirmDeleteAction = useCallback(async () => {
    if (!confirmAction) return;

    setBulkActionLoading(true);
    try {
      // Dispatch delete actions for each course
      confirmAction.courseIds.forEach(courseId => {
        dispatch(removeCourse(courseId));
      });

      // Clear selections
      setSelectedCourses(new Set());
      setShowConfirmDialog(false);
      setConfirmAction(null);

      // Show success message
      const message = confirmAction.courseIds.length === 1
        ? 'Course deleted successfully'
        : `${confirmAction.courseIds.length} courses deleted successfully`;

      // You could replace this with a toast notification
      alert(message);

    } catch (error) {
      console.error('Error deleting courses:', error);
      alert('Error deleting courses. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  }, [confirmAction, dispatch]);

  useEffect(() => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Enhanced filtering with memoization for performance
  const filteredAndSortedCourses = useMemo(() => {
    // Defensive programming: ensure allCourses is a valid array
    if (!Array.isArray(allCourses)) {
      console.warn('allCourses is not an array:', allCourses);
      return [];
    }

    let filtered = [...allCourses];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(course => course.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(course => course.difficulty === filters.difficulty);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(course => course.status === filters.status);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'alphabetical-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [filters, allCourses]);

  // Reset page and selections when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedCourses(new Set());
  }, [filters]);

  // Enhanced pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredAndSortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);

  // handleSelectAll function - optimized to prevent infinite re-renders
  const handleSelectAll = useCallback(() => {
    const currentPageCourses = filteredAndSortedCourses.slice(
      (currentPage - 1) * coursesPerPage,
      currentPage * coursesPerPage
    );

    if (selectedCourses.size === currentPageCourses.length && currentPageCourses.length > 0) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(currentPageCourses.map(course => course.id)));
    }
  }, [selectedCourses.size, filteredAndSortedCourses, currentPage, coursesPerPage]);

  // Calculate stats for display with defensive programming
  const safeAllCourses = Array.isArray(allCourses) ? allCourses : [];
  const totalCourses = safeAllCourses.length;
  const publishedCourses = safeAllCourses.filter(c => c && c.status === 'published').length;

  // Calculate progress-based metrics using the progress context
  const progressMetrics = useMemo(() => {
    if (totalCourses === 0) {
      return {
        totalCourses: 0,
        inProgressCourses: 0,
        completedCourses: 0
      };
    }

    const coursesProgress = getAllCoursesProgress(safeAllCourses);
    let inProgressCourses = 0;
    let completedCourses = 0;

    Object.values(coursesProgress).forEach(courseProgress => {
      if (courseProgress.completionPercentage === 100) {
        completedCourses++;
      } else if (courseProgress.completionPercentage > 0) {
        inProgressCourses++;
      }
    });

    return {
      totalCourses,
      inProgressCourses,
      completedCourses
    };
  }, [totalCourses, safeAllCourses, getAllCoursesProgress]);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Courses', href: '/courses', current: true }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Enhanced Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-gray-600">
            Manage and organize your course content
          </p>
          {filteredAndSortedCourses.length !== totalCourses && (
            <p className="text-sm text-indigo-600 mt-1">
              Showing {filteredAndSortedCourses.length} of {totalCourses} courses
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedCourses.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedCourses.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {bulkActionLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Delete Selected
              </button>
            </div>
          )}
          <Link
            to="/create-course"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Course
          </Link>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCourses}</p>
            </div>
          </div>
        </div>

        

        {/* Total Courses Card */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{progressMetrics.totalCourses}</p>
            </div>
          </div>
        </div> */}

        {/* In Progress Courses Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{progressMetrics.inProgressCourses}</p>
            </div>
          </div>
        </div>

        {/* Completed Courses Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{progressMetrics.completedCourses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Search Bar */}
        <div className="mb-6">
          {/* <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses, instructors..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div> */}
         
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <CourseFilters filters={filters} setFilters={setFilters} />
            
          </div>
          <div className="flex items-center gap-4">
            {/* Bulk Selection Controls */}
            {currentCourses.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCourses.size === currentCourses.length && currentCourses.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select All ({currentCourses.length})
                  </span>
                </label>
              </div>
            )}
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        </div>
      </div>

      {/* Enhanced Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-700">
          Showing {indexOfFirstCourse + 1} to {Math.min(indexOfLastCourse, filteredAndSortedCourses.length)} of {filteredAndSortedCourses.length} courses
          {selectedCourses.size > 0 && (
            <span className="ml-2 text-indigo-600 font-medium">
              • {selectedCourses.size} selected
            </span>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Enhanced Course Grid/List */}
      {currentCourses.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.category !== 'all' || filters.difficulty !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first course.'
            }
          </p>
          <div className="mt-6">
            <Link
              to="/create-course"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create your first course
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {currentCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                viewMode={viewMode}
                isSelected={selectedCourses.has(course.id)}
                onSelect={() => handleSelectCourse(course.id)}
                onDelete={() => handleDeleteCourse(course.id)}
              />
            ))}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                {confirmAction.type === 'bulkDelete' ? 'Delete Multiple Courses' : 'Delete Course'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {confirmAction.message}
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAction}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {bulkActionLoading ? (
                    <svg className="animate-spin h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
