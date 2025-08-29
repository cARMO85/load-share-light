export type HouseholdType = 'single' | 'single_parent' | 'couple' | 'couple_with_children' | 'other';
export type AssessmentMode = 'solo' | 'together';

export interface HouseholdSetup {
  householdType: HouseholdType;
  assessmentMode: AssessmentMode;
  adults: number; // derived from householdType
  children: number;
  isEmployed: boolean;
  partnerEmployed?: boolean;
}

export type TaskFrequency = 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
export type TimeAdjustment = 'much_less' | 'less' | 'about_right' | 'more' | 'much_more';
export type TaskMeasurementType = 'time' | 'likert';

// Likert scale ratings for cognitive/emotional tasks
export interface LikertRating {
  burden: number; // 1-5 scale: perceived burden
  fairness: number; // 1-5 scale: fairness/acknowledgement
}

export interface TaskResponse {
  taskId: string;
  assignment: 'me' | 'shared' | 'partner';
  mySharePercentage?: number; // 0-100 percentage when 'shared' selected
  timeAdjustment?: TimeAdjustment; // adjustment from research baseline (for time-based tasks)
  estimatedMinutes?: number; // calculated from baseline + adjustment (for backward compatibility)
  frequency?: TaskFrequency; // how often this task occurs
  notApplicable?: boolean; // task not relevant to household
  // New fields for hybrid measurement
  measurementType?: TaskMeasurementType;
  likertRating?: LikertRating;
}

export interface PerceptionGapResponse {
  workPercentageSelf: number; // 0-100: what % of total household work do you think you do?
  workPercentagePartner: number; // 0-100: what % of total household work do you think your partner does?
  mentalLoadPercentageSelf: number; // 0-100: how much of the mental planning/organisation do you think you do?
  emotionalSupportPercentageSelf: number; // 0-100: how much of the emotional support work do you think you do?
}

export interface EmotionalImpactResponse {
  stressLevel: number; // 1-5: How often do you feel stressed about household responsibilities?
  fairnessLevel: number; // 1-5: How often do you feel there is an unfair division of work?
  satisfactionLevel: number; // 1-5: How satisfied are you with the way household work is shared?
  conversationFrequency: number; // 1-5: How often do you have conversations with your partner about redistributing tasks?
}

export interface AssessmentData {
  householdSetup: HouseholdSetup;
  taskResponses: TaskResponse[];
  partnerTaskResponses?: TaskResponse[]; // For together mode
  perceptionGapResponses?: PerceptionGapResponse; // Only for together mode
  partnerPerceptionGapResponses?: PerceptionGapResponse; // Only for together mode
  emotionalImpactResponses?: EmotionalImpactResponse; // Optional additional insights
  partnerEmotionalImpactResponses?: EmotionalImpactResponse; // Optional for together mode
  currentStep: number;
  currentResponder?: 'me' | 'partner'; // Track who is currently answering
}

export interface CalculatedResults {
  myVisibleTime: number;
  myMentalLoad: number;
  partnerVisibleTime?: number;
  partnerMentalLoad?: number;
  totalVisibleTime: number;
  totalMentalLoad: number;
  myVisiblePercentage: number;
  myMentalPercentage: number;
  partnerVisiblePercentage?: number;
  partnerMentalPercentage?: number;
  // For together mode comparison
  partnerPerspectiveMyVisibleTime?: number;
  partnerPerspectiveMyMentalLoad?: number;
  partnerPerspectivePartnerVisibleTime?: number;
  partnerPerspectivePartnerMentalLoad?: number;
  perceptionGaps?: {
    myVisibleTimeGap: number;
    myMentalLoadGap: number;
    partnerVisibleTimeGap: number;
    partnerMentalLoadGap: number;
  };
}