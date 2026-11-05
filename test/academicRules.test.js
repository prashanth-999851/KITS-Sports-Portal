import assert from 'node:assert';
import { 
  getPublicAcademicYears, 
  getAvailableDepartments, 
  getAvailableSections 
} from '../src/constants/academicRules.js';

console.log('--- Running Academic Rules Tests ---');

// Test 1: getPublicAcademicYears when disabled
assert.deepStrictEqual(
  getPublicAcademicYears(false),
  ['1st Year', '2nd Year', '3rd Year'],
  'Disabled final year should only return 1st, 2nd, and 3rd years'
);
console.log('✓ Public academic years when disabled passed.');

// Test 2: getPublicAcademicYears when enabled
assert.deepStrictEqual(
  getPublicAcademicYears(true),
  ['1st Year', '2nd Year', '3rd Year', '4th Year'],
  'Enabled final year should include 4th Year'
);
console.log('✓ Public academic years when enabled passed.');

// Test 2b: Granular per-year statusMap
assert.deepStrictEqual(
  getPublicAcademicYears({ '1st Year': false, '2nd Year': false, '3rd Year': false, '4th Year': true }),
  ['4th Year'],
  'Only 4th Year enabled'
);
assert.deepStrictEqual(
  getPublicAcademicYears({ '1st Year': true, '2nd Year': false, '3rd Year': true, '4th Year': false }),
  ['1st Year', '3rd Year'],
  'Only 1st and 3rd Years enabled'
);
assert.deepStrictEqual(
  getPublicAcademicYears({ '1st Year': false, '2nd Year': false, '3rd Year': false, '4th Year': false }),
  [],
  'All years disabled'
);
assert.deepStrictEqual(
  getPublicAcademicYears({ '1st Year': true, '2nd Year': true, '3rd Year': true, '4th Year': true }),
  ['1st Year', '2nd Year', '3rd Year', '4th Year'],
  'All years enabled'
);
console.log('✓ Granular per-year statusMap tests passed.');

// Test 3: Departments for 4th Year
const fourthYearDepts = getAvailableDepartments('4th Year');
assert(fourthYearDepts.includes('CAI'), '4th Year should include CAI department');
assert(fourthYearDepts.includes('CSE'), '4th Year should include CSE department');
assert(fourthYearDepts.includes('IT'), '4th Year should include IT department');
console.log('✓ 4th Year departments passed.');

// Test 4: Sections for 4th Year
assert.deepStrictEqual(getAvailableSections('4th Year', 'CSM'), ['1']);
assert.deepStrictEqual(getAvailableSections('4th Year', 'CSE'), ['1', '2', '3']);
console.log('✓ 4th Year sections passed.');

console.log('ALL ACADEMIC RULES TESTS PASSED SUCCESSFULLY!');
