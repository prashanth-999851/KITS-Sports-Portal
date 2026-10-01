import * as XLSX from 'xlsx';
import { 
  ADMIN_ACADEMIC_YEARS, 
  getAvailableDepartments, 
  getAvailableSections 
} from '../constants/academicRules.js';
import { 
  validateName, 
  validateEmail, 
  validatePhone, 
  validateRollNumber 
} from './sanitize.js';

export const AVAILABLE_SPORTS = [
  'Cricket', 
  'Volleyball', 
  'Basketball', 
  'Badminton', 
  'Kabaddi', 
  'Kho-Kho', 
  'Netball', 
  'Ball-Badminton', 
  'Athletics'
];

export const STATUSES = ['Pending', 'Approved', 'Rejected', 'Suspended'];
export const GENDERS = ['Male', 'Female'];

/**
 * Normalizes Roll Number (e.g., " 22jr1a0501 " -> "22JR1A0501")
 */
export function normalizeRollNumber(val) {
  if (!val) return '';
  return String(val).trim().toUpperCase();
}

/**
 * Normalizes Academic Year into canonical format:
 * "1st Year" | "2nd Year" | "3rd Year" | "4th Year"
 */
export function normalizeAcademicYear(val) {
  if (!val) return '';
  const clean = String(val).trim().toLowerCase();
  if (clean === '1' || clean === '1st' || clean === '1st year' || clean === 'first' || clean === 'first year') return '1st Year';
  if (clean === '2' || clean === '2nd' || clean === '2nd year' || clean === 'second' || clean === 'second year') return '2nd Year';
  if (clean === '3' || clean === '3rd' || clean === '3rd year' || clean === 'third' || clean === 'third year') return '3rd Year';
  if (clean === '4' || clean === '4th' || clean === '4th year' || clean === 'fourth' || clean === 'final' || clean === 'final year') return '4th Year';

  const match = ADMIN_ACADEMIC_YEARS.find(y => y.toLowerCase() === clean);
  return match || String(val).trim();
}

/**
 * Normalizes Department (e.g., "cse" -> "CSE", "csm" -> "CSM")
 */
export function normalizeDepartment(val) {
  if (!val) return '';
  return String(val).trim().toUpperCase();
}

/**
 * Normalizes Section (e.g., "1" or "Section 1" -> "Section 1")
 */
export function normalizeSection(val) {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim();
  const digitMatch = str.match(/\d+/);
  if (digitMatch) {
    return `Section ${digitMatch[0]}`;
  }
  return str.startsWith('Section') ? str : `Section ${str}`;
}

/**
 * Normalizes Gender (e.g., "M", "male" -> "Male", "f", "female" -> "Female")
 */
export function normalizeGender(val) {
  if (!val) return '';
  const clean = String(val).trim().toLowerCase();
  if (clean === 'f' || clean === 'female') return 'Female';
  if (clean === 'm' || clean === 'male') return 'Male';
  return String(val).trim();
}

/**
 * Normalizes Sport Discipline
 */
export function normalizeSport(val) {
  if (!val) return '';
  const clean = String(val).trim().toLowerCase().replace(/[\s\-_]+/g, ' ');

  if (clean === 'cricket') return 'Cricket';
  if (clean === 'volleyball' || clean === 'volley ball') return 'Volleyball';
  if (clean === 'basketball' || clean === 'basket ball') return 'Basketball';
  if (clean === 'ball badminton' || clean === 'ball-badminton' || clean === 'ballbadminton') return 'Ball-Badminton';
  if (clean === 'badminton') return 'Badminton';
  if (clean === 'kabaddi' || clean === 'kabbadi') return 'Kabaddi';
  if (clean === 'kho kho' || clean === 'kho-kho' || clean === 'khokho') return 'Kho-Kho';
  if (clean === 'netball' || clean === 'net ball') return 'Netball';
  if (clean === 'athletics' || clean === 'athletic') return 'Athletics';

  const match = AVAILABLE_SPORTS.find(s => s.toLowerCase() === clean);
  return match || String(val).trim();
}

/**
 * Normalizes Membership Status
 */
export function normalizeStatus(val, defaultStatus = 'Approved') {
  if (!val) return defaultStatus;
  const clean = String(val).trim().toLowerCase();
  if (clean === 'approved' || clean === 'active' || clean === 'admitted') return 'Approved';
  if (clean === 'pending' || clean === 'review' || clean === 'under review') return 'Pending';
  if (clean === 'rejected' || clean === 'declined') return 'Rejected';
  if (clean === 'suspended' || clean === 'inactive' || clean === 'hold') return 'Suspended';

  const match = STATUSES.find(s => s.toLowerCase() === clean);
  return match || String(val).trim();
}

/**
 * Validates a single membership row against institutional and academic constraints
 */
