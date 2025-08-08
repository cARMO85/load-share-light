// Mental load tasks dataset with conditions and mental load weights
export interface Task {
  id: string;
  task_name: string;
  category: string;
  baseline_minutes_week: number;
  mental_load_weight: number;
  condition_trigger: string[];
  source: string;
  source_details: string;
  time_range: string;
  description?: string;
}

export const TASK_CATEGORIES = {
  ANTICIPATION: "Anticipation",
  IDENTIFICATION: "Identification", 
  DECISION_MAKING: "Decision-making",
  MONITORING: "Monitoring",
  EMOTIONAL_LABOUR: "Emotional Labour"
} as const;

export const mentalLoadTasks: Task[] = [
  // ANTICIPATION (Planning Ahead)
  {
    id: "meal_planning",
    task_name: "Planning weekly meals and creating shopping lists",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 90,
    mental_load_weight: 1.2,
    condition_trigger: ["all"],
    source: "Mental Load Research",
    source_details: "Daminger (2019) - The Cognitive Dimension of Household Labor",
    time_range: "60-120 minutes",
    description: "Thinking ahead about what to eat for the week, considering nutritional needs, preferences, schedules, and creating shopping lists. Includes coordinating meals around activities and dietary restrictions."
  },
  {
    id: "household_scheduling",
    task_name: "Coordinating family schedules and appointments",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 75,
    mental_load_weight: 1.3,
    condition_trigger: ["all"],
    source: "Gender Studies Research",
    source_details: "Hochschild & Machung (2012) - The Second Shift",
    time_range: "45-120 minutes",
    description: "Planning and coordinating everyone's schedules, booking appointments, and ensuring family logistics run smoothly. Includes thinking ahead about conflicts and backup plans."
  },
  {
    id: "seasonal_preparation",
    task_name: "Anticipating seasonal needs and purchases",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 45,
    mental_load_weight: 1.0,
    condition_trigger: ["all"],
    source: "Household Management Studies",
    source_details: "Offer (2006) - The Challenge of Affluence",
    time_range: "30-90 minutes",
    description: "Thinking ahead about seasonal clothing, school supplies, holiday preparations, and household items needed for different times of year."
  },
  {
    id: "maintenance_planning",
    task_name: "Planning routine home and car maintenance",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 60,
    mental_load_weight: 1.1,
    condition_trigger: ["all"],
    source: "Preventive Maintenance Research",
    source_details: "Home Maintenance Planning Studies",
    time_range: "30-120 minutes",
    description: "Scheduling regular maintenance like HVAC servicing, car maintenance, appliance care, and home repairs before they become urgent problems."
  },
  {
    id: "holiday_planning",
    task_name: "Planning holidays, trips, and family events",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 30,
    mental_load_weight: 1.2,
    condition_trigger: ["two_adults"],
    source: "Family Studies Research",
    source_details: "Tourism and Family Planning Research",
    time_range: "15-90 minutes",
    description: "Planning vacations, family gatherings, and special events. Includes researching, booking, and coordinating all the details that make events successful."
  },

  // IDENTIFICATION (Noticing Needs)
  {
    id: "supply_monitoring",
    task_name: "Noticing when household supplies are running low",
    category: TASK_CATEGORIES.IDENTIFICATION,
    baseline_minutes_week: 30,
    mental_load_weight: 0.9,
    condition_trigger: ["all"],
    source: "Mental Load Studies",
    source_details: "Ciciolla & Luthar (2019) - Invisible Household Labor",
    time_range: "20-45 minutes",
    description: "Constantly scanning the house for items running low - toilet paper, cleaning supplies, food staples, personal care items. This mental scanning happens throughout daily life."
  },
  {
    id: "cleanliness_standards",
    task_name: "Noticing cleanliness levels and when spaces need attention",
    category: TASK_CATEGORIES.IDENTIFICATION,
    baseline_minutes_week: 60,
    mental_load_weight: 1.0,
    condition_trigger: ["all"],
    source: "Domestic Labor Research",
    source_details: "Erickson (2005) - Why Emotion Work Matters",
    time_range: "40-90 minutes",
    description: "Being aware of mess, dirt, clutter, and deciding when cleaning is needed. Includes maintaining household standards and noticing what others might miss."
  },
  {
    id: "repair_identification",
    task_name: "Spotting household repairs and maintenance needs",
    category: TASK_CATEGORIES.IDENTIFICATION,
    baseline_minutes_week: 45,
    mental_load_weight: 0.8,
    condition_trigger: ["all"],
    source: "Home Maintenance Studies",
    source_details: "Household Repair Recognition Research",
    time_range: "30-75 minutes",
    description: "Noticing things that are broken, wearing out, or need attention before they become bigger problems. Includes identifying safety issues and deteriorating conditions."
  },
  {
    id: "administrative_tracking",
    task_name: "Identifying bills, deadlines, and administrative tasks",
    category: TASK_CATEGORIES.IDENTIFICATION,
    baseline_minutes_week: 45,
    mental_load_weight: 1.1,
    condition_trigger: ["all"],
    source: "Administrative Burden Research",
    source_details: "Heinrich (2018) - The Burden of Government",
    time_range: "30-90 minutes",
    description: "Noticing when bills arrive, forms need completion, renewals are due, and bureaucratic tasks require attention. Includes staying aware of financial obligations."
  },
  {
    id: "family_needs_awareness",
    task_name: "Recognizing changes in family members' needs",
    category: TASK_CATEGORIES.IDENTIFICATION,
    baseline_minutes_week: 90,
    mental_load_weight: 1.4,
    condition_trigger: ["has_children"],
    source: "Child Development Research",
    source_details: "Lareau (2011) - Unequal Childhoods",
    time_range: "60-150 minutes",
    description: "Noticing when children's clothes no longer fit, behavior changes, academic struggles, or emotional needs. Includes recognizing developmental changes and social issues."
  },

  // DECISION-MAKING
  {
    id: "childcare_decisions",
    task_name: "Choosing childcare, schools, and educational options",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 60,
    mental_load_weight: 1.5,
    condition_trigger: ["has_children"],
    source: "Educational Choice Research",
    source_details: "Lareau (2011) - Unequal Childhoods",
    time_range: "30-180 minutes",
    description: "Researching and selecting childcare providers, schools, tutors, and educational activities. Includes evaluating options and making complex decisions about children's development."
  },
  {
    id: "service_provider_selection",
    task_name: "Selecting contractors, service providers, and professionals",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 45,
    mental_load_weight: 1.0,
    condition_trigger: ["all"],
    source: "Consumer Decision Research",
    source_details: "Service Provider Selection Studies",
    time_range: "30-120 minutes",
    description: "Choosing doctors, dentists, contractors, insurance providers, and other professionals. Includes researching options, reading reviews, and making informed decisions."
  },
  {
    id: "budget_allocation",
    task_name: "Making household budget and spending decisions",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 60,
    mental_load_weight: 1.2,
    condition_trigger: ["all"],
    source: "Financial Planning Research",
    source_details: "Household Financial Decision-Making Studies",
    time_range: "30-120 minutes",
    description: "Deciding how to allocate money across household needs, determining priorities, and making spending decisions. Includes balancing competing financial demands."
  },
  {
    id: "gift_selection",
    task_name: "Selecting gifts and managing social obligations",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 30,
    mental_load_weight: 0.9,
    condition_trigger: ["all"],
    source: "Social Psychology Research",
    source_details: "Gift-Giving and Social Obligation Studies",
    time_range: "15-75 minutes",
    description: "Choosing appropriate gifts for birthdays, holidays, and special occasions. Includes remembering important dates and managing social expectations."
  },
  {
    id: "daily_priorities",
    task_name: "Determining daily household priorities and task order",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 45,
    mental_load_weight: 1.0,
    condition_trigger: ["all"],
    source: "Time Management Research",
    source_details: "Household Task Prioritization Studies",
    time_range: "30-75 minutes",
    description: "Deciding what needs to be done each day, in what order, and by whom. Includes adapting plans when unexpected situations arise."
  },

  // MONITORING
  {
    id: "appointment_tracking",
    task_name: "Tracking appointments, deadlines, and important dates",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 60,
    mental_load_weight: 1.1,
    condition_trigger: ["all"],
    source: "Time Management Research",
    source_details: "Calendar Management and Mental Load Studies",
    time_range: "30-90 minutes",
    description: "Keeping track of upcoming appointments, deadlines, and important dates. Includes managing multiple calendars and ensuring nothing is forgotten."
  },
  {
    id: "task_followup",
    task_name: "Following up on delegated tasks and ensuring completion",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 45,
    mental_load_weight: 1.2,
    condition_trigger: ["two_adults"],
    source: "Household Management Research",
    source_details: "Task Delegation and Monitoring Studies",
    time_range: "30-90 minutes",
    description: "Checking that assigned tasks are completed, following up on delegated responsibilities, and ensuring household functions continue smoothly."
  },
  {
    id: "child_progress_monitoring",
    task_name: "Monitoring children's homework, school progress, and development",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 120,
    mental_load_weight: 1.4,
    condition_trigger: ["has_children"],
    source: "Educational Research",
    source_details: "Parental Involvement in Education Studies",
    time_range: "90-180 minutes",
    description: "Keeping track of homework completion, school performance, behavioral changes, and developmental milestones. Includes communication with teachers and other professionals."
  },
  {
    id: "project_tracking",
    task_name: "Monitoring progress on home projects and improvements",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 30,
    mental_load_weight: 0.8,
    condition_trigger: ["all"],
    source: "Project Management Research",
    source_details: "Home Improvement Project Studies",
    time_range: "15-75 minutes",
    description: "Keeping track of ongoing home improvement projects, contractor progress, and ensuring projects stay on schedule and budget."
  },
  {
    id: "subscription_management",
    task_name: "Tracking subscriptions, memberships, and recurring payments",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 30,
    mental_load_weight: 0.9,
    condition_trigger: ["all"],
    source: "Financial Management Research",
    source_details: "Subscription Economy and Household Finance Studies",
    time_range: "15-60 minutes",
    description: "Monitoring recurring payments, subscription services, and memberships. Includes evaluating whether services are still needed and managing renewals."
  },
  {
    id: "health_tracking",
    task_name: "Monitoring family health, medications, and medical care",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 60,
    mental_load_weight: 1.3,
    condition_trigger: ["has_children"],
    source: "Health Management Research",
    source_details: "Family Health Coordination Studies",
    time_range: "30-120 minutes",
    description: "Tracking vaccination schedules, medication compliance, symptom monitoring, and ensuring family members receive appropriate medical care."
  },

  // EMOTIONAL LABOUR
  {
    id: "family_conflict_management",
    task_name: "Managing conflicts and mediating family disputes",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 90,
    mental_load_weight: 1.5,
    condition_trigger: ["has_children"],
    source: "Family Psychology Research",
    source_details: "Erickson (2005) - Why Emotion Work Matters",
    time_range: "60-180 minutes",
    description: "Mediating disagreements between family members, teaching conflict resolution, and maintaining family harmony. Includes managing your own emotions while helping others."
  },
  {
    id: "emotional_support_children",
    task_name: "Providing emotional support and guidance to children",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 180,
    mental_load_weight: 1.6,
    condition_trigger: ["has_children"],
    source: "Child Development Research",
    source_details: "Emotional Support and Child Development Studies",
    time_range: "120-300 minutes",
    description: "Being emotionally available for children, helping them process feelings, providing comfort during difficulties, and supporting their emotional development."
  },
  {
    id: "partner_emotional_support",
    task_name: "Providing emotional support and maintaining relationship intimacy",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 120,
    mental_load_weight: 1.4,
    condition_trigger: ["two_adults"],
    source: "Relationship Research",
    source_details: "Hochschild (1983) - The Managed Heart",
    time_range: "60-180 minutes",
    description: "Supporting your partner emotionally, managing relationship conflicts, and maintaining emotional intimacy. Includes being attuned to their needs and feelings."
  },
  {
    id: "social_relationship_maintenance",
    task_name: "Maintaining relationships with extended family and friends",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 75,
    mental_load_weight: 1.2,
    condition_trigger: ["all"],
    source: "Social Psychology Research",
    source_details: "Kin-keeping and Social Network Maintenance Studies",
    time_range: "45-150 minutes",
    description: "Managing relationships with extended family, friends, and social networks. Includes remembering important events, maintaining contact, and organizing social activities."
  },
  {
    id: "celebration_coordination",
    task_name: "Organizing celebrations, traditions, and special occasions",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 45,
    mental_load_weight: 1.1,
    condition_trigger: ["all"],
    source: "Family Studies Research",
    source_details: "Family Ritual and Celebration Studies",
    time_range: "30-120 minutes",
    description: "Planning and executing birthdays, holidays, and family traditions. Includes creating meaningful experiences and managing the emotional labor of celebration."
  },
  {
    id: "work_life_emotional_management",
    task_name: "Managing work-family boundaries and stress",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 90,
    mental_load_weight: 1.3,
    condition_trigger: ["is_employed"],
    source: "Work-Family Research",
    source_details: "Work-Life Balance and Emotional Labor Studies",
    time_range: "60-150 minutes",
    description: "Managing the emotional toll of balancing work and family responsibilities, dealing with guilt and stress, and maintaining emotional well-being across life domains."
  },

  // Additional Context-Specific Tasks
  {
    id: "pet_care_coordination",
    task_name: "Coordinating pet care, health, and needs",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 105,
    mental_load_weight: 0.8,
    condition_trigger: ["has_pets"],
    source: "Pet Care Research",
    source_details: "American Veterinary Medical Association Studies",
    time_range: "60-180 minutes",
    description: "Managing pet feeding schedules, health care, exercise needs, and behavioral monitoring. Includes coordinating vet appointments and ensuring pet well-being."
  },
  {
    id: "garden_seasonal_planning",
    task_name: "Planning and maintaining garden through seasons",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 90,
    mental_load_weight: 0.7,
    condition_trigger: ["has_garden"],
    source: "Gardening Research",
    source_details: "Seasonal Garden Management Studies",
    time_range: "45-180 minutes",
    description: "Planning what to plant when, preparing for seasonal changes, maintaining garden health, and coordinating outdoor space management throughout the year."
  }
];