export type HouseholdType = 'single' | 'single_parent' | 'couple' | 'couple_with_children' | 'other';
export type AssessmentMode = 'solo' | 'together';

export interface HouseholdSetup {
  householdType: HouseholdType;
  assessmentMode: AssessmentMode;
  adults: number; // derived from householdType
  children: number;
  hasPets: boolean;
  hasGarden: boolean;
  gardenSize?: 'small' | 'medium' | 'large';
  isEmployed: boolean;
  partnerEmployed?: boolean;
}

export interface TaskResponse {
  taskId: string;
  assignment: 'me' | 'shared' | 'partner';
  mySharePercentage?: number; // 0-100 percentage when 'shared' selected
  estimatedMinutes: number; // user can edit the baseline
  notApplicable?: boolean; // task not relevant to household
}

export interface AssessmentData {
  householdSetup: HouseholdSetup;
  taskResponses: TaskResponse[];
  partnerTaskResponses?: TaskResponse[]; // For together mode
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