export function validateMembershipRow(
  row, 
  rowIndex, 
  existingRollSet = new Set(), 
  existingTrackingSet = new Set(), 
  pendingRollSet = new Set(), 
  pendingTrackingSet = new Set(),
  defaultStatus = 'Approved'
) {
  const errors = [];

  const rawName = row.name || row['Student Name'] || row['Student Full Name'] || row.studentName || row.FullName || '';
  const rawRoll = row.rollNumber || row['Roll Number'] || row.roll || row.Roll || row['Reg No'] || row.registrationNumber || '';
  const rawYear = row.year || row['Academic Year'] || row.Year || '';
  const rawDept = row.department || row.Department || row.dept || row.Dept || row.Branch || '';
  const rawSec = row.section || row.Section || row.sec || row.Sec || '';
  const rawGender = row.gender || row.Gender || row.Sex || '';
  const rawEmail = row.email || row['Email Address'] || row.Email || row['Email ID'] || '';
  const rawPhone = row.phone || row['Phone Number'] || row.Phone || row.Mobile || row['Contact Number'] || '';
  const rawSport = row.preferredSports || row.preferredSport || row['Preferred Sport'] || row['Preferred Sport Discipline'] || row.Sport || '';
  const rawStatus = row.status || row.Status || row['Initial Status'] || row['Review Status'] || '';
  const rawRemarks = row.remarks || row.Remarks || row['Directorate Remarks'] || row.Notes || '';
  const rawTracking = row.trackingId || row.tracking || row['Tracking ID'] || row.id || '';

  const name = String(rawName).trim();
  const rollNumber = normalizeRollNumber(rawRoll);
  const year = normalizeAcademicYear(rawYear);
  const department = normalizeDepartment(rawDept);
  const section = normalizeSection(rawSec);
  const gender = normalizeGender(rawGender);
  const email = String(rawEmail).trim().toLowerCase();
  const phone = String(rawPhone).trim();
  const preferredSports = normalizeSport(rawSport);
  const status = normalizeStatus(rawStatus, defaultStatus);
  const remarks = String(rawRemarks).trim();
  const trackingId = String(rawTracking).trim().toUpperCase();

  // 1. Student Name Validation
  if (!name) {
    errors.push('Student name is required.');
  } else if (!validateName(name)) {
    errors.push('Student name must be 2–60 characters (letters and spaces only).');
  }

  // 2. Roll Number Validation
  if (!rollNumber) {
    errors.push('Roll number is required.');
  } else if (!validateRollNumber(rollNumber)) {
    errors.push(`Invalid KITS roll number "${rollNumber}". Expected format: 22JR1A0501.`);
  }

  // 3. Academic Year Validation
  if (!ADMIN_ACADEMIC_YEARS.includes(year)) {
    errors.push(`Invalid academic year "${year}". Must be 1st Year, 2nd Year, 3rd Year, or 4th Year.`);
  }

  // 4. Department Validation (Cascading based on Academic Year)
  const allowedDepts = getAvailableDepartments(year);
  if (!department) {
    errors.push('Department is required.');
  } else if (!allowedDepts.includes(department)) {
    errors.push(`Department "${department}" is not valid for ${year}. Allowed: ${allowedDepts.join(', ')}.`);
  }

  // 5. Section Validation (Cascading based on Academic Year & Department)
  if (department && allowedDepts.includes(department)) {
    const allowedSecNums = getAvailableSections(year, department);
    const secNum = section.replace('Section ', '').trim();
    if (!allowedSecNums.includes(secNum)) {
      const allowedSecLabels = allowedSecNums.map(s => `Section ${s}`).join(', ');
      errors.push(`"${section}" is not valid for ${year} ${department}. Allowed: ${allowedSecLabels}.`);
    }
  }

  // 6. Gender Validation
  if (!GENDERS.includes(gender)) {
    errors.push(`Gender must be either "Male" or "Female".`);
  }

  // 7. Email Validation
  if (!email) {
    errors.push('Email address is required.');
  } else if (!validateEmail(email)) {
    errors.push(`Invalid email address format "${email}".`);
  }

  // 8. Phone Number Validation
  if (!phone) {
    errors.push('Phone number is required.');
  } else if (!validatePhone(phone)) {
    errors.push(`Invalid phone number "${phone}". Expected 10-digit Indian mobile number.`);
  }

  // 9. Preferred Sport Validation
  if (!AVAILABLE_SPORTS.includes(preferredSports)) {
    errors.push(`Sport "${preferredSports}" is not in available disciplines: ${AVAILABLE_SPORTS.join(', ')}.`);
  }

  // 10. Status Validation
  if (!STATUSES.includes(status)) {
    errors.push(`Status "${status}" is invalid. Allowed: ${STATUSES.join(', ')}.`);
  }

  // Duplicate / Match Checks
  let isDuplicate = false;
  let isExistingInDb = false;
  let duplicateReason = '';

  if (trackingId && existingTrackingSet.has(trackingId)) {
    isDuplicate = true;
    isExistingInDb = true;
    duplicateReason = `Tracking ID (${trackingId}) matches existing database member`;
  } else if (rollNumber && existingRollSet.has(rollNumber)) {
    isDuplicate = true;
    isExistingInDb = true;
    duplicateReason = `Roll Number (${rollNumber}) matches existing database member`;
  } else if (rollNumber && pendingRollSet.has(rollNumber)) {
    isDuplicate = true;
    duplicateReason = `Duplicate Roll Number (${rollNumber}) within this Excel file`;
  } else if (trackingId && pendingTrackingSet.has(trackingId)) {
    isDuplicate = true;
    duplicateReason = `Duplicate Tracking ID (${trackingId}) within this Excel file`;
  }

  const isValid = errors.length === 0;

  return {
    rowIndex,
    isValid,
    isDuplicate,
    isExistingInDb,
    duplicateReason,
    errors,
    normalized: {
      name,
      rollNumber,
      year,
      department,
      section,
      gender,
      email,
      phone,
      preferredSports: [preferredSports],
      status,
      remarks,
      trackingId: trackingId || undefined,
      playingExperience: 'No Previous Experience',
    },
    raw: row,
  };
}

