import assert from 'node:assert';

console.log('--- Running Track Application Logic Tests ---');

// Mock data structures mirroring Convex registrations and students tables
const mockRegistrations = [
  {
    _id: 'reg_1',
    trackingId: 'KKR-2026-1042',
    studentName: 'Prasanth Chowdary',
    rollNumber: '23JR1A12C1',
    department: 'IT',
    year: '4th Year',
    section: 'Section 1',
    gender: 'Male',
    preferredSports: ['Basketball'],
    status: 'Approved',
    remarks: 'Selected for varsity trials'
  },
  {
    _id: 'reg_2',
    trackingId: 'KKR-2026-5590',
    studentName: 'Ananya Sharma',
    rollNumber: '24JR1A0502',
    department: 'CSE',
    year: '2nd Year',
    section: 'Section 2',
    gender: 'Female',
    preferredSports: ['Badminton', 'Volleyball'],
    status: 'Pending',
    remarks: ''
  }
];

const mockStudents = [
  {
    _id: 'stud_1',
    name: 'Ravi Teja',
    rollNumber: '21JR1A0410',
    department: 'ECE',
    year: '4th Year',
    sportId: 'Cricket',
    status: 'Active Member'
  }
];

// Resolving logic mirroring convex/registrations.ts getByTrackingId
function resolveTrackRecord(rawCode) {
  const raw = String(rawCode || '').trim();
  if (!raw || raw.length < 3) return null;
  const upper = raw.toUpperCase();

  // 1. Direct tracking ID match
  let reg = mockRegistrations.find(
    r => r.trackingId === raw || r.trackingId.toUpperCase() === upper
  );

  // 2. Roll number match in registrations
  if (!reg) {
    reg = mockRegistrations.find(
      r => r.rollNumber.trim().toUpperCase() === upper
    );
  }

  if (reg) {
    return {
      id: reg.trackingId,
      trackingId: reg.trackingId,
      name: reg.studentName,
      rollNumber: reg.rollNumber,
      department: reg.department,
      year: reg.year,
      preferredSports: reg.preferredSports,
      status: reg.status,
      remarks: reg.remarks
    };
  }

  // 3. Roll number match in master students roster
  const student = mockStudents.find(
    s => s.rollNumber.trim().toUpperCase() === upper
  );

  if (student) {
    return {
      id: student.rollNumber,
      trackingId: student.rollNumber,
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year,
      preferredSports: [student.sportId],
      status: student.status,
      remarks: 'Official Registered Sports Directorate Member'
    };
  }

  return null;
}

// Test 1: Match by exact uppercase tracking ID
console.log('Test 1: Tracking with exact uppercase tracking ID...');
const res1 = resolveTrackRecord('KKR-2026-1042');
assert.notStrictEqual(res1, null);
assert.strictEqual(res1.name, 'Prasanth Chowdary');
assert.strictEqual(res1.status, 'Approved');
console.log('✓ Exact tracking ID test passed.');

// Test 2: Match by lowercase tracking ID
console.log('Test 2: Tracking with lowercase tracking ID...');
const res2 = resolveTrackRecord('kkr-2026-1042');
assert.notStrictEqual(res2, null);
assert.strictEqual(res2.id, 'KKR-2026-1042');
assert.strictEqual(res2.rollNumber, '23JR1A12C1');
console.log('✓ Lowercase tracking ID test passed.');

// Test 3: Match by roll number from registrations
console.log('Test 3: Tracking with Roll Number...');
const res3 = resolveTrackRecord('24jr1a0502');
assert.notStrictEqual(res3, null);
assert.strictEqual(res3.name, 'Ananya Sharma');
assert.strictEqual(res3.status, 'Pending');
console.log('✓ Roll number test passed.');

// Test 4: Match by roll number from master students roster
console.log('Test 4: Tracking varsity player from master roster...');
const res4 = resolveTrackRecord('21JR1A0410');
assert.notStrictEqual(res4, null);
assert.strictEqual(res4.name, 'Ravi Teja');
assert.strictEqual(res4.status, 'Active Member');
console.log('✓ Master roster player test passed.');

// Test 5: Invalid or non-existent code
console.log('Test 5: Non-existent or invalid codes...');
assert.strictEqual(resolveTrackRecord('INVALID_CODE_123'), null);
assert.strictEqual(resolveTrackRecord(''), null);
assert.strictEqual(resolveTrackRecord('12'), null); // Less than 3 chars
console.log('✓ Invalid code handling passed.');

console.log('ALL TRACK APPLICATION TESTS PASSED SUCCESSFULLY!');

