import { mentalLoadTasks, TASK_CATEGORIES } from '@/data/tasks';
import { CalculatedResults, TaskResponse } from '@/types/assessment';
import { getEffectiveTaskTime } from '@/lib/timeAdjustmentUtils';

interface ConversationPrompt {
  id: string;
  category: 'workload' | 'perception' | 'emotion' | 'planning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  question: string;
  context: string;
  followUp?: string[];
  discussed?: boolean;
  notes?: string;
}

export const generateConversationPrompts = (
  results: CalculatedResults,
  taskResponses: TaskResponse[],
  partnerTaskResponses?: TaskResponse[],
  isTogetherMode = false
): ConversationPrompt[] => {
  const prompts: ConversationPrompt[] = [];
  const taskLookup = mentalLoadTasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {} as Record<string, typeof mentalLoadTasks[0]>);

  // 1. Major workload imbalance
  if (results.myMentalPercentage > 70) {
    prompts.push({
      id: 'workload-imbalance-high',
      category: 'workload',
      priority: 'high',
      title: 'Significant Mental Load Imbalance',
      question: `You're carrying ${results.myMentalPercentage}% of the mental load. How does this feel for you, and what would feel more sustainable?`,
      context: `Research shows that when one partner carries more than 70% of mental load, it often leads to burnout and relationship stress.`,
      followUp: [
        'Which specific areas feel most overwhelming?',
        'What support would be most helpful?',
        'Are there tasks your partner could take full ownership of?'
      ]
    });
  } else if (results.myMentalPercentage < 30) {
    prompts.push({
      id: 'workload-imbalance-low',
      category: 'workload',
      priority: 'medium',
      title: 'Partner Carries Heavy Mental Load',
      question: `Your partner handles ${results.partnerMentalPercentage}% of the mental load. How can you take on more responsibility?`,
      context: `Your partner is carrying most of the household mental load, which may be unsustainable long-term.`,
      followUp: [
        'Which areas are you most interested in taking ownership of?',
        'What would help you feel confident taking on new responsibilities?',
        'How can your partner help transition responsibilities to you?'
      ]
    });
  }

  // 2. Category-specific imbalances
  const categoryAnalysis = calculateCategoryAnalysis(taskResponses, taskLookup);
  
  Object.entries(categoryAnalysis).forEach(([category, data]) => {
    if (data.myPercentage > 80 && data.taskCount > 1) {
      const categoryName = category.toLowerCase().replace('_', ' ');
      prompts.push({
        id: `category-${category.toLowerCase()}`,
        category: 'workload',
        priority: 'medium',
        title: `${category} Concentration`,
        question: `You handle most ${categoryName} tasks. Would you like to share some of this responsibility?`,
        context: `You're doing ${data.myPercentage}% of ${categoryName} work, which includes tasks like planning ahead, noticing needs, and making decisions.`,
        followUp: [
          `Which ${categoryName} tasks feel most draining?`,
          `How could your partner help with ${categoryName}?`,
          `What would need to happen for your partner to take ownership of some ${categoryName} tasks?`
        ]
      });
    }
  });

  // 3. Workload imbalances (for together mode)
  if (isTogetherMode && results.partnerMentalPercentage) {
    const mentalLoadGap = Math.abs(results.myMentalPercentage - results.partnerMentalPercentage);
    const visibleLoadGap = Math.abs(results.myVisiblePercentage - (results.partnerVisiblePercentage || 0));
    
    if (mentalLoadGap > 20) {
      prompts.push({
        id: 'mental-load-imbalance',
        category: 'workload',
        priority: 'high',
        title: 'Mental Load Imbalance',
        question: `There's a significant mental load imbalance. How does this feel for both of you?`,
        context: `One person is carrying ${Math.max(results.myMentalPercentage, results.partnerMentalPercentage)}% of the mental load while the other carries ${Math.min(results.myMentalPercentage, results.partnerMentalPercentage)}%.`,
        followUp: [
          'Which mental tasks feel most overwhelming?',
          'How could we redistribute some of the mental load?',
          'What systems could help reduce the total mental burden?'
        ]
      });
    }

    if (visibleLoadGap > 25) {
      prompts.push({
        id: 'visible-work-imbalance',
        category: 'workload',
        priority: 'medium',
        title: 'Visible Work Imbalance',
        question: `There's a significant imbalance in visible work. How could this be redistributed?`,
        context: `One person is doing ${Math.max(results.myVisiblePercentage, results.partnerVisiblePercentage || 0)}% of the visible household work.`,
        followUp: [
          'Which visible tasks could be shared or redistributed?',
          'Are there tasks one person prefers doing?',
          'How could we make the distribution feel more fair?'
        ]
      });
    }
  }

  // 4. Time discrepancies
  const timeDiscrepancies = findTimeDiscrepancies(taskResponses, taskLookup);
  if (timeDiscrepancies.length > 0) {
    prompts.push({
      id: 'time-discrepancies',
      category: 'planning',
      priority: 'medium',
      title: 'Tasks Taking Different Time Than Expected',
      question: `Some tasks are taking much more or less time than research suggests. Should we adjust how we approach these?`,
      context: `Tasks like ${timeDiscrepancies.slice(0, 2).join(', ')} are taking significantly different time than typical estimates.`,
      followUp: [
        'Are we doing these tasks differently than most people?',
        'Could we make these tasks more efficient?',
        'Should we time ourselves to get a better sense of actual duration?'
      ]
    });
  }

  // 5. Emotional check-in
  prompts.push({
    id: 'emotional-checkin',
    category: 'emotion',
    priority: 'medium',
    title: 'How This Feels',
    question: `Beyond the numbers, how do you feel about the current household responsibility distribution?`,
    context: `It's important to discuss not just what gets done, but how the current arrangement affects both of you emotionally.`,
    followUp: [
      'What aspects of household management do you actually enjoy?',
      'What feels unfair or frustrating?',
      'How does the mental load affect your energy for other things?'
    ]
  });

  // 6. Future planning
  prompts.push({
    id: 'future-planning',
    category: 'planning',
    priority: 'low',
    title: 'Looking Ahead',
    question: `How do you want to handle household responsibilities as life changes (new jobs, kids, aging, etc.)?`,
    context: `Mental load distribution often needs to be revisited as circumstances change.`,
    followUp: [
      'What upcoming changes might affect household management?',
      'How often should we check in about this balance?',
      'What would you want to change if you had unlimited time/money?'
    ]
  });

  return prompts;
};

