# 🏗️ Technical Architecture & Logic Documentation

This document provides a deep dive into the code logic, data structures, and architectural patterns used in the SkillForge AI Academy.

## 1. System Architecture

The application follows a **Full-Stack SPA (Single Page Application)** architecture:
- **Frontend**: React 19 + Vite for a high-performance interactive UI.
- **Backend**: Express.js serves as a thin proxy and Vite middleware host, enabling server-side Gemini API calls.
- **Persistence**: Firebase Firestore (NoSQL) for real-time document storage.
- **Security**: Attribute-Based Access Control (ABAC) enforced via server-side Firestore Rules.

## 2. Core Logic Patterns

### 🔄 Real-Time Synchronization
Instead of traditional REST polling, the app utilizes Firestore's `onSnapshot` listeners.
- **Implementation**: Used in `Courses.tsx`, `Dashboard.tsx`, and `InstructorDashboard.tsx`.
- **Benefit**: When an instructor adds a course, it appears on the marketplace instantly without a page refresh.
- **Cleanup**: Every listener is wrapped in a `useEffect` return cleanup function to prevent memory leaks.

### 🔐 Authentication Flow
1. **Trigger**: User signs in via `Login.tsx` (Google or Email).
2. **Persistence**: `onAuthStateChanged` in `App.tsx` listens for the Firebase Auth token.
3. **Hydration**: On a valid login, the app fetches the user's role and metadata from the `/users/{uid}` collection.
4. **State Management**: Zustand (`useAuthStore`) holds the global `user` and `profile` objects, providing reactive access to user data across the UI.

## 3. Data Schema (Firestore)

### `users` collection
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Document ID (from Firebase Auth) |
| `email` | string | User's primary email |
| `displayName` | string | Full name |
| `role` | string | `student`, `instructor`, or `admin` |
| `createdAt` | timestamp | Server timestamp of registration |

### `courses` collection
| Field | Type | Description |
|-------|------|-------------|
| `instructorId` | string | Links to the user document |
| `title` | string | Course name |
| `price` | number | Cost in USD |
| `students` | number | Total enrollment count |
| `rating` | number | Average star rating (1-5) |
| `status` | string | `Published` or `Draft` |

### `progress` collection
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Reference to the student |
| `courseId` | string | Reference to the course |
| `completedLessons` | array | List of lesson IDs finished |
| `updatedAt` | timestamp | Last activity tracker |

## 4. Security Philosophy

### The "Master Gate" Pattern
Security is enforced at the database level using `firestore.rules`.
- **Relational Integrity**: To read a `progress` document, the rule verifies `request.auth.uid == resource.data.userId`.
- **Immutable Roles**: A student cannot update their own `role` field. The `allow update` block uses `affectedKeys().hasOnly(['displayName', ...])` to prevent privilege escalation.
- **Validation Primitives**: Every write operation is wrapped in a `isValid[Entity]()` helper that checks types, sizes, and regex patterns for IDs.

## 5. API Design

### Internal Firebase "API"
The app uses a decentralized Firebase SDK approach:
- **`handleFirestoreError`**: A unified error utility in `src/lib/firebase.ts` that stringifies permissions errors for the Gemini diagnostic engine.
- **Relational Queries**: Queries use `where("instructorId", "==", user.uid)` to ensure the Firebase backend filters data before it even reaches the client.

### AI Integration
- **Service**: Gemini 1.5/2.0 API.
- **Endpoint**: Proxied through `/api/chat` (planned) or handled via server-side function calling to keep API keys hidden from the browser.

## 6. UI/UX Principles
- **Motion**: `framer-motion` is used for staggered entrance animations in the course grid.
- **Theming**: Tailwind 4.0 CSS variables provide a "Modern Technical" look with subtle blurs and high-contrast typography.
- **Feedback**: `sonner` is used for toast notifications on all database operations (Create, Login, Update).
