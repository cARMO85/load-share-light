import { TaskResponse, LikertRating } from '@/types/assessment';
import { physicalTasks, PhysicalTask } from '@/data/physicalTasks';
import { cognitiveTasks, CognitiveTask } from '@/data/tasks';
import { getEffectiveTaskTime } from '@/lib/timeAdjustmentUtils';

// UK 2024 baselines for normalization (minutes per week)
export const UK_2024_BASELINES = {
  cooking: 329,
  cleaning: 203,
  laundry: 84,
  childcare_basic: 455,
  childcare_educational: 252,
  shopping: 119,
  travel: 168
} as const;

// Calculate time-based load score
export const calculateTimeBasedScore = (
  response: TaskResponse,
  task: PhysicalTask
): number => {
  if (response.notApplicable) return 0;
  
  const timeInMinutes = getEffectiveTaskTime(response, task.baseline_minutes_week);
  const normalizedScore = timeInMinutes / task.baseline_minutes_week; // Normalize against UK baseline
  const fixedWeight = 1.0; // Fixed weight for observable tasks
  
  return normalizedScore * fixedWeight;
};

// Calculate Likert-based load score using NASA-TLX inspired method
export const calculateLikertBasedScore = (
  response: TaskResponse,
  task: CognitiveTask
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
  physicalTaskLookup: Record<string, PhysicalTask>,
  cognitiveTaskLookup: Record<string, CognitiveTask>
) => {
  let totalTimeScore = 0;
  let totalLikertScore = 0;
  let timeTaskCount = 0;
  let likertTaskCount = 0;
  
  const categoryScores: Record<string, number> = {};
  
  responses.forEach(response => {
    if (response.notApplicable) return;
    
    let taskScore = 0;
    let category = '';
    
    // Check if it's a physical (time-based) task
    const physicalTask = physicalTaskLookup[response.taskId];
    if (physicalTask) {
      taskScore = calculateTimeBasedScore(response, physicalTask);
      category = physicalTask.category;
      totalTimeScore += taskScore;
      timeTaskCount++;
    }
    
    // Check if it's a cognitive (Likert-based) task
    const cognitiveTask = cognitiveTaskLookup[response.taskId];
    if (cognitiveTask) {
      taskScore = calculateLikertBasedScore(response, cognitiveTask);
      category = cognitiveTask.category;
      totalLikertScore += taskScore;
      likertTaskCount++;
    }
    
    // Apply share percentage
    const sharePercent = response.assignment === 'me' ? (response.mySharePercentage || 100) / 100 :
                        response.assignment === 'shared' ? (response.mySharePercentage || 50) / 100 :
                        response.assignment === 'partner' ? (response.mySharePercentage || 0) / 100 : 0;
    
    const adjustedScore = taskScore * sharePercent;
    
    if (category) {
      categoryScores[category] = (categoryScores[category] || 0) + adjustedScore;
    }
  });
  
  // Combine time and Likert scores with equal weighting
  const combinedScore = (totalTimeScore + totalLikertScore) / Math.max(timeTaskCount + likertTaskCount, 1);
  
  return {
    totalScore: combinedScore,
    timeScore: totalTimeScore / Math.max(timeTaskCount, 1),
    likertScore: totalLikertScore / Math.max(likertTaskCount, 1),
    categoryScores,
    displayScore: normalizeToDisplayScale(combinedScore)
  };
};

// Calculate fairness indicators for Likert tasks
export const calculateFairnessIndicators = (
  responses: TaskResponse[],
  cognitiveTaskLookup: Record<string, CognitiveTask>
): { unfairnessPercentage: number; hasHighUnfairness: boolean } => {
  const likertResponses = responses.filter(r => 
    !r.notApplicable && 
    r.likertRating && 
    cognitiveTaskLookup[r.taskId]
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