# Course Management System (React + Vite)

A modern, client‑side Course Management System demonstrating scalable React architecture, Redux Toolkit, real‑time progress via Context, and localStorage persistence with HTML sanitization and data migration. Includes a dashboard with analytics and a polished UI.

- Project Overview: See PROJECT_OVERVIEW.md
- User Guide: See USER_GUIDE.md

## Quick Start

Prerequisites:
- Node.js 18+ and npm 9+

Install & run:
```bash
npm install --legacy-peer-deps
npm run dev
```
Vite will print a local URL (usually http://localhost:5173 or 5174). Open it in your browser.

## Features
- Course CRUD with a multi‑step, autosaving CourseForm (rich text via Quill)
- Courses list with search, filters, sort, pagination, grid/list toggle, bulk delete
- Detailed course and lesson views with sanitized HTML and progress controls
- Real‑time progress tracking, bookmarks, and learning streaks (Context + localStorage)
- Analytics dashboard powered by Recharts
- LocalStorage optimization: sanitization, migration, and backups

## Scripts
- npm run dev – Start dev server
- npm run build – Build for production
- npm run preview – Preview production build
- npm run lint – Lint codebase

## Tech Stack
- React 19, Vite, React Router
- Redux Toolkit for course catalog state
- React Context for real‑time learning progress
- Recharts for data visualization
- DOMPurify and custom sanitizers for safe HTML

## Directory Structure
```
src/
├─ components/
├─ contexts/
├─ features/
│  └─ courses/
├─ pages/
├─ redux/
├─ routes/
├─ utils/
└─ styles/
```

## Usage Examples
- Creating a course (CreateCourse page) wires to Redux via addCourse and sanitizes before localStorage save
- Toggling a lesson’s completion uses useProgress() from ProgressContext to update UI everywhere instantly
- Rendering lesson content uses DOMPurify.sanitize to prevent XSS

## Dependencies
See package.json for full list. Core runtime deps include:
- react, react-dom, react-router-dom
- @reduxjs/toolkit, react-redux
- recharts, dompurify, quill, react-quill-new, react-is

## Contributing
PRs and issues are welcome. Please:
- Follow the existing folder structure and patterns
- Run npm run lint before opening a PR
- Keep features small and focused

## License
MIT.

## Contact / Support
- Maintainer: Premanand <premanand484@gmail.com>
