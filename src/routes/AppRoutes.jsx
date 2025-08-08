import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Courses from '../pages/Courses';
import CreateCourse from '../pages/CreateCourse';
import EditCourse from '../pages/EditCourse';
import CourseDetail from '../pages/CourseDetail';
import LessonDetail from '../pages/LessonDetail';

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/courses/:courseId/edit" element={<EditCourse />} />
        <Route path="/courses/:courseId/sections/:sectionId/lessons/:lessonId" element={<LessonDetail />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
      </Routes>
    </Layout>
  );
}
