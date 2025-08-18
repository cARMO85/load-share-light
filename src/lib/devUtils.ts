// Development utilities for testing and demo purposes

export const sampleInsights = [
  {
    id: 'insight-1',
    type: 'surprise' as const,
    taskId: 'task-1',
    taskName: 'Laundry Management',
    description: 'I realized I always think about when clothes need to be washed, but my partner just sees clean clothes appearing. The mental load of tracking what needs washing is invisible.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'insight-2', 
    type: 'disagreement' as const,
    taskId: 'task-5',
    taskName: 'Meal Planning',
    description: 'We have very different views on meal planning. I spend time researching recipes and checking what we have, while my partner thinks meal planning just means deciding what to eat that day.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'insight-3',
    type: 'breakthrough' as const,
    taskId: 'task-12',
    taskName: 'Social Calendar Management',
    description: 'Finally understood why I feel so overwhelmed by social planning - I\'m the one who remembers birthdays, plans gifts, coordinates with other families, and manages RSVPs. It\'s like being a social secretary for the whole family.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 'insight-4',
    type: 'surprise' as const,
    taskId: 'task-8',
    taskName: 'Financial Management',
    description: 'I didn\'t realize how much mental energy goes into tracking expenses, budgeting, and making sure bills are paid on time. My partner sees the results but not the constant background worry about money.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: 'insight-5',
    type: 'disagreement' as const,
    taskId: 'task-15',
    taskName: 'Child Care Coordination',
    description: 'We see \'helping with kids\' very differently. I track doctor appointments, school events, playdates, and developmental milestones. My partner thinks childcare is just the time spent directly with children.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: 'insight-6',
    type: 'breakthrough' as const,
    taskId: 'task-3',
    taskName: 'Kitchen Management',
    description: 'The kitchen doesn\'t just \'stay clean\' - someone has to notice when we\'re running low on things, plan what to cook, and coordinate the whole system. I\'ve been the invisible kitchen manager.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: 'insight-7',
    type: 'surprise' as const,
    taskId: 'task-20',
    taskName: 'Home Maintenance',
    description: 'I never thought about how someone has to remember when the furnace needs servicing, when to change air filters, or when to schedule repairs. These things don\'t just happen automatically.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    id: 'insight-8',
    type: 'disagreement' as const,
    taskId: 'task-7',
    taskName: 'Gift Giving & Special Occasions',
    description: 'We have totally different approaches to gifts and celebrations. I research, plan, and coordinate everything months in advance. My partner thinks you can just pick something up the day before.',
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