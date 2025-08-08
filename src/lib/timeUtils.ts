import { TaskFrequency } from '@/types/assessment';

// Convert frequency to weekly multiplier
export const getWeeklyMultiplier = (frequency: TaskFrequency): number => {
  switch (frequency) {
    case 'weekly':
      return 1;
    case 'bi-weekly':
      return 0.5;
    case 'monthly':
      return 1 / 4.33; // Average weeks per month
    case 'yearly':
      return 1 / 52; // Weeks per year
    default:
      return 1;
  }
};

// Convert minutes to weekly average based on frequency
export const convertToWeeklyMinutes = (minutes: number, frequency: TaskFrequency): number => {
  return minutes * getWeeklyMultiplier(frequency);
};

// Format minutes to hours and minutes display
export const formatTimeDisplay = (totalMinutes: number, showFullFormat: boolean = true): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  
  if (!showFullFormat && totalMinutes < 60) {
    return `${minutes}min`;
  }
  
  if (hours === 0) {
    return `${minutes}min`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}min`;
};

// Get frequency display text
export const getFrequencyDisplayText = (frequency: TaskFrequency): string => {
  switch (frequency) {
    case 'weekly':
      return 'Weekly';
    case 'bi-weekly':
      return 'Bi-weekly';
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    default:
      return 'Weekly';
  }
};

// Get frequency description
export const getFrequencyDescription = (frequency: TaskFrequency): string => {
  switch (frequency) {
    case 'weekly':
      return 'Every week';
    case 'bi-weekly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Once per month';
    case 'yearly':
      return 'Once per year';
    default:
      return 'Every week';
  }
};