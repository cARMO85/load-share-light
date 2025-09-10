// Development utilities for testing and demo purposes
import { TaskResponse, LikertRating } from '@/types/assessment';
import { allTasks } from '@/data/allTasks';

export const sampleInsights = [
  {
    id: 'insight-1',
    type: 'surprise' as const,
    taskId: 'supply_monitoring',
    taskName: 'Noticing when household supplies are running low',
    description: "I realized I'm constantly scanning the house for what's running low - toilet paper, cleaning supplies, food staples. My partner just uses things until they're gone, but never notices we're running out.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'insight-2', 
    type: 'disagreement' as const,
    taskId: 'meal_planning',
    taskName: 'Planning weekly meals and creating shopping lists',
    description: "We have very different views on meal planning. I spend time thinking about nutritional balance, what we have at home, and everyone's preferences. My partner thinks meal planning just means deciding what to eat that day.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'insight-3',
    type: 'breakthrough' as const,
    taskId: 'social_relationship_maintenance',
    taskName: 'Maintaining relationships with extended family and friends',
    description: "Finally understood why I feel so overwhelmed by social obligations - I'm the one who remembers birthdays, coordinates with other families, manages RSVPs, and keeps track of everyone's important dates. It's like being a social secretary for the whole family.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 'insight-4',
    type: 'surprise' as const,
    taskId: 'budget_allocation',
    taskName: 'Making household budget and spending decisions',
    description: "I didn't realize how much mental energy goes into constantly weighing spending decisions - should we buy this, can we afford that, balancing competing financial demands. My partner sees the purchases but not the constant mental calculations.",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: 'insight-5',
    type: 'disagreement' as const,
    taskId: 'child_progress_monitoring',
    taskName: "Monitoring children's homework, school progress, and development",
    description: "We see 'helping with kids' very differently. I track homework completion, communicate with teachers, monitor behavioral changes, and watch for developmental milestones. My partner thinks childcare is just the time spent directly playing with children.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: 'insight-6',
    type: 'breakthrough' as const,
    taskId: 'cleanliness_standards',
    taskName: 'Noticing cleanliness levels and when spaces need attention',
    description: "The house doesn't just 'stay clean' - someone has to constantly notice mess, clutter, and dirt levels, then decide when cleaning is needed. I've been the invisible household manager, maintaining standards that others don't even see.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: 'insight-7',
    type: 'surprise' as const,
    taskId: 'maintenance_planning',
    taskName: 'Planning routine home and car maintenance',
    description: 'I never realized how much mental effort goes into scheduling HVAC servicing, car maintenance, and appliance care. Someone has to think ahead about these things before they become urgent problems.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    id: 'insight-8',
    type: 'disagreement' as const,
    taskId: 'gift_selection',
    taskName: 'Selecting gifts and managing social obligations',
    description: "We have totally different approaches to gifts and celebrations. I research options, consider the person's interests, and plan months in advance. My partner thinks you can just pick something up the day before and it'll be fine.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  }
];

// Auto-populate function for development/demo
export const createDemoResponses = (): { 
  myResponses: TaskResponse[], 
  partnerResponses: TaskResponse[], 
  insights: typeof sampleInsights 
} => {
  const myResponses: TaskResponse[] = [];
  const partnerResponses: TaskResponse[] = [];

  // Scenario: More balanced relationship with different strengths  
  allTasks.forEach((task, index) => {
    const taskId = task.id;
    
    // Create a more balanced scenario where partner handles some categories better
    const isPhysical = 'title' in task;
    const isEmotional = task.category === 'Emotional and Social Management';
    const isPlanning = task.category === 'Planning and Coordination';
    const isMaintenance = task.category === 'Maintenance and Management';
    
    if (isPhysical) {
      // Physical tasks - mostly shared, partner does a bit more
      const assignment = Math.random() > 0.7 ? 'partner' : 'shared';
      const userShare = assignment === 'shared' ? (Math.random() > 0.5 ? 40 : 45) : 30;
      
      myResponses.push({
        taskId,
        assignment,
        mySharePercentage: userShare,
        measurementType: 'likert',
        likertRating: {
          burden: Math.floor(Math.random() * 2) + 2, // 2-3 (moderate burden)
          fairness: Math.floor(Math.random() * 2) + 3, // 3-4 (fair acknowledgment)
        }
      });

      partnerResponses.push({
        taskId,
        assignment: assignment === 'partner' ? 'me' : 'shared',
        mySharePercentage: assignment === 'partner' ? 70 : (100 - userShare),
        measurementType: 'likert',
        likertRating: {
          burden: Math.floor(Math.random() * 2) + 3, // 3-4 (partner feels the burden)
          fairness: Math.floor(Math.random() * 2) + 3, // 3-4 (feels acknowledged)
        }
      });
      
    } else if (isEmotional) {
      // Emotional tasks - user still handles more but partner does some
      const assignment = Math.random() > 0.4 ? 'me' : 'shared';
      const userShare = assignment === 'me' ? (Math.random() > 0.5 ? 70 : 80) : 60;
      
      myResponses.push({
        taskId,
        assignment,
        mySharePercentage: userShare,
        measurementType: 'likert',
        likertRating: {
          burden: Math.floor(Math.random() * 2) + 3, // 3-4 (moderate to high burden)
          fairness: Math.floor(Math.random() * 2) + 3, // 3-4 (better acknowledgment)
        }
      });

      partnerResponses.push({
        taskId,
        assignment: assignment === 'me' ? 'partner' : 'shared',
        mySharePercentage: assignment === 'me' ? (100 - userShare) : (100 - userShare),
        measurementType: 'likert',
        likertRating: {
          burden: Math.floor(Math.random() * 2) + 2, // 2-3 (aware of some burden)
          fairness: Math.floor(Math.random() * 2) + 4, // 4-5 (feels it's acknowledged)
        }
      });
      
    } else if (isMaintenance) {
      // Maintenance - partner takes lead on some of these
      const assignment = Math.random() > 0.6 ? 'partner' : 'shared';
      const userShare = assignment === 'partner' ? 25 : 45;
      
      myResponses.push({
        taskId,
        assignment,
        mySharePercentage: userShare,
        measurementType: 'likert',
        likertRating: {
          burden: Math.floor(Math.random() * 2) + 2, // 2-3 (lower burden)
          fairness: Math.floor(Math.random() * 2) + 4, // 4-5 (good acknowledgment)
        }
      });

      partnerResponses.push({
        taskId,
        assignment: assignment === 'partner' ? 'me' : 'shared',
        mySharePercentage: assignment === 'partner' ? 75 : 55,
        measurementType: 'likert',
        likertRating: {
          burden: Math.floor(Math.random() * 2) + 3, // 3-4 (partner feels the work)
          fairness: Math.floor(Math.random() * 2) + 3, // 3-4 (feels fairly acknowledged)
        }
      });
      
    } else {
      // Planning tasks - mixed responsibility
      const assignment = Math.random() > 0.3 ? 'shared' : 'me';
      const userShare = assignment === 'shared' ? (Math.random() > 0.5 ? 60 : 55) : 75;
      
      myResponses.push({
        taskId,
        assignment,
        mySharePercentage: userShare,
        measurementType: 'likert',
        likertRating: {
          burden: Math.floor(Math.random() * 2) + 3, // 3-4 (moderate burden)
          fairness: Math.floor(Math.random() * 2) + 3, // 3-4 (decent acknowledgment)
        }
      });

      partnerResponses.push({
        taskId,
        assignment,
        mySharePercentage: 100 - userShare,
        measurementType: 'likert',
        likertRating: {
          burden: Math.floor(Math.random() * 2) + 2, // 2-3 (moderate burden)
          fairness: Math.floor(Math.random() * 2) + 4, // 4-5 (good acknowledgment)
        }
      });
    }
  });

  return { myResponses, partnerResponses, insights: sampleInsights };
};

export const addSampleInsights = (addInsight: (insight: any) => void) => {
  sampleInsights.forEach(insight => {
    addInsight({
      ...insight,
      id: `${insight.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate unique ID
    });
  });
};

// Check if we're in development mode
export const isDevelopment = import.meta.env.DEV;