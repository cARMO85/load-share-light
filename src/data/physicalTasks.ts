// Physical/Observable tasks now measured with Likert scales for consistency
export interface PhysicalTask {
  id: string;
  title: string;
  description: string;
  category: string;
  measurementType: 'likert';
}

export const PHYSICAL_TASK_CATEGORIES = {
  COOKING: "Cooking",
  CLEANING: "Cleaning", 
  LAUNDRY: "Laundry",
  CHILDCARE: "Childcare",
  SHOPPING: "Shopping",
  TRAVEL: "Travel"
} as const;

export const physicalTasks: PhysicalTask[] = [
  // COOKING
  {
    id: "cooking_meals",
    title: "Cooking meals",
    description: "Planning, preparing and cooking daily meals",
    category: PHYSICAL_TASK_CATEGORIES.COOKING,
    measurementType: 'likert'
  },
  {
    id: "meal_planning",
    title: "Meal planning",
    description: "Planning weekly menus and deciding what to cook",
    category: PHYSICAL_TASK_CATEGORIES.COOKING,
    measurementType: 'likert'
  },

  // CLEANING
  {
    id: "general_cleaning",
    title: "General cleaning",
    description: "Regular house cleaning, tidying up, dusting",
    category: PHYSICAL_TASK_CATEGORIES.CLEANING,
    measurementType: 'likert'
  },
  {
    id: "deep_cleaning",
    title: "Deep cleaning",
    description: "Thorough cleaning tasks like bathrooms, windows",
    category: PHYSICAL_TASK_CATEGORIES.CLEANING,
    measurementType: 'likert'
  },

  // LAUNDRY
  {
    id: "laundry_washing",
    title: "Washing clothes",
    description: "Washing, drying, and putting away laundry",
    category: PHYSICAL_TASK_CATEGORIES.LAUNDRY,
    measurementType: 'likert'
  },
  {
    id: "ironing",
    title: "Ironing and garment care",
    description: "Ironing clothes and special garment care",
    category: PHYSICAL_TASK_CATEGORIES.LAUNDRY,
    measurementType: 'likert'
  },

  // CHILDCARE
  {
    id: "childcare_basic",
    title: "Basic childcare",
    description: "Feeding, bathing, getting children ready",
    category: PHYSICAL_TASK_CATEGORIES.CHILDCARE,
    measurementType: 'likert'
  },
  {
    id: "childcare_educational",
    title: "Educational activities",
    description: "Homework help, reading, educational play",
    category: PHYSICAL_TASK_CATEGORIES.CHILDCARE,
    measurementType: 'likert'
  },

  // SHOPPING
  {
    id: "grocery_shopping",
    title: "Grocery shopping",
    description: "Weekly food shopping and meal supplies",
    category: PHYSICAL_TASK_CATEGORIES.SHOPPING,
    measurementType: 'likert'
  },
  {
    id: "household_shopping",
    title: "Household shopping",
    description: "Shopping for household items, clothing, etc.",
    category: PHYSICAL_TASK_CATEGORIES.SHOPPING,
    measurementType: 'likert'
  },

  // TRAVEL
  {
    id: "family_travel",
    title: "Family-related travel",
    description: "Travel for shopping, appointments, family activities",
    category: PHYSICAL_TASK_CATEGORIES.TRAVEL,
    measurementType: 'likert'
  }
];