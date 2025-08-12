import { TimeAdjustment } from '@/types/assessment';

// Time adjustment multipliers based on research and user feedback patterns
export const TIME_ADJUSTMENT_MULTIPLIERS = {
  much_less: 0.5,   // -50%
  less: 0.75,       // -25%
  about_right: 1.0, // baseline
  more: 1.25,       // +25%
  much_more: 1.5    // +50%
} as const;

// Get display text for time adjustments
export const getTimeAdjustmentLabel = (adjustment: TimeAdjustment): string => {
  switch (adjustment) {
    case 'much_less':
      return 'Much Less (-50%)';
    case 'less':
      return 'Less (-25%)';
    case 'about_right':
      return 'About Right';
    case 'more':
      return 'More (+25%)';
    case 'much_more':
      return 'Much More (+50%)';
    default:
      return 'About Right';
  }
};

// Get short display text for time adjustments
export const getTimeAdjustmentShortLabel = (adjustment: TimeAdjustment): string => {
  switch (adjustment) {
    case 'much_less':
      return '-50%';
    case 'less':
      return '-25%';
    case 'about_right':
      return 'Baseline';
    case 'more':
      return '+25%';
    case 'much_more':
      return '+50%';
    default:
      return 'Baseline';
  }
};

// Calculate adjusted time from baseline and adjustment
export const calculateAdjustedTime = (baselineMinutes: number, adjustment: TimeAdjustment): number => {
  const multiplier = TIME_ADJUSTMENT_MULTIPLIERS[adjustment];
  return Math.round(baselineMinutes * multiplier);
};

// Get description for why time might vary
export const getTimeVariationExplanation = (adjustment: TimeAdjustment): string => {
  switch (adjustment) {
    case 'much_less':
      return 'This task takes significantly less time in your household than typical research estimates.';
    case 'less':
      return 'This task takes somewhat less time in your household than typical research estimates.';
    case 'about_right':
      return 'This task takes about the same time as research estimates suggest.';
    case 'more':
      return 'This task takes somewhat more time in your household than typical research estimates.';
    case 'much_more':
      return 'This task takes significantly more time in your household than typical research estimates.';
    default:
      return 'This task takes about the same time as research estimates suggest.';
  }
};

// Get the effective time for a task response (handles both old and new format)
export const getEffectiveTaskTime = (response: { timeAdjustment?: TimeAdjustment; estimatedMinutes?: number }, baselineMinutes: number): number => {
  // If we have a time adjustment, use it to calculate from baseline
  if (response.timeAdjustment) {
    return calculateAdjustedTime(baselineMinutes, response.timeAdjustment);
  }
  
  // Fall back to estimatedMinutes for backward compatibility
  if (response.estimatedMinutes !== undefined) {
    return response.estimatedMinutes;
  }
  
  // Default to baseline
  return baselineMinutes;
};