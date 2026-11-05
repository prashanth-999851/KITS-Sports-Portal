/**
 * Institutional Academic Rules — Departments & Sections Configuration
 * Strict business rules for KKR & KSR Institute of Technology and Sciences.
 */

// Public forms default academic years
export const PUBLIC_ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year'];

// Admin portal has full oversight including 4th years
export const ADMIN_ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const ACADEMIC_YEARS = PUBLIC_ACADEMIC_YEARS;

export const YEAR_REGISTRATION_KEYS = {
  '1st Year': 'registration_enabled_1st_year',
  '2nd Year': 'registration_enabled_2nd_year',
  '3rd Year': 'registration_enabled_3rd_year',
  '4th Year': 'registration_enabled_4th_year',
};

export const YEAR_METADATA = [
  { year: '1st Year', shortLabel: '1st Year', subtitle: 'Freshman Intake & Trials', badge: '1st Yr' },
  { year: '2nd Year', shortLabel: '2nd Year', subtitle: 'Sophomore Team Selection', badge: '2nd Yr' },
  { year: '3rd Year', shortLabel: '3rd Year', subtitle: 'Junior Varsity & Tournaments', badge: '3rd Yr' },
  { year: '4th Year', shortLabel: 'Final Year', subtitle: 'Senior Varsity & JNTUK Honors', badge: 'Final Yr' },
];

/**
 * Returns available academic years for public registration forms.
 * Supports granular statusMap { '1st Year': bool, ... } or legacy boolean allowFinalYear.
 */
export const getPublicAcademicYears = (allowFinalYearOrStatusMap = false) => {
  if (typeof allowFinalYearOrStatusMap === 'object' && allowFinalYearOrStatusMap !== null) {
    const list = ADMIN_ACADEMIC_YEARS.filter(y => allowFinalYearOrStatusMap[y] !== false);
    return list;
  }
  return allowFinalYearOrStatusMap ? ADMIN_ACADEMIC_YEARS : PUBLIC_ACADEMIC_YEARS;
};

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
