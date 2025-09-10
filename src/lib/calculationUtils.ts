import { TaskResponse, LikertRating } from '@/types/assessment';
import { AllTask } from '@/data/allTasks';

// Core formula functions for proper mental load calculation

// Convert assignment to responsibility share (0-1)
export const calculateResponsibilityShare = (
  assignment: 'me' | 'partner' | 'shared',
  sharePercentage?: number
): number => {
  // Always use sharePercentage when provided, allowing flexible responsibility sharing
  if (sharePercentage !== undefined) {
    return sharePercentage / 100;
  }
  
  // Fallback to assignment type when no percentage specified
  switch (assignment) {
    case 'me':
      return 1.0;
    case 'partner':
      return 0.0;
    case 'shared':
      return 0.5;
    default:
      return 0.5;
  }
};

// Normalize burden rating from 1-5 scale to 0-1
export const normalizeBurden = (burden: number): number => {
  return (burden - 1) / 4;
};

// Normalize fairness rating from 1-5 scale to 0-1 (1=unacknowledged, 5=well acknowledged)
export const normalizeFairness = (fairness: number): number => {
  // Invert the scale: 1="Unacknowledged" should contribute high unfairness (1.0)
  // 5="Well acknowledged" should contribute low unfairness (0.0)
  return (5 - fairness) / 4;
};

// Calculate invisible task load (ITL) with proper active/passive mental load distinction
export const calculateInvisibleTaskLoad = (
  R: number, // responsibility share (0-1)
  b: number, // normalized burden (0-1)
  f: number, // normalized fairness (0-1)
  wB: number = 0.5, // burden weight
  wF: number = 0.5  // fairness weight
): number => {
  // Smooth intensity function: 10% passive awareness → 100% active responsibility
  const intensity = 0.1 + 0.9 * R;
  
  // Subjective strain from burden and fairness ratings
  const subjectiveStrain = wB * b + wF * f;
  
  // ITL = intensity × subjective strain × 100 (for 0-100 scale)
  return 100 * intensity * subjectiveStrain;
};

// Convert all scores to 0-100 scale for visualization
export const normalizeToDisplayScale = (score: number): number => {
  return Math.round(score * 100);
};

// Calculate comprehensive load scores for a person using proper normalized formula
export const calculatePersonLoad = (
  responses: TaskResponse[],
  taskLookup: Record<string, AllTask>
) => {
  let myInvisibleLoadSum = 0;
  let partnerInvisibleLoadSum = 0;
  let myVisibleLoadRaw = 0;
  let partnerVisibleLoadRaw = 0;
  let applicableTaskCount = 0;
  
  const categoryScores: Record<string, number> = {};
  const myItlScores: number[] = [];
  const partnerItlScores: number[] = [];
  
  responses.forEach(response => {
    if (response.notApplicable || !response.likertRating) return;
    
    const task = taskLookup[response.taskId];
    if (!task) return;
    
    const { burden, fairness } = response.likertRating;
    
    // Skip tasks without valid Likert inputs
    if (!isFinite(burden) || !isFinite(fairness)) return;
    
    // Calculate responsibility shares
    const myResponsibilityShare = calculateResponsibilityShare(response.assignment, response.mySharePercentage);
    const partnerResponsibilityShare = 1 - myResponsibilityShare;
    
    // Skip if no defined responsibility share
    if (myResponsibilityShare == null) return;
    
    // Normalize burden and fairness ratings
    const normalizedBurden = normalizeBurden(burden);
    const normalizedFairness = normalizeFairness(fairness);
    
    // Calculate invisible task loads for each person (returns 0-100 per task)
    const myITL = calculateInvisibleTaskLoad(myResponsibilityShare, normalizedBurden, normalizedFairness);
    const partnerITL = calculateInvisibleTaskLoad(partnerResponsibilityShare, normalizedBurden, normalizedFairness);
    
    // Store individual task scores for intensity calculation
    myItlScores.push(myITL);
    partnerItlScores.push(partnerITL);
    
    myInvisibleLoadSum += myITL;
    partnerInvisibleLoadSum += partnerITL;
    applicableTaskCount++;
    
    // Calculate visible workload based on responsibility share
    myVisibleLoadRaw += myResponsibilityShare;
    partnerVisibleLoadRaw += partnerResponsibilityShare;
    
    // Category scores (using my responsibility share)
    if (task.category) {
      categoryScores[task.category] = (categoryScores[task.category] || 0) + myITL;
    }
  });
  
  // WMLI_Intensity: Average subjective workload across tasks (0-100)
  const myWMLI_Intensity = applicableTaskCount > 0 
    ? Math.round(myInvisibleLoadSum / applicableTaskCount) 
    : 0;
  
  const partnerWMLI_Intensity = applicableTaskCount > 0 
    ? Math.round(partnerInvisibleLoadSum / applicableTaskCount) 
    : 0;
  
  // WMLI_Share: Percentage of household's total invisible load (0-100)
  const householdTotalITL = myInvisibleLoadSum + partnerInvisibleLoadSum;
  const myWMLI_Share = householdTotalITL > 0 ? Math.round((myInvisibleLoadSum / householdTotalITL) * 100) : 0;
  const partnerWMLI_Share = 100 - myWMLI_Share;
  
  // Calculate visible load percentages
  const totalVisibleLoadRaw = myVisibleLoadRaw + partnerVisibleLoadRaw;
  const myVisiblePercentage = totalVisibleLoadRaw > 0 ? Math.round((myVisibleLoadRaw / totalVisibleLoadRaw) * 100) : 0;
  const partnerVisiblePercentage = totalVisibleLoadRaw > 0 ? Math.round((partnerVisibleLoadRaw / totalVisibleLoadRaw) * 100) : 0;
  
  return {
    // New normalized metrics
    myWMLI_Intensity,
    partnerWMLI_Intensity,
    myWMLI_Share,
    partnerWMLI_Share,
    
    // Task counts for validation
    applicableTaskCount,
    myItlScores,
    partnerItlScores,
    
    // Legacy compatibility - use intensity scores
    myMentalLoad: myWMLI_Intensity,
    partnerMentalLoad: partnerWMLI_Intensity,
    myVisibleLoad: Math.round(myVisibleLoadRaw),
    partnerVisibleLoad: Math.round(partnerVisibleLoadRaw),
    
    // Totals
    totalMentalLoad: Math.round(myInvisibleLoadSum + partnerInvisibleLoadSum),
    totalVisibleLoad: Math.round(totalVisibleLoadRaw),
    
    // Percentages
    myMentalPercentage: myWMLI_Share,
    partnerMentalPercentage: partnerWMLI_Share,
    myVisiblePercentage,
    partnerVisiblePercentage,
    
    // Legacy fields
    totalScore: myWMLI_Intensity / 100,
    displayScore: myWMLI_Intensity,
    categoryScores
  };
};

