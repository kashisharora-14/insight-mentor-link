
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticate = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

// Get student profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    // Mock student profile data
    res.json({
      data: {
        personal_info: {
          roll_number: 'CS2021001',
          current_semester: 6,
          date_of_birth: '2003-05-15',
          gender: 'Male',
          blood_group: 'O+',
          category: 'General',
          phone_number: '9876543210',
          alternate_email: 'student@example.com',
          address: '123 College Street'
        },
        academic_info: {
          enrollment_date: '2021-08-01',
          admission_type: 'Merit',
          academic_status: 'Active',
          current_backlog: 0,
          scholarship_status: 'Active',
          hostel_resident: true,
          library_card_number: 'LIB2021001'
        },
        current_semester: {
          semester_number: 6,
          sgpa: 8.5,
          cgpa: 8.3,
          attendance: 85,
          status: 'Active'
        },
        overall_attendance: 85,
        parent_info: {
          father_name: 'John Doe',
          father_occupation: 'Engineer',
          father_phone: '9876543211',
          mother_name: 'Jane Doe',
          mother_occupation: 'Teacher',
          mother_phone: '9876543212'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to get profile' } });
  }
});

// Update student profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const data = req.body;
    // In production, save to database
    res.json({
      data: {
        message: 'Profile updated successfully'
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update profile' } });
  }
});

// Update contact info
router.put('/profile/update/contact', authenticate, async (req, res) => {
  try {
    const data = req.body;
    res.json({
      data: {
        message: 'Contact information updated successfully',
        phone_number: data.phone_number,
        alternate_email: data.alternate_email
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update contact info' } });
  }
});

export default router;
