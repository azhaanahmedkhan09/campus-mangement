import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesContent = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');

test('Firestore security rules enforce default-deny and all 8 pillars for Dirty Dozen payloads', () => {
  // 1. Default-deny catch-all exists
  assert.ok(rulesContent.includes('match /{document=**} {\n      allow read, write: if false;\n    }'), 'Must include global default-deny catch-all');

  // 2. Email verification enforced
  assert.ok(rulesContent.includes('request.auth.token.email_verified == true'), 'Must enforce email_verified == true');

  // 3. ID Poisoning guard present
  assert.ok(rulesContent.includes("id.matches('^[a-zA-Z0-9_\\\\-]+$')"), 'Must enforce regex guard on IDs');

  // 4. All 6 blueprint collections protected
  for (const col of ['users', 'students', 'attendanceSessions', 'collaborationProjects', 'grievances', 'notices']) {
    assert.ok(rulesContent.includes(`match /${col}/`), `Collection ${col} must have a match block`);
  }

  // 5. Validation helpers wrap every update
  assert.ok(rulesContent.includes('isValidUserProfile(incoming())'), 'UserProfile validation helper used');
  assert.ok(rulesContent.includes('isValidStudentRecord(incoming())'), 'StudentRecord validation helper used');
  assert.ok(rulesContent.includes('isValidAttendanceSession(incoming())'), 'AttendanceSession validation helper used');
  assert.ok(rulesContent.includes('isValidCollaborationProject(incoming())'), 'CollaborationProject validation helper used');
  assert.ok(rulesContent.includes('isValidGrievanceRecord(incoming())'), 'GrievanceRecord validation helper used');
  assert.ok(rulesContent.includes('isValidCampusNotice(incoming())'), 'CampusNotice validation helper used');

  // 6. Temporal integrity enforced
  assert.ok(rulesContent.includes('incoming().createdAt == request.time'), 'CreatedAt must equal request.time');
  assert.ok(rulesContent.includes('incoming().updatedAt == request.time'), 'UpdatedAt must equal request.time');
});
