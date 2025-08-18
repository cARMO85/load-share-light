// Research-based benchmarks for contextualizing user results
// Based on peer-reviewed literature on household labor division

export interface ResearchBenchmark {
  id: string;
  description: string;
  finding: string;
  source: string;
  year: number;
  context: string;
  applicableConditions?: string[];
}

export const RESEARCH_BENCHMARKS: ResearchBenchmark[] = [
  {
    id: 'pre_children_household_split',
    description: 'Household task division before children',
    finding: 'Wives complete 67% of chores (3.9 per day), husbands 33% (1.9 per day)',
    source: 'Huston & Vangilisti (1995); MacDermid, Huston & McHale (1990)',
    year: 1995,
    context: 'pre_children',
    applicableConditions: ['no_children', 'dual_earner']
  },
  {
    id: 'post_children_task_increase',
    description: 'Task load increase after having children',
    finding: 'Family-related activities jump from 5.8/day to 36.2/day',
    source: 'Huston & Vangilisti (1995)',
    year: 1995,
    context: 'post_children',
    applicableConditions: ['has_children']
  },
  {
    id: 'mothers_vs_fathers_daily_tasks',
    description: 'Daily task breakdown for parents',
    finding: 'Mothers: 5.3 household + 22.7 childcare tasks/day; Fathers: 2.4 household + 5.9 childcare tasks/day',
    source: 'Huston & Vangilisti (1995)',
    year: 1995,
    context: 'parents',
    applicableConditions: ['has_children', 'dual_earner']
  },
  {
    id: 'weekly_household_time_dual_earner',
    description: 'Weekly household task time in dual-earner couples',
    finding: 'Women average 15 hrs/week, men average 6.8 hrs/week',
    source: 'Stevens, Kiger, & Riley (2001)',
    year: 2001,
    context: 'household_time',
    applicableConditions: ['dual_earner', 'weekly_comparison']
  },
  {
    id: 'invisible_labor_mothers',
    description: 'Mental load and invisible household labor',
    finding: 'Mothers serve as "captains of households" carrying disproportionate cognitive and emotional labor',
    source: 'Ciciolla & Luthar - Invisible Household Labor and Ramifications for Adjustment',
    year: 2019,
    context: 'mental_load',
    applicableConditions: ['has_children', 'mothers']
  }
];

// Helper functions for benchmark analysis
export const getApplicableBenchmarks = (
  householdType: 'single' | 'couple', 
  hasChildren: boolean, 
  bothWork?: boolean
): ResearchBenchmark[] => {
  return RESEARCH_BENCHMARKS.filter(benchmark => {
    if (!benchmark.applicableConditions) return true;
    
    const conditions = benchmark.applicableConditions;
    
    // Check household composition
    if (conditions.includes('dual_earner') && (householdType !== 'couple' || !bothWork)) {
      return false;
    }
    
    // Check children status
    if (conditions.includes('has_children') && !hasChildren) return false;
    if (conditions.includes('no_children') && hasChildren) return false;
    
    return true;
  });
};

export const compareToResearchAverage = (
  userPercentage: number,
  researchPercentage: number,
  context: string = 'household_tasks'
): {
  difference: number;
  interpretation: 'much_higher' | 'higher' | 'typical' | 'lower' | 'much_lower';
  message: string;
} => {
  const difference = userPercentage - researchPercentage;
  const absDifference = Math.abs(difference);
  
  let interpretation: 'much_higher' | 'higher' | 'typical' | 'lower' | 'much_lower';
  let message: string;
  
  if (absDifference <= 5) {
    interpretation = 'typical';
    message = `Your ${userPercentage}% aligns closely with research averages (${researchPercentage}%)`;
  } else if (difference > 15) {
    interpretation = 'much_higher';
    message = `Your ${userPercentage}% is significantly higher than research averages (${researchPercentage}%)`;
  } else if (difference > 5) {
    interpretation = 'higher';
    message = `Your ${userPercentage}% is moderately higher than research averages (${researchPercentage}%)`;
  } else if (difference < -15) {
    interpretation = 'much_lower';
    message = `Your ${userPercentage}% is significantly lower than research averages (${researchPercentage}%)`;
  } else {
    interpretation = 'lower';
    message = `Your ${userPercentage}% is moderately lower than research averages (${researchPercentage}%)`;
  }
  
  return { difference, interpretation, message };
};

// Convert weekly hours to minutes for comparison
export const convertHoursToMinutes = (hours: number): number => hours * 60;

// Research-based weekly time averages (in minutes)
export const RESEARCH_TIME_AVERAGES = {
  // Stevens, Kiger, & Riley (2001) - dual-earner couples
  women_household_weekly: convertHoursToMinutes(15), // 900 minutes
  men_household_weekly: convertHoursToMinutes(6.8),  // 408 minutes
  
  // Calculated percentages from the above
  women_household_percentage: 67, // Consistent with Huston & Vangilisti
  men_household_percentage: 33,
  
  // Daily task estimates converted to weekly (approximate)
  mothers_household_weekly: 5.3 * 7 * 15, // 5.3 tasks * 7 days * ~15 min average per task
  fathers_household_weekly: 2.4 * 7 * 15, // 2.4 tasks * 7 days * ~15 min average per task
};

export const getResearchComparison = (
  userMinutes: number,
  userPercentage: number,
  userGender: 'women' | 'men' | 'unknown',
  hasChildren: boolean
): {
  timeComparison: string;
  percentageComparison: string;
  relevantBenchmarks: ResearchBenchmark[];
} => {
  const relevantBenchmarks = getApplicableBenchmarks(
    'couple', 
    hasChildren, 
    true // assuming dual-earner for comparison
  );
  
  // Time comparison
  let expectedMinutes: number;
  let expectedPercentage: number;
  
  if (userGender === 'women') {
    expectedMinutes = hasChildren ? RESEARCH_TIME_AVERAGES.mothers_household_weekly : RESEARCH_TIME_AVERAGES.women_household_weekly;
    expectedPercentage = RESEARCH_TIME_AVERAGES.women_household_percentage;
  } else {
    expectedMinutes = hasChildren ? RESEARCH_TIME_AVERAGES.fathers_household_weekly : RESEARCH_TIME_AVERAGES.men_household_weekly;
    expectedPercentage = RESEARCH_TIME_AVERAGES.men_household_percentage;
  }
  
  const timeComparison = compareToResearchAverage(
    Math.round(userMinutes / 60 * 10) / 10, // Convert to hours with 1 decimal
    Math.round(expectedMinutes / 60 * 10) / 10,
    'time'
  ).message;
  
  const percentageComparison = compareToResearchAverage(
    userPercentage,
    expectedPercentage,
    'percentage'
  ).message;
  
  return {
    timeComparison,
    percentageComparison,
    relevantBenchmarks
  };
};