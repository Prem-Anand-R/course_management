import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { addCourse } from '../redux/courseSlice';
import CourseForm from '../features/courses/CourseForm';

export default function CreateCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (courseData) => {
    console.log('CreateCourse: handleSubmit called with:', courseData);

    if (isSubmitting) {
      console.warn('Submission already in progress, ignoring duplicate request');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!courseData.title || !courseData.description) {
        throw new Error('Title and description are required');
      }

      console.log('Dispatching addCourse action...');
      dispatch(addCourse(courseData));

      console.log('Course added to Redux store successfully');

      // Show success message
      alert('Course created successfully!');

      // Navigate to courses page
      console.log('Navigating to courses page...');
      navigate('/courses');

    } catch (error) {
      console.error('Error creating course:', error);
      alert(`Error creating course: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CourseForm
        onSubmit={handleSubmit}
        mode="create"
      />

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-gray-900">Creating course...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
