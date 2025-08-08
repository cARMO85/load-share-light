export interface HouseholdSetup {
  adults: number;
  children: number;
  hasPets: boolean;
  hasGarden: boolean;
  isEmployed: boolean;
  partnerEmployed?: boolean;
}

export interface TaskResponse {
  taskId: string;
  assignment: 'me' | 'shared' | 'partner';
  personalShare?: number; // 6-10 scale when 'me' or 'partner' selected
  estimatedMinutes: number; // user can edit the baseline
}

export interface AssessmentData {
  householdSetup: HouseholdSetup;
  taskResponses: TaskResponse[];
  currentStep: number;
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
}