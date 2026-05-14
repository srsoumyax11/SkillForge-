# Security Specification - SkillForge AI Academy

## Data Invariants
1. A **User** document must have a `role` that is one of `['student', 'instructor', 'admin']`.
2. A **Course** must have an `instructorId` matching a valid user with the `instructor` or `admin` role.
3. A **Progress** document must map to a valid `userId` and `courseId`.
4. Users can only edit their own profile (except for their role, which is immutable by the user).
5. Only **Instructors** and **Admins** can create or modify courses.

## The "Dirty Dozen" Payloads (Deny List)
1. **Identity Spoofing**: Attempting to create a user profile with a UID different from the authenticated user.
2. **Privilege Escalation**: A student attempting to update their own `role` to `admin`.
3. **Orphaned Course**: Creating a course with a non-existent `instructorId`.
4. **Illegal Price**: Setting a course price as a negative number or a non-number.
5. **Unauthorized Course Edit**: A student trying to update a course's description.
6. **Progress Forgery**: A user trying to update progress for another user.
7. **Bypassing Verification**: Writing to a user profile without a verified email (if required).
8. **Shadow Field Injection**: Adding an `isVerifiedInstructor: true` field to a course document.
9. **Bulk Read**: Attempting to list all user emails.
10. **Terminal State Break**: Modifying a completed certificate (not yet implemented, but planned).
11. **ID Poisoning**: Injecting a 2MB string as a `courseId`.
12. **Relational Sync Break**: Creating a lesson for a non-existent module.

## Firestore Rules Test Plan
We will verify that:
- `users/{userId}`: `read`, `write` allowed only for `{userId} == request.auth.uid`.
- `courses/{courseId}`: `read` allowed for everyone; `write` only for instructors/admins.
- `progress/{progressId}`: `read`, `write` only for the owner.
