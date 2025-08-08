import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { updateCourse } from '../redux/courseSlice';
import CourseForm from '../features/courses/CourseForm';

export default function EditCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get courses from Redux store
  const courses = useSelector((state) => Array.isArray(state.course) ? state.course : []);

  useEffect(() => {
    // Find the course to edit
    const course = courses.find(c => c.id === courseId);
    
    if (course) {
      setCourseData(course);
    } else {
      setError('Course not found');
    }
    
    setLoading(false);
  }, [courseId, courses]);

  const handleSubmit = (updatedCourseData) => {
    try {
      console.log('EditCourse: Updating course with data:', updatedCourseData);

      // Ensure the course ID is preserved
      const courseToUpdate = {
        ...updatedCourseData,
        id: courseId, // Preserve the original course ID
        updatedAt: new Date().toISOString()
      };

      // Use updateCourse action instead of addCourse
      dispatch(updateCourse(courseToUpdate));

      console.log('Course updated successfully in Redux store');

      // Show success message
      // alert('Course updated successfully!');

      // Navigate to courses page
      navigate('/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Error updating course. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
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
              <p className="text-sm text-red-700">{error}</p>
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
    <CourseForm 
      onSubmit={handleSubmit} 
      initialData={courseData}
      mode="edit"
    />
  );
}
