import assert from 'node:assert';
import { normalizeGender } from '../src/utils/membershipExcelUtils.js';

console.log('--- Running Sports Members Gender Separation Tests ---');

// Test 1: Gender normalization
console.log('Test 1: Testing normalizeGender...');
assert.strictEqual(normalizeGender('male'), 'Male');
assert.strictEqual(normalizeGender('m'), 'Male');
assert.strictEqual(normalizeGender('Men'), 'Male');
assert.strictEqual(normalizeGender('boys'), 'Male');
assert.strictEqual(normalizeGender('female'), 'Female');
assert.strictEqual(normalizeGender('f'), 'Female');
assert.strictEqual(normalizeGender('Women'), 'Female');
assert.strictEqual(normalizeGender('girls'), 'Female');
assert.strictEqual(normalizeGender(''), '');
assert.strictEqual(normalizeGender(null), '');
console.log('✓ Gender normalization passed.');

// Test 2: Dual gender detection vs Single gender detection
console.log('Test 2: Testing dual gender detection...');

function splitMembersByGender(members) {
  const male = members.filter(m => normalizeGender(m.gender) === 'Male');
  const female = members.filter(m => normalizeGender(m.gender) === 'Female');
  const other = members.filter(m => {
    const g = normalizeGender(m.gender);
    return g !== 'Male' && g !== 'Female';
  });
  const hasBothGenders = male.length > 0 && female.length > 0;
  return { male, female, other, hasBothGenders };
}

// Case A: Sport with both Male and Female
const bothGendersRoster = [
  { id: '1', studentName: 'John Doe', rollNumber: '22JR1A0501', gender: 'Male' },
  { id: '2', studentName: 'Jane Smith', rollNumber: '22JR1A0502', gender: 'Female' },
  { id: '3', studentName: 'Bob Vance', rollNumber: '22JR1A0503', gender: 'Male' },
];
const resultA = splitMembersByGender(bothGendersRoster);
assert.strictEqual(resultA.hasBothGenders, true);
assert.strictEqual(resultA.male.length, 2);
assert.strictEqual(resultA.female.length, 1);

// Case B: Sport with only Male
const maleOnlyRoster = [
  { id: '1', studentName: 'John Doe', rollNumber: '22JR1A0501', gender: 'Male' },
  { id: '2', studentName: 'Bob Vance', rollNumber: '22JR1A0503', gender: 'Male' },
];
const resultB = splitMembersByGender(maleOnlyRoster);
assert.strictEqual(resultB.hasBothGenders, false);
assert.strictEqual(resultB.male.length, 2);
assert.strictEqual(resultB.female.length, 0);

// Case C: Sport with only Female
const femaleOnlyRoster = [
  { id: '1', studentName: 'Jane Smith', rollNumber: '22JR1A0502', gender: 'Female' },
  { id: '2', studentName: 'Alice Brown', rollNumber: '22JR1A0504', gender: 'Female' },
];
const resultC = splitMembersByGender(femaleOnlyRoster);
assert.strictEqual(resultC.hasBothGenders, false);
assert.strictEqual(resultC.male.length, 0);
assert.strictEqual(resultC.female.length, 2);

// Case D: Sport with unspecified gender
const unspecifiedRoster = [
  { id: '1', studentName: 'Unknown Player', rollNumber: '22JR1A0599', gender: '' },
];
const resultD = splitMembersByGender(unspecifiedRoster);
assert.strictEqual(resultD.hasBothGenders, false);

console.log('✓ Dual gender and single gender detection passed.');

// Test 3: Search filtering
console.log('Test 3: Testing search filtering in dual gender mode...');
function filterBySearch(list, query) {
  const q = query.toLowerCase().trim();
  if (!q) return list;
  return list.filter(m =>
    m.studentName?.toLowerCase().includes(q) ||
    m.rollNumber?.toLowerCase().includes(q)
  );
}

const searchJane = filterBySearch(resultA.female, 'Jane');
assert.strictEqual(searchJane.length, 1);
assert.strictEqual(searchJane[0].studentName, 'Jane Smith');

const searchJaneInMale = filterBySearch(resultA.male, 'Jane');
assert.strictEqual(searchJaneInMale.length, 0);

console.log('✓ Search filtering passed.');
console.log('ALL SPORTS MEMBERS GENDER TESTS PASSED SUCCESSFULLY!');

