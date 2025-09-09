import { TaskResponse, LikertRating } from '@/types/assessment';
import { AllTask } from '@/data/allTasks';

// Core formula functions for proper mental load calculation

// Convert assignment to responsibility share (0-1)
export const calculateResponsibilityShare = (
  assignment: 'me' | 'partner' | 'shared',
  sharePercentage?: number
): number => {
  switch (assignment) {
    case 'me':
      return 1.0;
    case 'partner':
      return 0.0;
    case 'shared':
      return (sharePercentage || 50) / 100;
    default:
      return 0.5;
  }
};

// Normalize burden rating from 1-5 scale to 0-1
export const normalizeBurden = (burden: number): number => {
  return (burden - 1) / 4;
};

// Normalize fairness rating from 1-5 scale to 0-1 (1=fair, 5=unfair)
export const normalizeFairness = (fairness: number): number => {
  return (fairness - 1) / 4;
};

// Calculate invisible task load (ITL) using proper formula
export const calculateInvisibleTaskLoad = (
  R: number, // responsibility share (0-1)
  b: number, // normalized burden (0-1)
  f: number, // normalized fairness (0-1)
  wB: number = 0.5, // burden weight
  wF: number = 0.5  // fairness weight
): number => {
  return 100 * R * (wB * b + wF * f);
};

// Convert all scores to 0-100 scale for visualization
export const normalizeToDisplayScale = (score: number): number => {
  return Math.round(score * 100);
};

// Calculate comprehensive load scores for a person using proper formula
export const calculatePersonLoad = (
  responses: TaskResponse[],
  taskLookup: Record<string, AllTask>
) => {
  let myInvisibleLoadRaw = 0;
  let partnerInvisibleLoadRaw = 0;
  let myVisibleLoadRaw = 0;
  let partnerVisibleLoadRaw = 0;
  
  const categoryScores: Record<string, number> = {};
  
  responses.forEach(response => {
    if (response.notApplicable || !response.likertRating) return;
    
    const task = taskLookup[response.taskId];
    if (!task) return;
    
    const { burden, fairness } = response.likertRating;
    
    // Calculate responsibility shares
    const myResponsibilityShare = calculateResponsibilityShare(response.assignment, response.mySharePercentage);
    const partnerResponsibilityShare = 1 - myResponsibilityShare;
    
    // Normalize burden and fairness ratings
    const normalizedBurden = normalizeBurden(burden);
    const normalizedFairness = normalizeFairness(fairness);
    
    // Calculate invisible task loads for each person
    const myITL = calculateInvisibleTaskLoad(myResponsibilityShare, normalizedBurden, normalizedFairness);
    const partnerITL = calculateInvisibleTaskLoad(partnerResponsibilityShare, normalizedBurden, normalizedFairness);
    
    myInvisibleLoadRaw += myITL;
    partnerInvisibleLoadRaw += partnerITL;
    
    // Calculate visible workload based on responsibility share (without time data)
    myVisibleLoadRaw += myResponsibilityShare;
    partnerVisibleLoadRaw += partnerResponsibilityShare;
    
    // Category scores (using my responsibility share)
    if (task.category) {
      categoryScores[task.category] = (categoryScores[task.category] || 0) + myITL;
    }
  });
  
  // Calculate household totals for percentage calculations
  const totalInvisibleLoadRaw = myInvisibleLoadRaw + partnerInvisibleLoadRaw;
  const totalVisibleLoadRaw = myVisibleLoadRaw + partnerVisibleLoadRaw;
  
  // Calculate percentages
  const myMentalPercentage = totalInvisibleLoadRaw > 0 ? Math.round((myInvisibleLoadRaw / totalInvisibleLoadRaw) * 100) : 0;
  const partnerMentalPercentage = totalInvisibleLoadRaw > 0 ? Math.round((partnerInvisibleLoadRaw / totalInvisibleLoadRaw) * 100) : 0;
  
  const myVisiblePercentage = totalVisibleLoadRaw > 0 ? Math.round((myVisibleLoadRaw / totalVisibleLoadRaw) * 100) : 0;
  const partnerVisiblePercentage = totalVisibleLoadRaw > 0 ? Math.round((partnerVisibleLoadRaw / totalVisibleLoadRaw) * 100) : 0;
  
  // Calculate display scores (0-100 scale)
  const myDisplayScore = Math.round(myInvisibleLoadRaw);
  const partnerDisplayScore = Math.round(partnerInvisibleLoadRaw);
  
  return {
    // Legacy compatibility
    totalScore: myInvisibleLoadRaw / 100,
    displayScore: myDisplayScore,
    categoryScores,
    
    // Proper separated metrics
    myMentalLoad: Math.round(myInvisibleLoadRaw),
    partnerMentalLoad: Math.round(partnerInvisibleLoadRaw),
    myVisibleLoad: Math.round(myVisibleLoadRaw),
    partnerVisibleLoad: Math.round(partnerVisibleLoadRaw),
    
    // Totals
    totalMentalLoad: Math.round(totalInvisibleLoadRaw),
    totalVisibleLoad: Math.round(totalVisibleLoadRaw),
    
    // Percentages
    myMentalPercentage,
    partnerMentalPercentage,
    myVisiblePercentage,
    partnerVisiblePercentage
  };
};

// Calculate fairness indicators for all tasks
export const calculateFairnessIndicators = (
  responses: TaskResponse[]
): { unfairnessPercentage: number; hasHighUnfairness: boolean } => {
  const likertResponses = responses.filter(r => 
    !r.notApplicable && 
    r.likertRating
  );
  
  if (likertResponses.length === 0) {
    return { unfairnessPercentage: 0, hasHighUnfairness: false };
  }
  
  const totalUnfairness = likertResponses.reduce((sum, response) => {
    if (!response.likertRating) return sum;
    const unfairness = (5 - response.likertRating.fairness) / 4; // Convert to 0-1 scale
    return sum + unfairness;
  }, 0);
  
  const unfairnessPercentage = (totalUnfairness / likertResponses.length) * 100;
  const hasHighUnfairness = unfairnessPercentage > 20;
  
  return { unfairnessPercentage, hasHighUnfairness };
};