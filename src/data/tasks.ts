// Mental load tasks dataset with conditions and mental load weights
export interface Task {
  id: string;
  task_name: string;
  category: string;
  baseline_minutes_week: number;
  mental_load_weight: number;
  condition_trigger: string[];
  source: string;
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
    source: "General household maintenance"
  },
  {
    id: "laundry",
    task_name: "Laundry planning and execution",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 120,
    mental_load_weight: 0.9,
    condition_trigger: ["all"],
    source: "Regular household task"
  },
  {
    id: "grocery_planning",
    task_name: "Meal planning and grocery shopping",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 90,
    mental_load_weight: 1.2,
    condition_trigger: ["all"],
    source: "Daily life necessities"
  },
  {
    id: "bills_finances",
    task_name: "Bill payments and financial planning",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 60,
    mental_load_weight: 1.1,
    condition_trigger: ["all"],
    source: "Financial responsibilities"
  },
  {
    id: "home_maintenance",
    task_name: "Home repairs and maintenance",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 90,
    mental_load_weight: 1.0,
    condition_trigger: ["all"],
    source: "Property upkeep"
  },

  // Two adult household tasks
  {
    id: "relationship_planning",
    task_name: "Planning couple time and communication",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 45,
    mental_load_weight: 1.3,
    condition_trigger: ["two_adults"],
    source: "Relationship maintenance"
  },
  {
    id: "social_calendar",
    task_name: "Managing social calendar and events",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 30,
    mental_load_weight: 0.9,
    condition_trigger: ["two_adults"],
    source: "Social obligations"
  },

  // Children-related tasks
  {
    id: "childcare_scheduling",
    task_name: "Childcare scheduling and coordination",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 120,
    mental_load_weight: 1.4,
    condition_trigger: ["has_children"],
    source: "Parenting responsibilities"
  },
  {
    id: "school_activities",
    task_name: "School events and activity planning",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 90,
    mental_load_weight: 1.2,
    condition_trigger: ["has_children"],
    source: "Educational support"
  },
  {
    id: "child_emotional_support",
    task_name: "Emotional support and conflict resolution",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 180,
    mental_load_weight: 1.5,
    condition_trigger: ["has_children"],
    source: "Child development"
  },
  {
    id: "child_health_tracking",
    task_name: "Health appointments and tracking",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 60,
    mental_load_weight: 1.3,
    condition_trigger: ["has_children"],
    source: "Child healthcare"
  },

  // Pet-related tasks
  {
    id: "pet_care",
    task_name: "Pet feeding, exercise, and health",
    category: TASK_CATEGORIES.MONITORING,
    baseline_minutes_week: 210,
    mental_load_weight: 0.7,
    condition_trigger: ["has_pets"],
    source: "Pet care responsibilities"
  },
  {
    id: "pet_scheduling",
    task_name: "Vet appointments and pet supplies",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 30,
    mental_load_weight: 0.8,
    condition_trigger: ["has_pets"],
    source: "Pet healthcare"
  },

  // Garden-related tasks
  {
    id: "garden_maintenance",
    task_name: "Garden planning and maintenance",
    category: TASK_CATEGORIES.IDENTIFICATION,
    baseline_minutes_week: 120,
    mental_load_weight: 0.6,
    condition_trigger: ["has_garden"],
    source: "Property maintenance"
  },
  {
    id: "seasonal_garden_planning",
    task_name: "Seasonal garden planning",
    category: TASK_CATEGORIES.ANTICIPATION,
    baseline_minutes_week: 45,
    mental_load_weight: 0.7,
    condition_trigger: ["has_garden"],
    source: "Seasonal tasks"
  },

  // Employment-related tasks
  {
    id: "work_life_balance",
    task_name: "Managing work-family boundaries",
    category: TASK_CATEGORIES.EMOTIONAL_LABOUR,
    baseline_minutes_week: 60,
    mental_load_weight: 1.1,
    condition_trigger: ["is_employed"],
    source: "Work-life balance"
  },
  {
    id: "household_work_coordination",
    task_name: "Coordinating household tasks around work",
    category: TASK_CATEGORIES.DECISION_MAKING,
    baseline_minutes_week: 90,
    mental_load_weight: 1.0,
    condition_trigger: ["is_employed"],
    source: "Time management"
  }
];