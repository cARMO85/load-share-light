// Physical/Observable tasks measured in time (UK 2024 Time Use Survey baselines)
export interface PhysicalTask {
  id: string;
  task_name: string;
  category: string;
  baseline_minutes_week: number;
  default_frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  condition_trigger: string[];
  source: string;
  source_details: string;
  time_range: string;
  description?: string;
  measurementType: 'time';
}

export const PHYSICAL_TASK_CATEGORIES = {
  COOKING: "Cooking & Food Prep",
  CLEANING: "Cleaning & Housework", 
  LAUNDRY: "Laundry",
  CHILDCARE_BASIC: "Basic Childcare",
  CHILDCARE_EDUCATIONAL: "Educational Childcare",
  SHOPPING: "Shopping",
  TRAVEL: "Family Travel & Transport"
} as const;

export const physicalTasks: PhysicalTask[] = [
  // COOKING & FOOD PREP
  {
    id: "daily_cooking",
    task_name: "Daily cooking and meal preparation",
    category: PHYSICAL_TASK_CATEGORIES.COOKING,
    baseline_minutes_week: 329, // ~47 mins/day * 7 days
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "200-500 minutes/week",
    description: "Preparing meals, cooking, serving food, and basic food preparation tasks.",
    measurementType: 'time'
  },
  {
    id: "food_shopping",
    task_name: "Grocery shopping and food purchasing",
    category: PHYSICAL_TASK_CATEGORIES.SHOPPING,
    baseline_minutes_week: 119, // ~17 mins/day * 7 days
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "60-180 minutes/week",
    description: "Shopping for groceries, food items, and household consumables.",
    measurementType: 'time'
  },

  // CLEANING & HOUSEWORK
  {
    id: "general_cleaning",
    task_name: "General housework and cleaning",
    category: PHYSICAL_TASK_CATEGORIES.CLEANING,
    baseline_minutes_week: 203, // ~29 mins/day * 7 days
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "120-350 minutes/week",
    description: "Routine cleaning, tidying, dusting, vacuuming, and maintaining household spaces.",
    measurementType: 'time'
  },
  {
    id: "kitchen_cleanup",
    task_name: "Kitchen cleaning and dish washing",
    category: PHYSICAL_TASK_CATEGORIES.CLEANING,
    baseline_minutes_week: 140, // ~20 mins/day * 7 days
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "70-210 minutes/week",
    description: "Washing dishes, cleaning kitchen surfaces, and maintaining kitchen cleanliness.",
    measurementType: 'time'
  },
  {
    id: "bathroom_cleaning",
    task_name: "Bathroom cleaning and maintenance",
    category: PHYSICAL_TASK_CATEGORIES.CLEANING,
    baseline_minutes_week: 60, // ~2 hours per week
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "30-120 minutes/week",
    description: "Cleaning bathrooms, toilets, and maintaining sanitary spaces.",
    measurementType: 'time'
  },

  // LAUNDRY
  {
    id: "laundry_washing",
    task_name: "Washing, drying, and folding laundry",
    category: PHYSICAL_TASK_CATEGORIES.LAUNDRY,
    baseline_minutes_week: 84, // ~12 mins/day * 7 days
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "60-150 minutes/week",
    description: "Washing clothes, drying, folding, and putting away laundry.",
    measurementType: 'time'
  },
  {
    id: "ironing",
    task_name: "Ironing and garment care",
    category: PHYSICAL_TASK_CATEGORIES.LAUNDRY,
    baseline_minutes_week: 45, // Variable based on household needs
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "20-90 minutes/week",
    description: "Ironing clothes and special garment care.",
    measurementType: 'time'
  },

  // BASIC CHILDCARE
  {
    id: "childcare_basic",
    task_name: "Basic childcare (feeding, bathing, dressing)",
    category: PHYSICAL_TASK_CATEGORIES.CHILDCARE_BASIC,
    baseline_minutes_week: 455, // ~65 mins/day * 7 days
    default_frequency: 'weekly',
    condition_trigger: ["has_children"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "300-700 minutes/week",
    description: "Physical care of children including feeding, bathing, dressing, and basic care needs.",
    measurementType: 'time'
  },
  {
    id: "childcare_transport",
    task_name: "Transporting children to activities",
    category: PHYSICAL_TASK_CATEGORIES.TRAVEL,
    baseline_minutes_week: 168, // ~24 mins/day * 7 days
    default_frequency: 'weekly',
    condition_trigger: ["has_children"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "100-300 minutes/week",
    description: "Driving or accompanying children to school, activities, and appointments.",
    measurementType: 'time'
  },

  // EDUCATIONAL CHILDCARE
  {
    id: "childcare_educational",
    task_name: "Educational activities and play with children",
    category: PHYSICAL_TASK_CATEGORIES.CHILDCARE_EDUCATIONAL,
    baseline_minutes_week: 252, // ~36 mins/day * 7 days
    default_frequency: 'weekly',
    condition_trigger: ["has_children"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "150-400 minutes/week",
    description: "Playing with children, helping with homework, educational activities, and interactive care.",
    measurementType: 'time'
  },

  // SHOPPING & ERRANDS
  {
    id: "household_shopping",
    task_name: "Non-food shopping and errands",
    category: PHYSICAL_TASK_CATEGORIES.SHOPPING,
    baseline_minutes_week: 90, // Weekly average
    default_frequency: 'weekly',
    condition_trigger: ["all"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "45-180 minutes/week",
    description: "Shopping for household items, clothing, and running errands.",
    measurementType: 'time'
  },

  // TRAVEL
  {
    id: "family_transport",
    task_name: "Family-related travel and transportation",
    category: PHYSICAL_TASK_CATEGORIES.TRAVEL,
    baseline_minutes_week: 120, // Additional family travel beyond childcare
    default_frequency: 'weekly',
    condition_trigger: ["two_adults"],
    source: "UK Time Use Survey 2024",
    source_details: "National Statistics Office - Time Use Survey",
    time_range: "60-240 minutes/week",
    description: "Travel for family activities, appointments, and household-related trips.",
    measurementType: 'time'
  }
];