// ============= EVIDENCE-BASED FLAG SYSTEM =============

export interface EvidenceFlags {
  highSubjectiveStrain: boolean;
  fairnessRisk: boolean;
  equityPriority: boolean;
  strainTasks: string[];
  unfairnessTasks: string[];
  averageUnfairness: number;
}

// Calculate evidence-based flags per person with proper unfairness tracking
export const calculateEvidenceFlags = (
  responses: TaskResponse[],
  taskLookup: Record<string, AllTask>,
  isMe: boolean = true
): EvidenceFlags => {
  const relevantResponses = responses.filter(r => !r.notApplicable && r.likertRating);
  
  let strainTasks: string[] = [];
  let unfairnessTasks: string[] = [];
  let totalUnfairness = 0;
  let taskCount = 0;
  
  relevantResponses.forEach(response => {
    const responsibility = isMe 
      ? calculateResponsibilityShare(response.assignment, response.mySharePercentage)
      : 1 - calculateResponsibilityShare(response.assignment, response.mySharePercentage);
    
    const { burden, fairness } = response.likertRating!;
    
    // High Subjective Strain: Responsibility ≥ 60% AND (Burden ≥ 4 OR Unfairness ≥ 4)
    if (responsibility >= 0.6 && (burden >= 4 || fairness <= 2)) {
      strainTasks.push(response.taskId);
    }
    
    // Track tasks with high unfairness
    if (fairness <= 2) { // 1-2 on fairness scale = highly unfair
      unfairnessTasks.push(response.taskId);
    }
    
    // Calculate average unfairness across all tasks
    totalUnfairness += fairness;
    taskCount++;
  });
  
  const averageUnfairness = taskCount > 0 ? totalUnfairness / taskCount : 5;
  
  return {
    highSubjectiveStrain: strainTasks.length > 0,
    fairnessRisk: averageUnfairness <= 2.5, // Average fairness ≤ 2.5 indicates risk
    equityPriority: false, // Will be calculated at household level
    strainTasks,
    unfairnessTasks,
    averageUnfairness
  };
};

// Calculate couple disparity metrics
export interface DisparityAnalysis {
  mentalLoadGap: number; // Percentage points difference
  mentalLoadRatio: number; // Larger share / smaller share
  visibleLoadGap: number;
  visibleLoadRatio: number;
  highEquityRisk: boolean;
  overburdened: 'me' | 'partner' | 'none';
}

