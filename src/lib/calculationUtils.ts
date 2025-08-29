import { TaskResponse, LikertRating } from '@/types/assessment';
import { AllTask } from '@/data/allTasks';

// Calculate Likert-based load score using simplified method
export const calculateTaskScore = (
  response: TaskResponse
): number => {
  if (response.notApplicable || !response.likertRating) return 0;
  
  const { burden, fairness } = response.likertRating;
  
  // Convert 1-5 scale to unfairness factor
  const unfairnessFactor = (5 - fairness) / 5;
  
  // Weighted Score = Burden Rating × (1 + Unfairness Factor)
  const weightedScore = burden * (1 + unfairnessFactor);
  
  // Normalize to 0-1 scale (max possible score is 5 * (1 + 1) = 10)
  return weightedScore / 10;
};

// Convert all scores to 0-100 scale for visualization
export const normalizeToDisplayScale = (score: number): number => {
  return Math.round(score * 100);
};

// Calculate comprehensive load scores for a person
export const calculatePersonLoad = (
  responses: TaskResponse[],
  taskLookup: Record<string, AllTask>
) => {
  let totalScore = 0;
  let taskCount = 0;
  let myLoad = 0;
  let partnerLoad = 0;
  
  const categoryScores: Record<string, number> = {};
  
  responses.forEach(response => {
    if (response.notApplicable) return;
    
    const taskScore = calculateTaskScore(response);
    const task = taskLookup[response.taskId];
    
    if (!task) return;
    
    const category = task.category;
    
    // Calculate contributions based on assignment
    if (response.assignment === 'me') {
      myLoad += taskScore;
    } else if (response.assignment === 'partner') {
      partnerLoad += taskScore;
    } else if (response.assignment === 'shared') {
      const myShare = (response.mySharePercentage || 50) / 100;
      const partnerShare = 1 - myShare;
      
      myLoad += taskScore * myShare;
      partnerLoad += taskScore * partnerShare;
    }
    
    // Apply share percentage for category scores
    const sharePercent = response.assignment === 'me' ? 1 :
                        response.assignment === 'shared' ? (response.mySharePercentage || 50) / 100 :
                        0;
    
    const adjustedScore = taskScore * sharePercent;
    
    if (category) {
      categoryScores[category] = (categoryScores[category] || 0) + adjustedScore;
    }
    
    totalScore += taskScore;
    taskCount++;
  });
  
  // Calculate totals and percentages
  const totalLoad = myLoad + partnerLoad;
  
  const myPercentage = totalLoad > 0 ? (myLoad / totalLoad) * 100 : 0;
  const partnerPercentage = totalLoad > 0 ? (partnerLoad / totalLoad) * 100 : 0;
  
  const averageScore = taskCount > 0 ? totalScore / taskCount : 0;
  
  return {
    totalScore: averageScore,
    categoryScores,
    displayScore: normalizeToDisplayScale(averageScore),
    myVisibleTime: Math.round(myLoad * 100), // Convert to display units
    myMentalLoad: Math.round(myLoad * 100),
    partnerVisibleTime: Math.round(partnerLoad * 100),
    partnerMentalLoad: Math.round(partnerLoad * 100),
    totalVisibleTime: Math.round(totalLoad * 100),
    totalMentalLoad: Math.round(totalLoad * 100),
    myVisiblePercentage: Math.round(myPercentage),
    myMentalPercentage: Math.round(myPercentage),
    partnerVisiblePercentage: Math.round(partnerPercentage),
    partnerMentalPercentage: Math.round(partnerPercentage)
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