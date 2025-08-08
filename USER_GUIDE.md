# Course Management System – User Guide

This guide helps you install, run, and use the application. It also covers common issues and how to resolve them.

## 1) Quick Start
- Prerequisites:
  - Node.js 18+ and npm 9+
- Install dependencies:
  - npm install --legacy-peer-deps
- Start the dev server:
  - npm run dev
- Open the app:
  - http://localhost:5173 (or the port Vite prints, often 5174 if 5173 is taken)

Tip: If port 5173 is in use, Vite will pick the next available port. Check your terminal output.

## 2) Project Setup
- Commands
  - npm run dev – Start development server
  - npm run build – Production build
  - npm run preview – Preview the built app
  - npm run lint – Run ESLint

- Environment
  - No .env required for basic usage (client-only app). For exposing dev server on LAN, run: npm run dev -- --host

## 3) Navigating the UI
- Dashboard (/) – Overview of courses, progress analytics, quick actions
- Courses (/courses) – Search, filter, sort, paginate, select, and bulk delete courses
- Create Course (/create-course) – Multi-step form to add course details, sections, and lessons (autosaves drafts)
- Course Detail (/courses/:courseId) – Course overview, progress bar, bookmark toggle, expandable sections and lessons
- Lesson Detail (/courses/:courseId/sections/:sectionId/lessons/:lessonId) – Sanitized lesson content with Previous/Next navigation and completion toggle

Layout basics:
- Sidebar: global navigation
- Header: quick access, search or actions (where applicable)
- Main area: cards, tables, and detail views

## 4) Using Main Features

A) Create a Course
1. Go to Create Course
2. Step 1 – Basic Information
   - Title, Description (rich text), Category, Difficulty
   - Validation guides you on title length and description requirements
3. Step 2 – Course Content
   - Add Sections; inside each section add Lessons
   - Lessons support rich text via a Quill editor
4. Step 3 – Review & Publish
   - Review a summary and readiness checks
   - Click Publish Course

Autosave: Drafts auto-save to localStorage every ~30s and on blur. You can safely navigate away and return.

B) Manage Courses
- Courses list
  - Search: filters by title/description/instructor
  - Filters: category, difficulty, status (draft/published)
  - Sorting: newest/oldest/name/rating/popularity
  - Pagination: 10 items per page
  - View toggle: grid or list
  - Bulk actions: select and delete multiple courses with confirmation

C) Explore Course Details
- Progress bar: shows total/completed lessons and percentage
- Sections: expand/collapse; see per-section completion
- Bookmark: toggle bookmark state for quick reference
- Safe HTML: descriptions are sanitized at render time via DOMPurify

D) Learn a Lesson
- Open a lesson from Course Detail
- Read content (sanitized HTML)
- Mark complete: toggles completion with timestamp
- Navigate: Previous and Next buttons across lessons

E) Analytics Dashboard
- Visualizes distribution by category/difficulty
- Shows real-time progress stats (completion rate, in-progress/completed counts)
- Learning streak widget: days of continuous activity

## 5) Data and Persistence
- Courses (Redux + localStorage)
  - Loaded from localStorage on start, validated and sanitized before saving
  - HTML is stripped before storage to reduce size and risk
- Progress/Bookmarks/Streak (Context + localStorage)
  - Immediate UI updates via ProgressContext
  - Utilities in src/utils/progressTracking.js
- Data migration
  - On startup, runAutoMigration cleans historical HTML and optionally creates backups

## 6) Troubleshooting
- Dev server URL/port
  - Use npm run dev
  - If 5173 is busy, Vite prints a new port (e.g., 5174). Open that exact URL
- Missing dependency errors (e.g., react-is)
  - npm install --legacy-peer-deps
  - If a specific package is missing, npm install <name> --legacy-peer-deps
- Blank page or console errors
  - Check terminal output for Vite errors
  - Open browser devtools console for stack traces
  - Clear browser cache/hard refresh
- localStorage issues (quota or corrupted data)
  - Clear storage for this site from devtools Application tab
  - Or remove node_modules and package-lock.json then reinstall
- Progress not updating in real time
  - Ensure you’re interacting via Course Detail (uses ProgressContext)
  - If using Lesson Detail, it maintains its own local progress storage per course
- Styling looks off
  - Ensure styles in src/index.css and component classes are loaded (Vite HMR reload may help)

## 7) Keyboard/Usage Tips
- Use browser Back keys within multi-step forms (or provided Back button)
- Copy lesson links to deep-link into lessons
- Use search + filters together to narrow lists quickly

## 8) FAQ
- Q: Is there a backend?
  - A: No. Data is stored in localStorage for demo purposes. Replace with API calls or RTK Query for production
- Q: Can I import/export data?
  - A: ProgressContext exposes exportProgressData/importProgressData. Courses can be exported by reading localStorage
- Q: How do I run tests?
  - A: Testing setup is suggested in MISSING_FEATURES_IMPLEMENTATION_GUIDE.md (Vitest + @testing-library)

## 9) Support
- See README for contact info
- Open an issue in your repository if you fork this project

