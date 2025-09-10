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
    
    // Debug logging to verify calculations
    console.log(`Task ${response.taskId}:`, {
      assignment: response.assignment,
      sharePercentage: response.mySharePercentage,
      myResponsibilityShare,
      burden,
      fairness,
      normalizedBurden,
      normalizedFairness
    });
    
    // Calculate invisible task loads for each person
    const myITL = calculateInvisibleTaskLoad(myResponsibilityShare, normalizedBurden, normalizedFairness);
    const partnerITL = calculateInvisibleTaskLoad(partnerResponsibilityShare, normalizedBurden, normalizedFairness);
    
    console.log(`  Mental loads: myITL=${myITL.toFixed(2)}, partnerITL=${partnerITL.toFixed(2)}`);
    
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

// ============= EVIDENCE-BASED FLAG SYSTEM =============

export interface EvidenceFlags {
  highSubjectiveStrain: boolean;
  fairnessRisk: boolean;
  equityPriority: boolean;
  strainTasks: string[];
  unfairnessTasks: string[];
}

// Calculate evidence-based flags per person
export const calculateEvidenceFlags = (
  responses: TaskResponse[],
  taskLookup: Record<string, AllTask>,
  isMe: boolean = true
): EvidenceFlags => {
  const relevantResponses = responses.filter(r => !r.notApplicable && r.likertRating);
  
  let strainTasks: string[] = [];
  let unfairnessTasks: string[] = [];
  let weightedUnfairness = 0;
  let totalResponsibility = 0;
  
  relevantResponses.forEach(response => {
    const responsibility = isMe 
      ? calculateResponsibilityShare(response.assignment, response.mySharePercentage)
      : 1 - calculateResponsibilityShare(response.assignment, response.mySharePercentage);
    
    const { burden, fairness } = response.likertRating!;
    
    // Flag: High Subjective Strain (Responsibility ≥ 60% AND Burden ≥ 4)
    if (responsibility >= 0.6 && burden >= 4) {
      strainTasks.push(response.taskId);
    }
    
    // Track unfairness for weighted average
    if (fairness <= 2) { // 1-2 on fairness scale = highly unfair
      unfairnessTasks.push(response.taskId);
    }
    
    // Calculate weighted unfairness (weighted by responsibility)
    const unfairnessScore = (5 - fairness) / 4; // Normalize to 0-1
    weightedUnfairness += unfairnessScore * responsibility;
    totalResponsibility += responsibility;
  });
  
  const avgWeightedUnfairness = totalResponsibility > 0 ? weightedUnfairness / totalResponsibility : 0;
  
  return {
    highSubjectiveStrain: strainTasks.length > 0,
    fairnessRisk: avgWeightedUnfairness >= 0.75, // Corresponds to avg fairness ≤ 2
    equityPriority: false, // Will be calculated at household level
    strainTasks,
    unfairnessTasks
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
  myMentalLoad: number,
  partnerMentalLoad: number,
  myVisibleLoad: number,
  partnerVisibleLoad: number,
  myFlags: EvidenceFlags,
  partnerFlags: EvidenceFlags,
  myMentalPercentage: number,
  partnerMentalPercentage: number
): DisparityAnalysis => {
  const mentalLoadGap = Math.abs(myMentalPercentage - partnerMentalPercentage);
  const visibleLoadGap = Math.abs(myVisibleLoad - partnerVisibleLoad);
  
  const mentalLoadRatio = myMentalPercentage >= partnerMentalPercentage 
    ? myMentalPercentage / Math.max(partnerMentalPercentage, 1)
    : partnerMentalPercentage / Math.max(myMentalPercentage, 1);
  
  const visibleLoadRatio = myVisibleLoad >= partnerVisibleLoad
    ? myVisibleLoad / Math.max(partnerVisibleLoad, 1)
    : partnerVisibleLoad / Math.max(myVisibleLoad, 1);
  
  // Determine who is overburdened and equity risk
  let overburdened: 'me' | 'partner' | 'none' = 'none';
  let highEquityRisk = false;
  
  if (myMentalPercentage >= 60 && myFlags.fairnessRisk) {
    overburdened = 'me';
    highEquityRisk = true;
  } else if (partnerMentalPercentage >= 60 && partnerFlags.fairnessRisk) {
    overburdened = 'partner';
    highEquityRisk = true;
  } else if (mentalLoadGap >= 20) {
    // Flag high disparity even without fairness issues
    overburdened = myMentalPercentage > partnerMentalPercentage ? 'me' : 'partner';
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
  myWMLI: number;        // 0-100 Weighted Mental Load Index for me
  partnerWMLI?: number;  // 0-100 Weighted Mental Load Index for partner
  householdWMLI: number; // Total household WMLI
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
  // Calculate my WMLI (equivalent to mental load from existing calculation)
  const myResults = calculatePersonLoad(responses, taskLookup);
  const myWMLI = Math.round(myResults.myMentalLoad);
  const myFlags = calculateEvidenceFlags(responses, taskLookup, true);
  
  let partnerWMLI: number | undefined;
  let partnerFlags: EvidenceFlags | undefined;
  let disparity: DisparityAnalysis | undefined;
  
  if (partnerResponses) {
    const partnerResults = calculatePersonLoad(partnerResponses, taskLookup);
    partnerWMLI = Math.round(partnerResults.myMentalLoad);
    partnerFlags = calculateEvidenceFlags(partnerResponses, taskLookup, true);
    
    // Calculate equity flags for both partners
    myFlags.equityPriority = myResults.myMentalPercentage >= 60 && myFlags.fairnessRisk;
    partnerFlags.equityPriority = myResults.partnerMentalPercentage! >= 60 && partnerFlags.fairnessRisk;
    
    disparity = calculateDisparityAnalysis(
      myWMLI,
      partnerWMLI,
      myResults.myVisibleLoad,
      myResults.partnerVisibleLoad!,
      myFlags,
      partnerFlags,
      myResults.myMentalPercentage,
      myResults.partnerMentalPercentage!
    );
  }
  
  const householdWMLI = myWMLI + (partnerWMLI || 0);
  
  // Generate interpretation context
  let interpretationContext = "Higher WMLI scores indicate greater subjective workload from household responsibilities.";
  
  if (partnerWMLI !== undefined) {
    if (disparity?.highEquityRisk) {
      interpretationContext += " ⚠️ Significant disparity detected with fairness concerns.";
    } else if (disparity?.mentalLoadGap && disparity.mentalLoadGap >= 20) {
      interpretationContext += " Notable difference in mental load distribution.";
    } else {
      interpretationContext += " Mental load appears reasonably balanced.";
    }
  }
  
  return {
    myWMLI,
    partnerWMLI,
    householdWMLI,
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