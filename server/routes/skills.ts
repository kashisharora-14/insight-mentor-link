
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

// Get user skills
router.get('/', authenticate, async (req, res) => {
  try {
    // Mock skills data
    res.json({
      data: [
        { id: 1, name: 'JavaScript', category: 'Programming', proficiency_level: 'Advanced', years_of_experience: 3 },
        { id: 2, name: 'Python', category: 'Programming', proficiency_level: 'Intermediate', years_of_experience: 2 },
        { id: 3, name: 'React', category: 'Framework', proficiency_level: 'Advanced', years_of_experience: 2 }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to get skills' } });
  }
});

// Add skill
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, category, proficiency_level, years_of_experience } = req.body;
    res.status(201).json({
      data: {
        message: 'Skill added successfully',
        skill: { id: Date.now(), name, category, proficiency_level, years_of_experience }
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to add skill' } });
  }
});

// Update skill
router.put('/:skill_id', authenticate, async (req, res) => {
  try {
    const { proficiency_level, years_of_experience } = req.body;
    res.json({
      data: {
        message: 'Skill updated successfully'
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update skill' } });
  }
});

// Delete skill
router.delete('/:skill_id', authenticate, async (req, res) => {
  try {
    res.json({
      data: {
        message: 'Skill removed successfully'
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete skill' } });
  }
});

export default router;
