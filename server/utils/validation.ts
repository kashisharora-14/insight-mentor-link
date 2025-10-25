export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }

  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes (no numbers or special characters)' };
  }

  return { valid: true };
}

export function validateStudentProfile(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.rollNumber) {
    errors.push('Roll number is required');
  }

  // Program validation (MCA or MSCIT only)
  if (data.program && !['MCA', 'MSCIT'].includes(data.program)) {
    errors.push('Program must be either MCA or MSCIT');
  }

  // Batch type validation (Morning or Evening only)
  if (data.batchType && !['Morning', 'Evening'].includes(data.batchType)) {
    errors.push('Batch type must be either Morning or Evening');
  }

  // Current year validation (1 or 2 for 2-year programs)
  if (data.currentYear && ![1, 2].includes(data.currentYear)) {
    errors.push('Current year must be either 1 or 2');
  }

  // Current semester validation (1-4 for 2-year programs)
  if (data.currentSemester && ![1, 2, 3, 4].includes(data.currentSemester)) {
    errors.push('Current semester must be between 1 and 4');
  }

  if (!data.batchYear) {
    errors.push('Batch year is required');
  }

  // Panjab University CS Department specific validations
  const validPrograms = ['MCA', 'MSCIT'];
  const validBatchTypes = ['Morning', 'Evening'];

  if (data.program && !validPrograms.includes(data.program)) {
    errors.push('Program must be either MCA or MSCIT');
  }

  if (data.batchType && !validBatchTypes.includes(data.batchType)) {
    errors.push('Batch type must be either Morning or Evening');
  }

  if (data.currentYear) {
    const year = parseInt(data.currentYear);
    if (isNaN(year) || year < 1 || year > 2) {
      errors.push('Current year must be either 1 or 2');
    }
  }

  if (data.rollNumber && !/^[A-Z0-9\-\/]+$/i.test(data.rollNumber)) {
    errors.push('Roll number can only contain letters, numbers, hyphens, and forward slashes');
  }

  // Department is auto-set to "Computer Science" for Panjab University
  if (data.department && data.department !== 'Computer Science') {
    errors.push('Department must be Computer Science for Panjab University');
  }

  if (data.cgpa) {
    const cgpaNum = parseFloat(data.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      errors.push('CGPA must be a number between 0 and 10');
    }
  }

  if (data.currentSemester) {
    const sem = parseInt(data.currentSemester);
    if (isNaN(sem) || sem < 1 || sem > 4) {
      errors.push('Current semester must be between 1 and 4 for 2-year programs');
    }
  }

  // Validate URLs if provided (allow flexible URL formats)
  if (data.linkedinUrl && data.linkedinUrl.trim() !== '') {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com/;
    if (!linkedinRegex.test(data.linkedinUrl)) {
      errors.push('Invalid LinkedIn URL format');
    }
  }

  if (data.githubUrl && data.githubUrl.trim() !== '') {
    const githubRegex = /^https?:\/\/(www\.)?github\.com/;
    if (!githubRegex.test(data.githubUrl)) {
      errors.push('Invalid GitHub URL format');
    }
  }

  if (data.portfolioUrl && data.portfolioUrl.trim() !== '') {
    const urlPattern = /^https?:\/\/.+\..+$/;
    if (!urlPattern.test(data.portfolioUrl)) {
      errors.push('Invalid portfolio URL format');
    }
  }

  const nameFields = [
    { field: 'fatherName', label: 'Father name' },
    { field: 'motherName', label: 'Mother name' },
    { field: 'guardianName', label: 'Guardian name' }
  ];

  for (const { field, label } of nameFields) {
    if (data[field]) {
      const validation = validateName(data[field]);
      if (!validation.valid) {
        errors.push(`${label}: ${validation.error}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}