/**
 * Generates and triggers download of a standardized clean Excel template
 * with column headers and institutional guidelines.
 */
export function downloadMembershipExcelTemplate() {
  const templateHeaders = [
    'Student Name',
    'Roll Number',
    'Academic Year',
    'Department',
    'Section',
    'Gender',
    'Email Address',
    'Phone Number',
    'Preferred Sport',
    'Status',
    'Directorate Remarks',
    'Tracking ID',
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders]);

  worksheet['!cols'] = [
    { wch: 24 }, // Student Name
    { wch: 16 }, // Roll Number
    { wch: 16 }, // Academic Year
    { wch: 14 }, // Department
    { wch: 14 }, // Section
    { wch: 12 }, // Gender
    { wch: 30 }, // Email Address
    { wch: 16 }, // Phone Number
    { wch: 20 }, // Preferred Sport
    { wch: 14 }, // Status
    { wch: 36 }, // Directorate Remarks
    { wch: 18 }, // Tracking ID
  ];

  const guidelinesData = [
    { 'Column': 'Student Name', 'Required': 'Yes', 'Allowed Values / Constraints': '2 to 60 characters, letters and spaces only.' },
    { 'Column': 'Roll Number', 'Required': 'Yes', 'Allowed Values / Constraints': 'Valid KITS roll format: 22JR1A0501. Serves as unique student identity.' },
    { 'Column': 'Academic Year', 'Required': 'Yes', 'Allowed Values / Constraints': '1st Year, 2nd Year, 3rd Year, 4th Year.' },
    { 'Column': 'Department', 'Required': 'Yes', 'Allowed Values / Constraints': 'CSE, IT, ECE, EEE, CSM, CSD (plus CAI in 4th Year).' },
    { 'Column': 'Section', 'Required': 'Yes', 'Allowed Values / Constraints': 'E.g., Section 1, Section 2 (numeric 1, 2 also auto-normalized).' },
    { 'Column': 'Gender', 'Required': 'Yes', 'Allowed Values / Constraints': 'Male or Female.' },
    { 'Column': 'Email Address', 'Required': 'Yes', 'Allowed Values / Constraints': 'Valid institutional or personal email address.' },
    { 'Column': 'Phone Number', 'Required': 'Yes', 'Allowed Values / Constraints': '10-digit Indian mobile number.' },
    { 'Column': 'Preferred Sport', 'Required': 'Yes', 'Allowed Values / Constraints': 'Cricket, Volleyball, Basketball, Badminton, Kabaddi, Kho-Kho, Netball, Ball-Badminton, Athletics.' },
    { 'Column': 'Status', 'Required': 'No (Defaults to Approved)', 'Allowed Values / Constraints': 'Approved, Pending, Suspended, Rejected.' },
    { 'Column': 'Directorate Remarks', 'Required': 'No', 'Allowed Values / Constraints': 'Optional administrative notes or trials observation.' },
    { 'Column': 'Tracking ID', 'Required': 'No', 'Allowed Values / Constraints': 'Leave blank for new memberships (system generates KKR-2026-XXXX). Provide existing ID if updating an existing record.' },
  ];

  const guideSheet = XLSX.utils.json_to_sheet(guidelinesData);
  guideSheet['!cols'] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 60 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Memberships');
  XLSX.utils.book_append_sheet(workbook, guideSheet, 'Allowed Values & Rules');

  const fileName = 'KITS_Sports_Membership_Template.xlsx';
  XLSX.writeFile(workbook, fileName);
}
