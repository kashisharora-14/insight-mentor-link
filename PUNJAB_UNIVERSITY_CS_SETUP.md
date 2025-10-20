# Punjab University Computer Science Department - Student Database Setup

## Overview
This system is specifically configured for the **Computer Science Department at Punjab University** with the following academic programs.

---

## Available Programs

### 1. MCA (Master of Computer Applications)
- **Morning Batch**
  - Year 1 (Semesters 1-2)
  - Year 2 (Semesters 3-4)
- **Evening Batch**
  - Year 1 (Semesters 1-2)
  - Year 2 (Semesters 3-4)

### 2. MSCIT (Master of Science in Information Technology)
- **Morning Batch**
  - Year 1 (Semesters 1-2)
  - Year 2 (Semesters 3-4)
- **Evening Batch**
  - Year 1 (Semesters 1-2)
  - Year 2 (Semesters 3-4)

---

## Student Profile Fields

### Academic Information (Required Fields)
| Field | Type | Allowed Values | Description |
|-------|------|----------------|-------------|
| `program` | Enum | `MCA` or `MSCIT` | The student's enrolled program |
| `batchType` | Enum | `Morning` or `Evening` | The batch timing |
| `currentYear` | Integer | `1` or `2` | Current year in the program |
| `currentSemester` | Integer | `1` to `4` | Current semester (1-2 for Year 1, 3-4 for Year 2) |
| `department` | Text | `Computer Science` | Auto-set, always "Computer Science" |
| `batchYear` | Integer | e.g., `2024` | Expected graduation year |

### Personal Information
- **Name** - Only letters, no numbers (validated)
- **Roll Number** - Alphanumeric with hyphens/slashes
- **CGPA** - Decimal between 0.00 and 10.00
- **Email** - Valid email format
- **Phone Number**
- **Date of Birth**
- **Gender**
- **Blood Group**
- **Address** (Permanent & Current)

### Skills & Interests
- **Technical Skills** - Array of skills (e.g., ["Python", "Java", "React"])
- **Soft Skills** - Array of skills (e.g., ["Communication", "Leadership"])
- **Career Goals** - Text description

### Social Links (Optional)
- **LinkedIn URL** - Must be valid LinkedIn profile
- **GitHub URL** - Must be valid GitHub profile
- **Portfolio URL** - Any valid website URL

### Parent/Guardian Information
- Father's Name (validated - only letters)
- Mother's Name (validated - only letters)
- Guardian Name (validated - only letters)
- Contact numbers and occupations

---

## Validation Rules

### Name Validation
✅ **Allowed**: Letters, spaces, hyphens, apostrophes
❌ **NOT Allowed**: Numbers, special characters

Examples:
- ✅ "Rajesh Kumar"
- ✅ "Mary O'Brien"
- ✅ "Jean-Paul"
- ❌ "John123"
- ❌ "User@456"

### Program Constraints
- Only **MCA** and **MSCIT** are allowed
- Only **Morning** and **Evening** batches
- Only **Year 1** or **Year 2**
- Department is **always** "Computer Science"

### Academic Constraints
- CGPA: 0.00 to 10.00
- Current Semester: 1 to 4 (for 2-year programs)
- Current Year: 1 or 2

---

## Database Structure

### Tables
1. **users** - Authentication and basic user info
2. **student_profiles** - Detailed student academic and personal information
3. **verification_codes** - Email verification codes
4. **verification_requests** - Pending user verifications

### Enums
```sql
-- Available programs
CREATE TYPE program AS ENUM ('MCA', 'MSCIT');

-- Available batch types
CREATE TYPE batch_type AS ENUM ('Morning', 'Evening');
```

---

## Example Student Profile

```json
{
  "program": "MCA",
  "batchType": "Morning",
  "currentYear": 1,
  "currentSemester": 2,
  "department": "Computer Science",
  "batchYear": 2026,
  "rollNumber": "MCA/M/2024/001",
  "cgpa": 8.75,
  "technicalSkills": ["Python", "Java", "Machine Learning"],
  "softSkills": ["Communication", "Team Leadership"],
  "linkedinUrl": "https://www.linkedin.com/in/student-name",
  "githubUrl": "https://github.com/studentname",
  "careerGoals": "Become a Data Scientist in AI/ML domain"
}
```

---

## API Endpoints

### Create/Update Student Profile
**POST** `/api/student-profile/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "program": "MCA",
  "batchType": "Morning",
  "currentYear": 1,
  "currentSemester": 2,
  "batchYear": 2026,
  "rollNumber": "MCA/M/2024/001",
  "cgpa": 8.5,
  "technicalSkills": ["Python", "Java"],
  "linkedinUrl": "https://www.linkedin.com/in/example",
  "githubUrl": "https://github.com/example"
}
```

**Response (Success):**
```json
{
  "message": "Profile created successfully",
  "profile": { ... }
}
```

**Response (Validation Error):**
```json
{
  "error": "Validation failed",
  "details": [
    "Program must be either MCA or MSCIT",
    "Current year must be either 1 or 2"
  ]
}
```

---

## Summary

✅ **Department**: Always "Computer Science" (auto-set)
✅ **Programs**: MCA or MSCIT only
✅ **Batches**: Morning or Evening only
✅ **Years**: 1 or 2 only
✅ **Semesters**: 1-4 only
✅ **Names**: Only letters, no numbers
✅ **Database**: Fully configured and validated
✅ **No Dummy Data**: Database is clean and ready for real student information

The system is now ready to store real student data for Punjab University's Computer Science Department! 🎓
