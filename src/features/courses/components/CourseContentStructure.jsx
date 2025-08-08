import React from 'react';
import ReactQuill from 'react-quill-new';

const CourseContentStructure = ({ 
  courseData, 
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onBlur
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Course Content Structure</h3>
        <p className="text-sm text-gray-600 mb-6">
          Organize your course into sections and lessons. Each section should cover a specific topic or learning objective.
        </p>

        {/* Sections */}
        <div className="space-y-4">
          {courseData.sections.map((section, sectionIndex) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Section {sectionIndex + 1}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onDeleteSection(section.id)}
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
                    onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
                    onBlur={onBlur}
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
                    onChange={(e) => onUpdateSection(section.id, { description: e.target.value })}
                    onBlur={onBlur}
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
                    onClick={() => onAddLesson(section.id)}
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
                        onClick={() => onDeleteLesson(section.id, lesson.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => onUpdateLesson(section.id, lesson.id, { title: e.target.value })}
                        onBlur={onBlur}
                        placeholder="Lesson title"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <ReactQuill
                          value={lesson.content}
                          onChange={(content) => onUpdateLesson(section.id, lesson.id, { content })}
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
            onClick={onAddSection}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors duration-200"
          >
            + Add New Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseContentStructure;
