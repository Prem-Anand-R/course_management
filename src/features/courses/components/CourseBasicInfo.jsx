import React from 'react';
import ReactQuill from 'react-quill-new';

const CourseBasicInfo = ({ 
  courseData, 
  errors, 
  onChange, 
  onDescriptionChange, 
  onBlur,
  categories,
  difficultyLevels 
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Course Information</h3>
        
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
            onChange={onChange}
            onBlur={onBlur}
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
              onChange={onDescriptionChange}
              onBlur={onBlur}
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
            onChange={onChange}
            onBlur={onBlur}
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
              onChange={onChange}
              onBlur={onBlur}
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
                    onChange={onChange}
                    onBlur={onBlur}
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
  );
};

export default CourseBasicInfo;
