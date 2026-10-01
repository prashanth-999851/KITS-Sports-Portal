import assert from 'node:assert';
import { 
  normalizeRollNumber, 
  normalizeAcademicYear, 
  normalizeDepartment, 
  normalizeSection, 
  normalizeGender, 
  normalizeSport, 
  normalizeStatus,
  validateMembershipRow
} from '../src/utils/membershipExcelUtils.js';

console.log('--- Running Membership Excel Utils Tests ---');

// Test 1: Normalization Helpers
console.log('Test 1: Testing normalization functions...');
assert.strictEqual(normalizeRollNumber(' 22jr1a0501 '), '22JR1A0501');
assert.strictEqual(normalizeRollNumber('23JR1a1205'), '23JR1A1205');

assert.strictEqual(normalizeAcademicYear('1st'), '1st Year');
assert.strictEqual(normalizeAcademicYear('2nd Year'), '2nd Year');
assert.strictEqual(normalizeAcademicYear('third'), '3rd Year');
assert.strictEqual(normalizeAcademicYear('4'), '4th Year');

assert.strictEqual(normalizeDepartment('cse'), 'CSE');
assert.strictEqual(normalizeDepartment('  csm  '), 'CSM');

assert.strictEqual(normalizeSection('1'), 'Section 1');
assert.strictEqual(normalizeSection('Section 2'), 'Section 2');
assert.strictEqual(normalizeSection(3), 'Section 3');

assert.strictEqual(normalizeGender('male'), 'Male');
assert.strictEqual(normalizeGender('M'), 'Male');
assert.strictEqual(normalizeGender('female'), 'Female');
assert.strictEqual(normalizeGender('F'), 'Female');

assert.strictEqual(normalizeSport('cricket'), 'Cricket');
assert.strictEqual(normalizeSport('volley ball'), 'Volleyball');
assert.strictEqual(normalizeSport('ball badminton'), 'Ball-Badminton');

assert.strictEqual(normalizeStatus('approved'), 'Approved');
assert.strictEqual(normalizeStatus('pending'), 'Pending');
assert.strictEqual(normalizeStatus('rejected'), 'Rejected');
assert.strictEqual(normalizeStatus('suspended'), 'Suspended');
assert.strictEqual(normalizeStatus('', 'Approved'), 'Approved');
console.log('✓ Normalization functions passed.');

// Test 2: Valid Membership Row Validation
console.log('Test 2: Testing valid row validation...');
const validRow = {
  name: 'K. Rajesh Kumar',
  rollNumber: '22JR1A0501',
  year: '2nd Year',
  department: 'CSE',
  section: 'Section 1',
  gender: 'Male',
  email: 'rajesh.22jr@kitsguntur.ac.in',
  phone: '9876543210',
  preferredSports: 'Cricket',
  status: 'Approved',
  remarks: 'Direct trials induction',
};

const validResult = validateMembershipRow(validRow, 1);
assert.strictEqual(validResult.isValid, true, 'Valid row should pass validation');
assert.strictEqual(validResult.errors.length, 0);
assert.strictEqual(validResult.normalized.name, 'K. Rajesh Kumar');
assert.strictEqual(validResult.normalized.rollNumber, '22JR1A0501');
assert.strictEqual(validResult.normalized.year, '2nd Year');
assert.strictEqual(validResult.normalized.department, 'CSE');
assert.strictEqual(validResult.normalized.section, 'Section 1');
assert.strictEqual(validResult.normalized.gender, 'Male');
assert.strictEqual(validResult.normalized.preferredSports[0], 'Cricket');
console.log('✓ Valid row passed.');

// Test 3: Invalid Rows (Missing / Malformed Fields)
console.log('Test 3: Testing invalid row validations...');
const invalidRow = {
  name: 'A', // too short
  rollNumber: 'INVALID_ROLL',
  year: '5th Year', // invalid year
  department: 'CIVIL', // not supported
  section: 'Section 99', // out of bounds
  gender: 'Unknown',
  email: 'bad-email',
  phone: '123',
  preferredSports: 'Rugby', // not in AVAILABLE_SPORTS
  status: 'UnknownStatus',
};