export const calculateDisparityAnalysis = (
  myWMLI_Share: number,
  partnerWMLI_Share: number,
  myVisiblePercentage: number,
  partnerVisiblePercentage: number,
  myFlags: EvidenceFlags,
  partnerFlags: EvidenceFlags
): DisparityAnalysis => {
  // Calculate gaps in percentage points
  const mentalLoadGap = Math.abs(myWMLI_Share - partnerWMLI_Share);
  const visibleLoadGap = Math.abs(myVisiblePercentage - partnerVisiblePercentage);
  
  // Calculate ratios for relative comparison
  const mentalLoadRatio = myWMLI_Share >= partnerWMLI_Share 
    ? myWMLI_Share / Math.max(partnerWMLI_Share, 1)
    : partnerWMLI_Share / Math.max(myWMLI_Share, 1);
  
  const visibleLoadRatio = myVisiblePercentage >= partnerVisiblePercentage
    ? myVisiblePercentage / Math.max(partnerVisiblePercentage, 1)
    : partnerVisiblePercentage / Math.max(myVisiblePercentage, 1);
  
  // Evidence-based equity risk detection
  let overburdened: 'me' | 'partner' | 'none' = 'none';
  let highEquityRisk = false;
  
  // High equity risk: gap ≥20pp AND reported unfairness ≥4 (avg fairness ≤2)
  if (mentalLoadGap >= 20 && (myFlags.fairnessRisk || partnerFlags.fairnessRisk)) {
    highEquityRisk = true;
    overburdened = myWMLI_Share > partnerWMLI_Share ? 'me' : 'partner';
  } else if (mentalLoadGap >= 30) {
    // Very high disparity even without explicit fairness complaints
    overburdened = myWMLI_Share > partnerWMLI_Share ? 'me' : 'partner';
  }
  
  return {
    mentalLoadGap,
    mentalLoadRatio,
    visibleLoadGap,
    visibleLoadRatio,
    highEquityRisk,
    overburdened
  };
};

// ============= WMLI CALCULATION =============

export interface WMLIResults {
  // Dual normalized metrics (both 0-100)
  myWMLI_Intensity: number;        // Average subjective workload across my tasks
  myWMLI_Share: number;           // My percentage of household's total invisible load
  partnerWMLI_Intensity?: number;  // Partner's average subjective workload
  partnerWMLI_Share?: number;     // Partner's percentage of household's total invisible load
  
  // Legacy compatibility
  myWMLI: number;
  partnerWMLI?: number;
  householdWMLI: number;
  
  // Evidence-based insights
  myFlags: EvidenceFlags;
  partnerFlags?: EvidenceFlags;
  disparity?: DisparityAnalysis;
  interpretationContext: string;
}

export const calculateWMLI = (
  responses: TaskResponse[],
  taskLookup: Record<string, AllTask>,
  partnerResponses?: TaskResponse[]
): WMLIResults => {
  // Calculate normalized metrics for me
  const myResults = calculatePersonLoad(responses, taskLookup);
  const myFlags = calculateEvidenceFlags(responses, taskLookup, true);
  
  let partnerResults: ReturnType<typeof calculatePersonLoad> | undefined;
  let partnerFlags: EvidenceFlags | undefined;
  let disparity: DisparityAnalysis | undefined;
  
  if (partnerResponses) {
    partnerResults = calculatePersonLoad(partnerResponses, taskLookup);
    partnerFlags = calculateEvidenceFlags(partnerResponses, taskLookup, true);
    
    // Calculate equity flags for both partners
    myFlags.equityPriority = myResults.myWMLI_Share >= 60 && myFlags.fairnessRisk;
    partnerFlags.equityPriority = partnerResults.myWMLI_Share >= 60 && partnerFlags.fairnessRisk;
    
    disparity = calculateDisparityAnalysis(
      myResults.myWMLI_Share,
      partnerResults.myWMLI_Share,
      myResults.myVisiblePercentage,
      partnerResults.myVisiblePercentage,
      myFlags,
      partnerFlags
    );
  }
  
  // Legacy compatibility values
  const myWMLI = myResults.myWMLI_Intensity;
  const partnerWMLI = partnerResults?.myWMLI_Intensity;
  const householdWMLI = myWMLI + (partnerWMLI || 0);
  
  // Generate evidence-based interpretation
  let interpretationContext = "WMLI Intensity (0-100): average subjective workload across tasks. WMLI Share (%): your portion of household's invisible load.";
  
  if (partnerWMLI !== undefined && disparity) {
    if (disparity.highEquityRisk) {
      interpretationContext += " ⚠️ High equity risk: significant disparity with fairness concerns.";
    } else if (disparity.mentalLoadGap >= 20) {
      interpretationContext += ` Notable disparity: ${disparity.mentalLoadGap}pp gap in mental load share.`;
    } else {
      interpretationContext += " Mental load distribution appears balanced.";
    }
  }
  
  return {
    // New normalized dual metrics
    myWMLI_Intensity: myResults.myWMLI_Intensity,
    myWMLI_Share: myResults.myWMLI_Share,
    partnerWMLI_Intensity: partnerResults?.myWMLI_Intensity,
    partnerWMLI_Share: partnerResults?.myWMLI_Share,
    
    // Legacy compatibility
    myWMLI,
    partnerWMLI,
    householdWMLI,
    
    // Evidence-based insights
    myFlags,
    partnerFlags,
    disparity,
    interpretationContext
  };
};

// Calculate fairness indicators for all tasks (legacy compatibility)
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