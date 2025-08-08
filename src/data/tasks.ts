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
}

export const TASK_CATEGORIES = {
  ANTICIPATION: "Anticipation",
  IDENTIFICATION: "Identification", 
  DECISION_MAKING: "Decision-making",
  MONITORING: "Monitoring",
  EMOTIONAL_LABOUR: "Emotional Labour"
} as const;

export const mentalLoadTasks: Task[] = [
  // Basic household tasks (everyone has these)
  {
    id: "cleaning_general",
    task_name: "General house cleaning",
    category: TASK_CATEGORIES.IDENTIFICATION,
    baseline_minutes_week: 180,
    mental_load_weight: 0.8,
    condition_trigger: ["all"],
    source: "Time-use studies",
    source_details: "American Time Use Survey (2021)",
    time_range: "120-240 minutes"
  },
  {
    id: "laundry",
    task_name: "Laundry planning and execution",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 120,
    mental_load_weight: 0.9,
    condition_trigger: ["all"],
    source: "Household time studies",
    source_details: "Bureau of Labor Statistics (2022)",
    time_range: "90-150 minutes"
  },
  {
    id: "grocery_planning",
    task_name: "Meal planning and grocery shopping",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 90,
    mental_load_weight: 1.2,
    condition_trigger: ["all"],
    source: "Consumer research",
    source_details: "Food Marketing Institute (2023)",
    time_range: "60-120 minutes"
  },
  {
    id: "bills_finances",
    task_name: "Bill payments and financial planning",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 60,
    mental_load_weight: 1.1,
    condition_trigger: ["all"],
    source: "Financial literacy studies",
    source_details: "Federal Reserve Bank (2022)",
    time_range: "30-90 minutes"
  },
  {
    id: "home_maintenance",
    task_name: "Home repairs and maintenance",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 90,
    mental_load_weight: 1.0,
    condition_trigger: ["all"],
    source: "Homeownership studies",
    source_details: "Home Improvement Research Institute",
    time_range: "45-180 minutes"
  },

  // Two adult household tasks
  {
    id: "relationship_planning",
    task_name: "Planning couple time and communication",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 45,
    mental_load_weight: 1.3,
    condition_trigger: ["two_adults"],
    source: "Relationship research",
    source_details: "Journal of Marriage and Family",
    time_range: "30-90 minutes"
  },
  {
    id: "social_calendar",
    task_name: "Managing social calendar and events",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 30,
    mental_load_weight: 0.9,
    condition_trigger: ["two_adults"],
    source: "Social psychology studies",
    source_details: "Social Networks Research",
    time_range: "15-60 minutes"
  },

  // Children-related tasks
  {
    id: "childcare_scheduling",
    task_name: "Childcare scheduling and coordination",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 120,
    mental_load_weight: 1.4,
    condition_trigger: ["has_children"],
    source: "Parenting time studies",
    source_details: "Child Development Institute",
    time_range: "90-180 minutes"
  },
  {
    id: "school_activities",
    task_name: "School events and activity planning",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 90,
    mental_load_weight: 1.2,
    condition_trigger: ["has_children"],
    source: "Educational research",
    source_details: "National Education Association",
    time_range: "60-150 minutes"
  },
  {
    id: "child_emotional_support",
    task_name: "Emotional support and conflict resolution",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 180,
    mental_load_weight: 1.5,
    condition_trigger: ["has_children"],
    source: "Child psychology research",
    source_details: "Developmental Psychology Journal",
    time_range: "120-300 minutes"
  },
  {
    id: "child_health_tracking",
    task_name: "Health appointments and tracking",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 60,
    mental_load_weight: 1.3,
    condition_trigger: ["has_children"],
    source: "Pediatric care studies",
    source_details: "American Academy of Pediatrics",
    time_range: "30-120 minutes"
  },

  // Pet-related tasks
  {
    id: "pet_care",
    task_name: "Pet feeding, exercise, and health",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 210,
    mental_load_weight: 0.7,
    condition_trigger: ["has_pets"],
    source: "Pet ownership studies",
    source_details: "American Veterinary Medical Association",
    time_range: "150-300 minutes"
  },
  {
    id: "pet_scheduling",
    task_name: "Vet appointments and pet supplies",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 30,
    mental_load_weight: 0.8,
    condition_trigger: ["has_pets"],
    source: "Pet care research",
    source_details: "Pet Industry Market Research",
    time_range: "15-60 minutes"
  },

  // Garden-related tasks
  {
    id: "garden_maintenance",
    task_name: "Garden planning and maintenance",
    category: TASK_CATEGORIES.IDENTIFICATION,
    baseline_minutes_week: 120,
    mental_load_weight: 0.6,
    condition_trigger: ["has_garden"],
    source: "Gardening time studies",
    source_details: "Royal Horticultural Society",
    time_range: "60-240 minutes"
  },
  {
    id: "seasonal_garden_planning",
    task_name: "Seasonal garden planning",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 45,
    mental_load_weight: 0.7,
    condition_trigger: ["has_garden"],
    source: "Seasonal gardening research",
    source_details: "Garden Planning Institute",
    time_range: "30-90 minutes"
  },

  // Employment-related tasks
  {
    id: "work_life_balance",
    task_name: "Managing work-family boundaries",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 60,
    mental_load_weight: 1.1,
    condition_trigger: ["is_employed"],
    source: "Work-life balance studies",
    source_details: "Harvard Business Review Research",
    time_range: "30-120 minutes"
  },
  {
    id: "household_work_coordination",
    task_name: "Coordinating household tasks around work",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 90,
    mental_load_weight: 1.0,
    condition_trigger: ["is_employed"],
    source: "Time management research",
    source_details: "Work Efficiency Institute",
    time_range: "45-150 minutes"
  }
];