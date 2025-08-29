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
  // ANTICIPATION (Planning Ahead)
  {
    id: "meal_planning",
    task_name: "Planning weekly meals and creating shopping lists",
    category: TASK_CATEGORIES.ANTICIPATION,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Mental Load Research",
    source_details: "Daminger (2019) - The Cognitive Dimension of Household Labor",
    description: "Thinking ahead about what to eat for the week, considering nutritional needs, preferences, schedules, and creating shopping lists. Includes coordinating meals around activities and dietary restrictions.",
    measurementType: 'likert'
  },
  {
    id: "household_scheduling",
    task_name: "Coordinating family schedules and appointments",
    category: TASK_CATEGORIES.ANTICIPATION,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Gender Studies Research",
    source_details: "Hochschild & Machung (2012) - The Second Shift",
    description: "Planning and coordinating everyone's schedules, booking appointments, and ensuring family logistics run smoothly. Includes thinking ahead about conflicts and backup plans.",
    measurementType: 'likert'
  },
  {
    id: "seasonal_preparation",
    task_name: "Anticipating seasonal needs and purchases",
    category: TASK_CATEGORIES.ANTICIPATION,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Household Management Studies",
    source_details: "Offer (2006) - The Challenge of Affluence",
    description: "Thinking ahead about seasonal clothing, school supplies, holiday preparations, and household items needed for different times of year.",
    measurementType: 'likert'
  },
  {
    id: "maintenance_planning",
    task_name: "Planning routine home and car maintenance",
    category: TASK_CATEGORIES.ANTICIPATION,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Preventive Maintenance Research",
    source_details: "Home Maintenance Planning Studies",
    description: "Scheduling regular maintenance like HVAC servicing, car maintenance, appliance care, and home repairs before they become urgent problems.",
    measurementType: 'likert'
  },
  {
    id: "holiday_planning",
    task_name: "Planning holidays, trips, and family events",
    category: TASK_CATEGORIES.ANTICIPATION,
    default_frequency: 'yearly',
    condition_trigger: ["two_adults"],
    source: "Family Studies Research",
    source_details: "Tourism and Family Planning Research",
    description: "Planning vacations, family gatherings, and special events. Includes researching, booking, and coordinating all the details that make events successful.",
    measurementType: 'likert'
  },

  // IDENTIFICATION (Noticing Needs)
  {
    id: "supply_monitoring",
    task_name: "Noticing when household supplies are running low",
    category: TASK_CATEGORIES.IDENTIFICATION,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Mental Load Studies",
    source_details: "Ciciolla & Luthar (2019) - Invisible Household Labor",
    description: "Constantly scanning the house for items running low - toilet paper, cleaning supplies, food staples, personal care items. This mental scanning happens throughout daily life.",
    measurementType: 'likert'
  },
  {
    id: "cleanliness_standards",
    task_name: "Noticing cleanliness levels and when spaces need attention",
    category: TASK_CATEGORIES.IDENTIFICATION,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Domestic Labor Research",
    source_details: "Erickson (2005) - Why Emotion Work Matters",
    description: "Being aware of mess, dirt, clutter, and deciding when cleaning is needed. Includes maintaining household standards and noticing what others might miss.",
    measurementType: 'likert'
  },
  {
    id: "repair_identification",
    task_name: "Spotting household repairs and maintenance needs",
    category: TASK_CATEGORIES.IDENTIFICATION,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Home Maintenance Studies",
    source_details: "Household Repair Recognition Research",
    description: "Noticing things that are broken, wearing out, or need attention before they become bigger problems. Includes identifying safety issues and deteriorating conditions.",
    measurementType: 'likert'
  },
  {
    id: "administrative_tracking",
    task_name: "Identifying bills, deadlines, and administrative tasks",
    category: TASK_CATEGORIES.IDENTIFICATION,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Administrative Burden Research",
    source_details: "Heinrich (2018) - The Burden of Government",
    description: "Noticing when bills arrive, forms need completion, renewals are due, and bureaucratic tasks require attention. Includes staying aware of financial obligations.",
    measurementType: 'likert'
  },
  {
    id: "family_needs_awareness",
    task_name: "Recognizing changes in family members' needs",
    category: TASK_CATEGORIES.IDENTIFICATION,
    default_frequency: 'weekly',
    condition_trigger: ["has_children"],
    source: "Child Development Research",
    source_details: "Lareau (2011) - Unequal Childhoods",
    description: "Noticing when children's clothes no longer fit, behavior changes, academic struggles, or emotional needs. Includes recognizing developmental changes and social issues.",
    measurementType: 'likert'
  },

  // DECISION-MAKING
  {
    id: "childcare_decisions",
    task_name: "Choosing childcare, schools, and educational options",
    category: TASK_CATEGORIES.DECISION_MAKING,
    default_frequency: 'yearly',
    condition_trigger: ["has_children"],
    source: "Educational Choice Research",
    source_details: "Lareau (2011) - Unequal Childhoods",
    description: "Researching and selecting childcare providers, schools, tutors, and educational activities. Includes evaluating options and making complex decisions about children's development.",
    measurementType: 'likert'
  },
  {
    id: "service_provider_selection",
    task_name: "Selecting contractors, service providers, and professionals",
    category: TASK_CATEGORIES.DECISION_MAKING,
    default_frequency: 'yearly',
    condition_trigger: ["all"],
    source: "Consumer Decision Research",
    source_details: "Service Provider Selection Studies",
    description: "Choosing doctors, dentists, contractors, insurance providers, and other professionals. Includes researching options, reading reviews, and making informed decisions.",
    measurementType: 'likert'
  },
  {
    id: "budget_allocation",
    task_name: "Making household budget and spending decisions",
    category: TASK_CATEGORIES.DECISION_MAKING,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Financial Planning Research",
    source_details: "Household Financial Decision-Making Studies",
    description: "Deciding how to allocate money across household needs, determining priorities, and making spending decisions. Includes balancing competing financial demands.",
    measurementType: 'likert'
  },
  {
    id: "gift_selection",
    task_name: "Selecting gifts and managing social obligations",
    category: TASK_CATEGORIES.DECISION_MAKING,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Social Psychology Research",
    source_details: "Gift-Giving and Social Obligation Studies",
    description: "Choosing appropriate gifts for birthdays, holidays, and special occasions. Includes remembering important dates and managing social expectations.",
    measurementType: 'likert'
  },
  {
    id: "daily_priorities",
    task_name: "Determining daily household priorities and task order",
    category: TASK_CATEGORIES.DECISION_MAKING,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Time Management Research",
    source_details: "Household Task Prioritization Studies",
    description: "Deciding what needs to be done each day, in what order, and by whom. Includes adapting plans when unexpected situations arise.",
    measurementType: 'likert'
  },

  // MONITORING
  {
    id: "appointment_tracking",
    task_name: "Tracking appointments, deadlines, and important dates",
    category: TASK_CATEGORIES.MONITORING,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Time Management Research",
    source_details: "Calendar Management and Mental Load Studies",
    description: "Keeping track of upcoming appointments, deadlines, and important dates. Includes managing multiple calendars and ensuring nothing is forgotten.",
    measurementType: 'likert'
  },
  {
    id: "task_followup",
    task_name: "Following up on delegated tasks and ensuring completion",
    category: TASK_CATEGORIES.MONITORING,
    default_frequency: 'weekly',
    condition_trigger: ["two_adults"],
    source: "Household Management Research",
    source_details: "Task Delegation and Monitoring Studies",
    description: "Checking that assigned tasks are completed, following up on delegated responsibilities, and ensuring household functions continue smoothly.",
    measurementType: 'likert'
  },
  {
    id: "child_progress_monitoring",
    task_name: "Monitoring children's homework, school progress, and development",
    category: TASK_CATEGORIES.MONITORING,
    default_frequency: 'weekly',
    condition_trigger: ["has_children"],
    source: "Educational Research",
    source_details: "Parental Involvement in Education Studies",
    description: "Keeping track of homework completion, school performance, behavioral changes, and developmental milestones. Includes communication with teachers and other professionals.",
    measurementType: 'likert'
  },
  {
    id: "project_tracking",
    task_name: "Monitoring progress on home projects and improvements",
    category: TASK_CATEGORIES.MONITORING,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Project Management Research",
    source_details: "Home Improvement Project Studies",
    description: "Keeping track of ongoing home improvement projects, contractor progress, and ensuring projects stay on schedule and budget.",
    measurementType: 'likert'
  },
  {
    id: "subscription_management",
    task_name: "Tracking subscriptions, memberships, and recurring payments",
    category: TASK_CATEGORIES.MONITORING,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Financial Management Research",
    source_details: "Subscription Economy and Household Finance Studies",
    description: "Monitoring recurring payments, subscription services, and memberships. Includes evaluating whether services are still needed and managing renewals.",
    measurementType: 'likert'
  },
  {
    id: "health_tracking",
    task_name: "Monitoring family health, medications, and medical care",
    category: TASK_CATEGORIES.MONITORING,
    default_frequency: 'monthly',
    condition_trigger: ["has_children"],
    source: "Health Management Research",
    source_details: "Family Health Coordination Studies",
    description: "Tracking vaccination schedules, medication compliance, symptom monitoring, and ensuring family members receive appropriate medical care.",
    measurementType: 'likert'
  },

  // EMOTIONAL LABOUR
  {
    id: "family_conflict_management",
    task_name: "Managing conflicts and mediating family disputes",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    default_frequency: 'weekly',
    condition_trigger: ["has_children"],
    source: "Family Psychology Research",
    source_details: "Erickson (2005) - Why Emotion Work Matters",
    description: "Mediating disagreements between family members, teaching conflict resolution, and maintaining family harmony. Includes managing your own emotions while helping others.",
    measurementType: 'likert'
  },
  {
    id: "emotional_support_children",
    task_name: "Providing emotional support and guidance to children",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    default_frequency: 'weekly',
    condition_trigger: ["has_children"],
    source: "Child Development Research",
    source_details: "Emotional Support and Child Development Studies",
    description: "Being emotionally available for children, helping them process feelings, providing comfort during difficulties, and supporting their emotional development.",
    measurementType: 'likert'
  },
  {
    id: "partner_emotional_support",
    task_name: "Providing emotional support and maintaining relationship intimacy",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    default_frequency: 'weekly',
    condition_trigger: ["two_adults"],
    source: "Relationship Research",
    source_details: "Hochschild (1983) - The Managed Heart",
    description: "Supporting your partner emotionally, managing relationship conflicts, and maintaining emotional intimacy. Includes being attuned to their needs and feelings.",
    measurementType: 'likert'
  },
  {
    id: "social_relationship_maintenance",
    task_name: "Maintaining relationships with extended family and friends",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "Social Psychology Research",
    source_details: "Kin-keeping and Social Network Maintenance Studies",
    description: "Managing relationships with extended family, friends, and social networks. Includes remembering important events, maintaining contact, and organizing social activities.",
    measurementType: 'likert'
  },
  {
    id: "celebration_coordination",
    task_name: "Organizing celebrations, traditions, and special occasions",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    default_frequency: 'monthly',
    condition_trigger: ["all"],
    source: "Family Studies Research",
    source_details: "Family Ritual and Celebration Studies",
    description: "Planning and executing birthdays, holidays, and family traditions. Includes creating meaningful experiences and managing the emotional labor of celebration.",
    measurementType: 'likert'
  },
  {
    id: "work_life_emotional_management",
    task_name: "Managing work-family boundaries and stress",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    default_frequency: 'weekly',
    condition_trigger: ["is_employed"],
    source: "Work-Family Research",
    source_details: "Work-Life Balance and Emotional Labor Studies",
    description: "Managing the emotional toll of balancing work and family responsibilities, dealing with guilt and stress, and maintaining emotional well-being across life domains.",
    measurementType: 'likert'
  }
];

// For backward compatibility, export as mentalLoadTasks too
export const mentalLoadTasks = cognitiveTasks;