export type HouseholdType = 'single' | 'couple';
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

export interface AssessmentData {
  householdSetup: HouseholdSetup;
  taskResponses: TaskResponse[];
  partnerTaskResponses?: TaskResponse[]; // For together mode
  currentStep: number;
  currentResponder?: 'me' | 'partner'; // Track who is currently answering
}

export interface CalculatedResults {
  myVisibleLoad: number;
  myMentalLoad: number;
  partnerVisibleLoad?: number;
  partnerMentalLoad?: number;
  totalVisibleLoad: number;
  totalMentalLoad: number;
  myVisiblePercentage: number;
  myMentalPercentage: number;
  partnerVisiblePercentage?: number;
  partnerMentalPercentage?: number;
  // For together mode comparison
  partnerPerspectiveMyVisibleLoad?: number;
  partnerPerspectiveMyMentalLoad?: number;
  partnerPerspectivePartnerVisibleLoad?: number;
  partnerPerspectivePartnerMentalLoad?: number;
}