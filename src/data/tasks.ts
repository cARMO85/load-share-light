// Cognitive/Emotional tasks measured with Likert scales
export interface CognitiveTask {
  id: string;
  task_name: string;
  category: string;
  default_frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  condition_trigger: string[];
  source: string;
  source_details: string;
  description?: string;
  measurementType: 'likert';
}

export const TASK_CATEGORIES = {
  ANTICIPATION: "Anticipation",
  IDENTIFICATION: "Identification", 
  DECISION_MAKING: "Decision-making",
  MONITORING: "Monitoring",
  EMOTIONAL_LABOUR: "Emotional Labour"
} as const;

export const cognitiveTasks: CognitiveTask[] = [
  // ANTICIPATION & PLANNING
  {
    id: "household_planning",
    task_name: "Planning meals, schedules, and household logistics",
    category: TASK_CATEGORIES.ANTICIPATION,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Mental Load Research",
    source_details: "Daminger (2019) - The Cognitive Dimension of Household Labor",
    description: "Planning weekly meals, coordinating family schedules, booking appointments, and thinking ahead about household needs.",
    measurementType: 'likert'
  },
  {
    id: "seasonal_planning",
    task_name: "Seasonal and special event planning",
    category: TASK_CATEGORIES.ANTICIPATION,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Household Management Studies",
    source_details: "Offer (2006) - The Challenge of Affluence",
    description: "Planning for seasonal changes, holidays, special events, and anticipating future household needs.",
    measurementType: 'likert'
  },

  // IDENTIFICATION & AWARENESS
  {
    id: "household_monitoring",
    task_name: "Noticing household needs and supply levels",
    category: TASK_CATEGORIES.IDENTIFICATION,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Mental Load Studies",
    source_details: "Ciciolla & Luthar (2019) - Invisible Household Labor",
    description: "Constantly scanning for what needs attention - supplies running low, cleanliness standards, repairs needed, and household tasks requiring action.",
    measurementType: 'likert'
  },
  {
    id: "family_awareness",
    task_name: "Monitoring family members' needs and changes",
    category: TASK_CATEGORIES.IDENTIFICATION,
    default_frequency: 'weekly',
    condition_trigger: ["has_children"],
    source: "Child Development Research",
    source_details: "Lareau (2011) - Unequal Childhoods",
    description: "Noticing changes in family members' needs, behavior, health, and development milestones.",
    measurementType: 'likert'
  },

  // DECISION-MAKING
  {
    id: "major_decisions",
    task_name: "Making major household and family decisions",
    category: TASK_CATEGORIES.DECISION_MAKING,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Consumer Decision Research",
    source_details: "Service Provider Selection Studies",
    description: "Making important decisions about childcare, service providers, budget allocation, and major household choices.",
    measurementType: 'likert'
  },
  {
    id: "daily_priorities",
    task_name: "Managing daily priorities and task coordination",
    category: TASK_CATEGORIES.DECISION_MAKING,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Time Management Research",
    source_details: "Household Task Prioritization Studies",
    description: "Deciding daily priorities, coordinating who does what, and adapting plans when situations change.",
    measurementType: 'likert'
  },

  // MONITORING & TRACKING
  {
    id: "administrative_management",
    task_name: "Managing appointments, deadlines, and administration",
    category: TASK_CATEGORIES.MONITORING,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Administrative Burden Research",
    source_details: "Heinrich (2018) - The Burden of Government",
    description: "Tracking appointments, deadlines, bills, subscriptions, and ensuring administrative tasks are completed on time.",
    measurementType: 'likert'
  },
  {
    id: "task_coordination",
    task_name: "Following up on delegated tasks and projects",
    category: TASK_CATEGORIES.MONITORING,
    default_frequency: 'weekly',
    condition_trigger: ["two_adults"],
    source: "Household Management Research",
    source_details: "Task Delegation and Monitoring Studies",
    description: "Following up on assigned tasks, monitoring progress on household projects, and ensuring things get done.",
    measurementType: 'likert'
  },

  // EMOTIONAL LABOUR
  {
    id: "emotional_support",
    task_name: "Providing emotional support to family members",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Family Psychology Research",
    source_details: "Erickson (2005) - Why Emotion Work Matters",
    description: "Supporting family members emotionally, managing conflicts, and maintaining relationship harmony.",
    measurementType: 'likert'
  },
  {
    id: "social_coordination",
    task_name: "Managing social relationships and celebrations",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Social Psychology Research",
    source_details: "Kin-keeping and Social Network Maintenance Studies",
    description: "Maintaining relationships with family and friends, organizing celebrations, and managing social obligations.",
    measurementType: 'likert'
  }
];

// For backward compatibility, export as mentalLoadTasks too
export const mentalLoadTasks = cognitiveTasks;