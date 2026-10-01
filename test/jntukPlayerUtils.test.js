import assert from 'node:assert';
import { 
  OFFICIAL_DEPARTMENTS, 
  normalizeDepartment, 
  normalizeAcademicYear, 
  getJntukAcademicYears 
} from '../src/utils/jntukPlayerUtils.js';

console.log('--- Running JNTUK Player Utils Tests ---');

// Test 1: Civil and Mechanical in OFFICIAL_DEPARTMENTS
console.log('Test 1: Checking Civil and Mechanical in OFFICIAL_DEPARTMENTS...');
assert.ok(OFFICIAL_DEPARTMENTS.includes('CIVIL'), 'OFFICIAL_DEPARTMENTS must include CIVIL');
assert.ok(OFFICIAL_DEPARTMENTS.includes('MECH'), 'OFFICIAL_DEPARTMENTS must include MECH');
assert.deepStrictEqual(
  OFFICIAL_DEPARTMENTS,
  ['CSE', 'IT', 'ECE', 'EEE', 'CIVIL', 'MECH', 'CAI', 'CSM', 'CSD']
);
console.log('✓ Civil and Mechanical present in OFFICIAL_DEPARTMENTS.');

// Test 2: Department Normalization
console.log('Test 2: Testing department normalization for Civil and Mechanical...');
assert.strictEqual(normalizeDepartment('civil'), 'CIVIL');
assert.strictEqual(normalizeDepartment('Civil'), 'CIVIL');
assert.strictEqual(normalizeDepartment('CIVIL ENGINEERING'), 'CIVIL');
assert.strictEqual(normalizeDepartment('ce'), 'CIVIL');

assert.strictEqual(normalizeDepartment('mech'), 'MECH');
assert.strictEqual(normalizeDepartment('Mechanical'), 'MECH');
assert.strictEqual(normalizeDepartment('MECHANICAL ENGINEERING'), 'MECH');
assert.strictEqual(normalizeDepartment('me'), 'MECH');

assert.strictEqual(normalizeDepartment('cse'), 'CSE');
assert.strictEqual(normalizeDepartment('ece'), 'ECE');
console.log('✓ Department normalizations passed.');

// Test 3: getJntukAcademicYears from 2008 to current year
console.log('Test 3: Testing dynamic academic years from 2008 to current year...');
const currentYear = new Date().getFullYear();
const years = getJntukAcademicYears(2008);

assert.ok(Array.isArray(years), 'Should return an array');
assert.strictEqual(years[0], `${currentYear}-${currentYear + 1}`, 'Top year must be current year');
assert.strictEqual(years[years.length - 1], '2008-2009', 'Oldest year must be 2008-2009');
assert.strictEqual(years.length, currentYear - 2008 + 1, 'Total years count should match range from 2008 to current year');
console.log(`✓ Generated ${years.length} academic years from 2008-2009 to ${years[0]}.`);

// Test 4: Academic Year Normalization
console.log('Test 4: Testing academic year normalization...');
assert.strictEqual(normalizeAcademicYear('2008'), '2008-2009');
assert.strictEqual(normalizeAcademicYear('2008-09'), '2008-2009');
assert.strictEqual(normalizeAcademicYear('2008-2009'), '2008-2009');
assert.strictEqual(normalizeAcademicYear('2024-25'), '2024-2025');
assert.strictEqual(normalizeAcademicYear(' 2025-2026 '), '2025-2026');
console.log('✓ Academic year normalizations passed.');

console.log('ALL JNTUK UTILS TESTS PASSED SUCCESSFULLY! (4/4)');