const invalidResult = validateMembershipRow(invalidRow, 2);
assert.strictEqual(invalidResult.isValid, false, 'Invalid row should fail validation');
assert.ok(invalidResult.errors.some(e => e.includes('Student name')), 'Should flag invalid name');
assert.ok(invalidResult.errors.some(e => e.includes('Invalid KITS roll number')), 'Should flag invalid roll');
assert.ok(invalidResult.errors.some(e => e.includes('Invalid academic year')), 'Should flag invalid year');
assert.ok(invalidResult.errors.some(e => e.includes('Department')), 'Should flag invalid department');
assert.ok(invalidResult.errors.some(e => e.includes('Gender')), 'Should flag invalid gender');
assert.ok(invalidResult.errors.some(e => e.includes('Invalid email')), 'Should flag invalid email');
assert.ok(invalidResult.errors.some(e => e.includes('Invalid phone')), 'Should flag invalid phone');
console.log('✓ Invalid row error checks passed.');

// Test 4: Cascading Department and Section Rules
console.log('Test 4: Testing cascading academic rules...');
// CAI is valid for 4th Year, but invalid for 2nd Year
const cai2ndYear = {
  ...validRow,
  year: '2nd Year',
  department: 'CAI',
};
const caiResult = validateMembershipRow(cai2ndYear, 3);
assert.strictEqual(caiResult.isValid, false, 'CAI should be invalid for 2nd Year');
assert.ok(caiResult.errors.some(e => e.includes('Department "CAI" is not valid for 2nd Year')));

const cai4thYear = {
  ...validRow,
  year: '4th Year',
  department: 'CAI',
  section: 'Section 1',
};
const cai4thResult = validateMembershipRow(cai4thYear, 4);
assert.strictEqual(cai4thResult.isValid, true, 'CAI should be valid for 4th Year');

// Section out of range for IT (IT 2nd Year has sections 1, 2)
const itInvalidSec = {
  ...validRow,
  year: '2nd Year',
  department: 'IT',
  section: 'Section 4',
};
const itSecResult = validateMembershipRow(itInvalidSec, 5);
assert.strictEqual(itSecResult.isValid, false, 'Section 4 should be invalid for IT 2nd Year');
assert.ok(itSecResult.errors.some(e => e.includes('"Section 4" is not valid for 2nd Year IT')));
console.log('✓ Cascading academic rules passed.');

// Test 5: Duplicate Detection (DB Match and File Duplicates)
console.log('Test 5: Testing duplicate detection...');
const existingRolls = new Set(['22JR1A0501']);
const existingTrackings = new Set(['KKR-2026-1234']);
const pendingRolls = new Set();
const pendingTrackings = new Set();

const dupResult = validateMembershipRow(
  validRow, 
  6, 
  existingRolls, 
  existingTrackings, 
  pendingRolls, 
  pendingTrackings
);
assert.strictEqual(dupResult.isDuplicate, true, 'Should detect existing DB roll');
assert.strictEqual(dupResult.isExistingInDb, true);
assert.ok(dupResult.duplicateReason.includes('Roll Number'));

const trackingDupRow = {
  ...validRow,
  rollNumber: '22JR1A0599',
  trackingId: 'KKR-2026-1234',
};
const trackDupResult = validateMembershipRow(
  trackingDupRow, 
  7, 
  existingRolls, 
  existingTrackings, 
  pendingRolls, 
  pendingTrackings
);
assert.strictEqual(trackDupResult.isDuplicate, true, 'Should detect existing DB tracking ID');
assert.strictEqual(trackDupResult.isExistingInDb, true);
assert.ok(trackDupResult.duplicateReason.includes('Tracking ID'));

// In-file duplicate
pendingRolls.add('22JR1A0588');
const fileDupRow = {
  ...validRow,
  rollNumber: '22JR1A0588',
};
const fileDupResult = validateMembershipRow(
  fileDupRow, 
  8, 
  existingRolls, 
  existingTrackings, 
  pendingRolls, 
  pendingTrackings
);
assert.strictEqual(fileDupResult.isDuplicate, true, 'Should detect in-file duplicate');
assert.strictEqual(fileDupResult.isExistingInDb, false);
assert.ok(fileDupResult.duplicateReason.includes('Duplicate Roll Number'));
console.log('✓ Duplicate detection tests passed.');

console.log('ALL TESTS PASSED SUCCESSFULLY! (5/5 suites)');
