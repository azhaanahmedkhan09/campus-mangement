# Campus Orbit — Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every unlisted path in `/databases/{database}/documents/{document=**}` is strictly denied (`allow read, write: if false;`).
2. **Verified Identity**: Standard writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Self-Role Escalation Prevention**: Users creating `/users/{userId}` can only self-register as `'student'`, `'faculty'`, or `'parent'` with `status == 'active'` and `uid == request.auth.uid`; only an existing administrator (`isAdmin()`) can assign `'college_admin'` or `'super_admin'`, or modify `role` and `status`.
4. **Strict Keys & Anti-Update-Gap**: Every `create` and `update` invokes `isValid[Entity](incoming())`, enforcing `hasAll`, `hasOnly`, string `.size()` limits, ID regex guards (`^[a-zA-Z0-9_\-]+$`), and server timestamp integrity (`request.time`).
5. **No Blanket List Delegation**: Every `allow list` rule enforces ownership or explicit field constraints (`resource.data.ownerId == request.auth.uid` or `resource.data.audience in [...]` or `isAdmin()`), never relying on client-side filtering alone.
6. **Terminal State Locking**: Once a `grievance` reaches `'Resolved'` or `'Rejected'`, or an `attendanceSession` reaches `'closed'`, non-admin updates are locked.

## 2. The "Dirty Dozen" Payloads (Rejected with PERMISSION_DENIED)

1. **Privilege Escalation**: Creating `/users/user_1` with `{ role: "super_admin" }` by a non-admin user.
2. **Shadow Field Injection**: Updating `/students/stu_1` with an undeclared field `{ isVerifiedAdmin: true }`.
3. **Unverified Email Spoofing**: Writing with `request.auth.token.email_verified == false`.
4. **ID Poisoning**: Creating a document with a 500-character ID or special characters (`stu/../admin`).
5. **Identity Spoofing**: Creating `/grievances/grv_1` where `ownerId != request.auth.uid`.
6. **Timestamp Forgery**: Creating any entity where `createdAt != request.time` or updating where `updatedAt != request.time`.
7. **Immutable Field Mutation**: Updating `createdAt` or `ownerId` on `/collaborationProjects/{projectId}`.
8. **Terminal State Re-opening**: Non-admin attempting to update `/grievances/{grievanceId}` after `existing().status == 'Resolved'`.
9. **Value Poisoning**: Passing a 10,000-character string into `title` (max 140 chars) during an allowed status update.
10. **PII / Private Grievance Leak**: User A attempting `get` or `list` on User B's `/grievances/{grievanceId}`.
11. **Unbounded Array / Type Mismatch**: Passing a boolean or list into `semester` or negative values into `attendancePct`.
12. **Unauthorized Notice Publication**: Student user attempting to create a document in `/notices/{noticeId}` with forged `authorId`.
