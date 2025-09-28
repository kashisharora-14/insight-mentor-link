
import { supabase } from "@/integrations/supabase/client";
import type { CareerRoadmap, RoadmapItem, YearlyMilestone } from "@/types/roadmap";

export const saveRoadmapToDatabase = async (roadmap: CareerRoadmap, userId: string) => {
  try {
    // Save main roadmap
    const { data: roadmapData, error: roadmapError } = await supabase
      .from('career_roadmaps')
      .upsert({
        id: roadmap.id,
        student_id: userId,
        title: roadmap.careerGoal.title,
        description: roadmap.careerGoal.description,
        target_position: roadmap.careerGoal.targetPosition,
        target_company: roadmap.careerGoal.targetCompany,
        timeframe: roadmap.careerGoal.timeframe,
        current_skills: roadmap.currentSkills,
        interests: roadmap.interests,
        progress: roadmap.progress,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (roadmapError) throw roadmapError;

    // Delete existing items and milestones
    await supabase.from('roadmap_items').delete().eq('roadmap_id', roadmap.id);
    await supabase.from('yearly_milestones').delete().eq('roadmap_id', roadmap.id);

    // Save roadmap items
    const itemsToInsert = roadmap.roadmapItems.map(item => ({
      id: item.id,
      roadmap_id: roadmap.id,
      title: item.title,
      description: item.description,
      type: item.type,
      priority: item.priority,
      time_estimate: item.timeEstimate,
      year: item.year,
      quarter: item.quarter,
      status: item.status,
      prerequisites: item.prerequisites || [],
      skills: item.skills || [],
      resources: item.resources || [],
      alumni_mentors: item.alumniMentors || [],
      difficulty: item.difficulty
    }));

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase
        .from('roadmap_items')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
    }

    // Save yearly milestones
    const milestonesToInsert = roadmap.yearlyMilestones.map(milestone => ({
      roadmap_id: roadmap.id,
      year: milestone.year,
      title: milestone.title,
      description: milestone.description,
      key_skills: milestone.keySkills,
      major_projects: milestone.majorProjects,
      networking_goals: milestone.networkingGoals,
      target_achievements: milestone.targetAchievements
    }));

    if (milestonesToInsert.length > 0) {
      const { error: milestonesError } = await supabase
        .from('yearly_milestones')
        .insert(milestonesToInsert);
      
      if (milestonesError) throw milestonesError;
    }

    return roadmapData;
  } catch (error) {
    console.error('Error saving roadmap to database:', error);
    throw error;
  }
};

export const loadRoadmapFromDatabase = async (userId: string): Promise<CareerRoadmap | null> => {
  try {
    // Load main roadmap
    const { data: roadmapData, error: roadmapError } = await supabase
      .from('career_roadmaps')
      .select('*')
      .eq('student_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (roadmapError) {
      if (roadmapError.code === 'PGRST116') {
        // No roadmap found
        return null;
      }
      throw roadmapError;
    }

    // Load roadmap items
    const { data: itemsData, error: itemsError } = await supabase
      .from('roadmap_items')
      .select('*')
      .eq('roadmap_id', roadmapData.id)
      .order('year', { ascending: true })
      .order('quarter', { ascending: true });

    if (itemsError) throw itemsError;

    // Load yearly milestones
    const { data: milestonesData, error: milestonesError } = await supabase
      .from('yearly_milestones')
      .select('*')
      .eq('roadmap_id', roadmapData.id)
      .order('year', { ascending: true });

    if (milestonesError) throw milestonesError;

    // Transform database data back to CareerRoadmap format
    const roadmap: CareerRoadmap = {
      id: roadmapData.id,
      studentId: roadmapData.student_id,
      careerGoal: {
        id: `goal-${roadmapData.id}`,
        title: roadmapData.title,
        description: roadmapData.description || '',
        targetPosition: roadmapData.target_position,
        targetCompany: roadmapData.target_company,
        timeframe: roadmapData.timeframe,
        priority: 'high' as const
      },
      currentSkills: roadmapData.current_skills as any[] || [],
      interests: roadmapData.interests as any[] || [],
      roadmapItems: itemsData.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        type: item.type as any,
        priority: item.priority as any,
        timeEstimate: item.time_estimate || '',
        year: item.year,
        quarter: item.quarter,
        status: item.status as any,
        prerequisites: item.prerequisites as string[] || [],
        skills: item.skills as string[] || [],
        resources: item.resources as string[] || [],
        alumniMentors: item.alumni_mentors as string[] || [],
        difficulty: item.difficulty as any
      })),
      yearlyMilestones: milestonesData.map(milestone => ({
        year: milestone.year,
        title: milestone.title,
        description: milestone.description || '',
        keySkills: milestone.key_skills as string[] || [],
        majorProjects: milestone.major_projects as string[] || [],
        networkingGoals: milestone.networking_goals as string[] || [],
        targetAchievements: milestone.target_achievements as string[] || []
      })),
      createdAt: new Date(roadmapData.created_at),
      updatedAt: new Date(roadmapData.updated_at),
      progress: roadmapData.progress as any || {
        completedItems: 0,
        totalItems: itemsData.length,
        currentYear: 1,
        skillsAcquired: 0,
        projectsCompleted: 0
      }
    };

    return roadmap;
  } catch (error) {
    console.error('Error loading roadmap from database:', error);
    throw error;
  }
};

export const deleteRoadmapFromDatabase = async (roadmapId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('career_roadmaps')
      .delete()
      .eq('id', roadmapId)
      .eq('student_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting roadmap from database:', error);
    throw error;
  }
};
