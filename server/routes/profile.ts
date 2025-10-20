
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Get current user profile
router.get('/', authenticate, async (req, res) => {
  try {
    const user: any = req.user;
    res.json({
      data: {
        id: user.userId,
        email: user.email,
        full_name: 'Demo User',
        role: user.role || 'student',
        headline: 'Computer Science Student',
        bio: 'Passionate about web development',
        location: 'Chandigarh, India',
        graduation_year: 2024,
        profile_visibility: 'public',
        email_visibility: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to get profile' } });
  }
});

// Update profile
router.put('/', authenticate, async (req, res) => {
  try {
    const data = req.body;
    res.json({
      data: {
        message: 'Profile updated successfully',
        profile: data
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update profile' } });
  }
});

// Search profiles
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, page = 1, per_page = 10 } = req.query;
    // Mock search results
    res.json({
      data: {
        profiles: [],
        total: 0,
        pages: 0,
        current_page: parseInt(page as string),
        per_page: parseInt(per_page as string)
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to search profiles' } });
  }
});

export default router;