const calculateCategoryAnalysis = (taskResponses: TaskResponse[], taskLookup: Record<string, any>) => {
  const categories = Object.values(TASK_CATEGORIES);
  const analysis: Record<string, {
    myMentalLoad: number;
    partnerMentalLoad: number;
    myPercentage: number;
    taskCount: number;
  }> = {};

  categories.forEach(category => {
    let myLoad = 0;
    let partnerLoad = 0;
    let taskCount = 0;

    taskResponses.forEach(response => {
      const task = taskLookup[response.taskId];
      if (!task || task.category !== category || response.notApplicable) return;

      taskCount++;
      const timeInMinutes = getEffectiveTaskTime(response, task.baseline_minutes_week);
      const mentalLoadWeight = task.mental_load_weight;

      if (response.assignment === 'me') {
        const sharePercent = (response.mySharePercentage || 100) / 100;
        myLoad += timeInMinutes * mentalLoadWeight * sharePercent;
        partnerLoad += timeInMinutes * mentalLoadWeight * (1 - sharePercent);
      } else if (response.assignment === 'partner') {
        const sharePercent = (response.mySharePercentage || 0) / 100;
        myLoad += timeInMinutes * mentalLoadWeight * sharePercent;
        partnerLoad += timeInMinutes * mentalLoadWeight * (1 - sharePercent);
      } else if (response.assignment === 'shared') {
        const mySharePercent = 0.5;
        myLoad += timeInMinutes * mentalLoadWeight * mySharePercent;
        partnerLoad += timeInMinutes * mentalLoadWeight * (1 - mySharePercent);
      }
    });

    const totalLoad = myLoad + partnerLoad;
    analysis[category] = {
      myMentalLoad: Math.round(myLoad),
      partnerMentalLoad: Math.round(partnerLoad),
      myPercentage: totalLoad > 0 ? Math.round((myLoad / totalLoad) * 100) : 0,
      taskCount
    };
  });

  return analysis;
};

const findTimeDiscrepancies = (taskResponses: TaskResponse[], taskLookup: Record<string, any>) => {
  const discrepancies: string[] = [];
  
  taskResponses.forEach(response => {
    const task = taskLookup[response.taskId];
    if (!task || response.notApplicable) return;
    
    if (response.timeAdjustment === 'much_more' || response.timeAdjustment === 'much_less') {
      discrepancies.push(task.task_name);
    }
  });
  
  return discrepancies;
};