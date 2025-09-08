// Physical/Observable tasks now measured with Likert scales for consistency
export interface PhysicalTask {
  id: string;
  title: string;
  description: string;
  category: string;
  measurementType: 'likert';
}

export const PHYSICAL_TASK_CATEGORIES = {
  COOKING: "Cooking & Meals",
  CLEANING: "Cleaning & Maintenance", 
  LAUNDRY: "Laundry & Clothing",
  CHILDCARE: "Childcare",
  SHOPPING: "Shopping & Errands"
} as const;

export const physicalTasks: PhysicalTask[] = [
  // COOKING & MEALS
  {
    id: "meal_management",
    title: "Meal planning and cooking",
    description: "Planning menus, cooking meals, and kitchen management",
    category: PHYSICAL_TASK_CATEGORIES.COOKING,
    measurementType: 'likert'
  },

  // CLEANING & MAINTENANCE
  {
    id: "house_cleaning",
    title: "House cleaning and maintenance",
    description: "Regular cleaning, tidying, and household upkeep",
    category: PHYSICAL_TASK_CATEGORIES.CLEANING,
    measurementType: 'likert'
  },

  // LAUNDRY
  {
    id: "laundry_management",
    title: "Laundry and clothing care",
    description: "Washing, drying, folding, and organizing clothes",
    category: PHYSICAL_TASK_CATEGORIES.LAUNDRY,
    measurementType: 'likert'
  },

  // CHILDCARE
  {
    id: "childcare_overall",
    title: "Childcare and supervision",
    description: "Daily childcare, supervision, and child-related activities",
    category: PHYSICAL_TASK_CATEGORIES.CHILDCARE,
    measurementType: 'likert'
  },

  // SHOPPING & ERRANDS
  {
    id: "shopping_errands",
    title: "Shopping and errands",
    description: "Grocery shopping, household shopping, and running errands",
    category: PHYSICAL_TASK_CATEGORIES.SHOPPING,
    measurementType: 'likert'
  }
];