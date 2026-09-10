/**
 * Institutional Academic Rules — Departments & Sections Configuration
 * Strict business rules for KKR & KSR Institute of Technology and Sciences.
 */

// Public forms allow 1st, 2nd, and 3rd years for active sports enrollment
export const PUBLIC_ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year'];

// Admin portal has full oversight including 4th years
export const ADMIN_ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const ACADEMIC_YEARS = PUBLIC_ACADEMIC_YEARS;

export const getAvailableDepartments = (year) => {
  return year === '4th Year'
    ? ['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD']
    : ['CSE', 'IT', 'ECE', 'EEE', 'CSM', 'CSD'];
};

export const getAvailableSections = (year, department) => {
  if (year === '4th Year') {
    return department === 'CSM' ? ['1'] : ['1', '2', '3'];
  }
  if (department === 'CSE') {
    return ['1', '2', '3', '4', '5', '6', '7', '8'];
  }
  if (department === 'IT') {
    // 1st Year has only 1 section for IT, 2nd & 3rd years have 2 sections
    if (year === '1st Year') {
      return ['1'];
    }
    return ['1', '2'];
  }
  if (department === 'CSM') {
    if (year === '1st Year') {
      return ['1', '2', '3', '4', '5', '6', '7', '8'];
    }
    return year === '2nd Year' ? ['1', '2', '3', '4', '5', '6'] : ['1', '2', '3'];
  }
  if (department === 'EEE') {
    return ['1'];
  }
  return ['1', '2', '3'];
};
