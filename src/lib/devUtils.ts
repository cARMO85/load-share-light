// Development utilities for testing and demo purposes

export const sampleInsights = [
  {
    id: 'insight-1',
    type: 'surprise' as const,
    taskId: 'supply_monitoring',
    taskName: 'Noticing when household supplies are running low',
    description: 'I realized I\'m constantly scanning the house for what\'s running low - toilet paper, cleaning supplies, food staples. My partner just uses things until they\'re gone, but never notices we\'re running out.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'insight-2', 
    type: 'disagreement' as const,
    taskId: 'meal_planning',
    taskName: 'Planning weekly meals and creating shopping lists',
    description: 'We have very different views on meal planning. I spend time thinking about nutritional balance, what we have at home, and everyone\'s preferences. My partner thinks meal planning just means deciding what to eat that day.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'insight-3',
    type: 'breakthrough' as const,
    taskId: 'social_relationship_maintenance',
    taskName: 'Maintaining relationships with extended family and friends',
    description: 'Finally understood why I feel so overwhelmed by social obligations - I\'m the one who remembers birthdays, coordinates with other families, manages RSVPs, and keeps track of everyone\'s important dates. It\'s like being a social secretary for the whole family.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 'insight-4',
    type: 'surprise' as const,
    taskId: 'budget_allocation',
    taskName: 'Making household budget and spending decisions',
    description: 'I didn\'t realize how much mental energy goes into constantly weighing spending decisions - should we buy this, can we afford that, balancing competing financial demands. My partner sees the purchases but not the constant mental calculations.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: 'insight-5',
    type: 'disagreement' as const,
    taskId: 'child_progress_monitoring',
    taskName: 'Monitoring children\'s homework, school progress, and development',
    description: 'We see \'helping with kids\' very differently. I track homework completion, communicate with teachers, monitor behavioral changes, and watch for developmental milestones. My partner thinks childcare is just the time spent directly playing with children.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: 'insight-6',
    type: 'breakthrough' as const,
    taskId: 'cleanliness_standards',
    taskName: 'Noticing cleanliness levels and when spaces need attention',
    description: 'The house doesn\'t just \'stay clean\' - someone has to constantly notice mess, clutter, and dirt levels, then decide when cleaning is needed. I\'ve been the invisible household manager, maintaining standards that others don\'t even see.',
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
    description: 'We have totally different approaches to gifts and celebrations. I research options, consider the person\'s interests, and plan months in advance. My partner thinks you can just pick something up the day before and it\'ll be fine.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  }
];

export const addSampleInsights = (addInsight: (insight: any) => void) => {
  sampleInsights.forEach(insight => {
    addInsight(insight);
  });
};

// Check if we're in development mode
export const isDevelopment = import.meta.env.DEV;