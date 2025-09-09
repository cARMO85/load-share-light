import { CalculatedResults, AssessmentData } from '@/types/assessment';

export interface ConversationPrompt {
  id: string;
  category: 'invisible_work' | 'imbalance' | 'emotion' | 'negotiation' | 'systems';
  priority: 'critical' | 'important' | 'helpful';
  title: string;
  question: string;
  context: string;
  followUp?: string[];
  discussionStarters: string[];
  sharedVocabulary?: string[];
  actionPrompts?: string[];
}

export interface DialogueSession {
  prompts: ConversationPrompt[];
  insights: string[];
  agreements: string[];
  nextSteps: string[];
}

// Generate contextual conversation prompts based on results
export const generateConversationPrompts = (
  results: CalculatedResults,
  assessmentData: AssessmentData
): ConversationPrompt[] => {
  const prompts: ConversationPrompt[] = [];
  const isTogetherMode = assessmentData.householdSetup.assessmentMode === 'together';
  
  // Critical: Major imbalances in mental load
  if (results.myMentalPercentage > 70 || (results.partnerMentalPercentage && results.partnerMentalPercentage > 70)) {
    prompts.push({
      id: 'mental_load_imbalance',
      category: 'invisible_work',
      priority: 'critical',
      title: 'The Invisible Mental Load',
      question: 'One person is carrying most of the mental load. How does this feel for both of you?',
      context: 'Mental load includes planning, remembering, monitoring, and emotional labour - the invisible work that keeps households running.',
      discussionStarters: [
        'When you think about all the things you need to remember for our household, how does that feel?',
        'What would happen if the person doing most of the mental planning stopped for a week?',
        'Which mental tasks feel most draining? Which feel most important?'
      ],
      sharedVocabulary: [
        'Mental Load: The cognitive work of planning, remembering, and managing household needs',
        'Anticipation Work: Thinking ahead about what needs to be done',
        'Emotional Labour: Managing feelings and relationships within the household'
      ],
      actionPrompts: [
        'What\'s one mental task that could be fully transferred to the other person?',
        'How could we create systems so less mental tracking is needed?'
      ]
    });
  }

  // Important: Workload imbalances in together mode
  if (isTogetherMode && results.partnerMentalPercentage) {
    const mentalLoadGap = Math.abs(results.myMentalPercentage - results.partnerMentalPercentage);
    const visibleLoadGap = Math.abs(results.myVisiblePercentage - (results.partnerVisiblePercentage || 0));
    const hasSignificantGaps = visibleLoadGap > 20 || mentalLoadGap > 20;
    
    if (hasSignificantGaps) {
      prompts.push({
        id: 'workload_imbalance',
        category: 'imbalance',
        priority: 'important',
        title: 'Significant Workload Imbalance',
        question: 'There\'s a significant imbalance in how work is distributed. How does this feel for both of you?',
        context: 'When workload is significantly unbalanced, it often reveals opportunities for better distribution and support.',
        discussionStarters: [
          'How does the current distribution feel for each of you?',
          'What would need to change for this to feel more balanced?',
          'Which tasks could be redistributed or shared differently?'
        ],
        sharedVocabulary: [
          'Invisible Work: Tasks that are done but not easily noticed by others',
          'Cognitive Labour: The mental effort of planning and organizing',
          'Perception Gap: When partners see workload distribution differently'
        ],
        actionPrompts: [
          'What\'s one high-burden task that could be redistributed?',
          'How could we better share the mental load of planning and organizing?'
        ]
      });
    }
  }

  // Systems and negotiation prompts
  prompts.push({
    id: 'fair_distribution',
    category: 'negotiation',
    priority: 'important',
    title: 'Defining Fairness Together',
    question: 'What would a fair distribution of household work look like for your relationship?',
    context: 'Fairness doesn\'t always mean equal - it means both people feel the arrangement works for them.',
    discussionStarters: [
      'What factors should we consider when dividing work? (time, preferences, skills, schedules)',
      'Which tasks do each of us actually enjoy or prefer doing?',
      'How do we want to handle tasks that neither of us likes?'
    ],
    sharedVocabulary: [
      'Fair vs Equal: Fair considers individual circumstances, equal means 50/50',
      'Task Ownership: One person takes full responsibility for planning and doing',
      'Task Sharing: Both people contribute, but coordination is needed'
    ],
    actionPrompts: [
      'What\'s one task that could be redistributed based on preferences?',
      'What systems could reduce the total amount of work needed?'
    ]
  });

  return prompts.sort((a, b) => {
    const priorityOrder = { critical: 0, important: 1, helpful: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

// Generate conversation report for export
export const generateConversationReport = (
  results: CalculatedResults,
  assessmentData: AssessmentData,
  insights: Array<{ type: string; description: string; taskName?: string }>,
  discussionNotes: Record<string, string>
): string => {
  const isTogetherMode = assessmentData.householdSetup.assessmentMode === 'together';
  const date = new Date().toLocaleDateString();
  
  return `# Household Work Discussion Report
Generated on ${date}

## Your Household Overview
- Assessment Mode: ${isTogetherMode ? 'Together' : 'Solo'}
- Household Type: ${assessmentData.householdSetup.householdType.replace('_', ' ')}

## Key Findings

### Visible Work Distribution
- Your visible work: ${results.myVisiblePercentage}%
${results.partnerVisiblePercentage ? `- Partner's visible work: ${results.partnerVisiblePercentage}%` : ''}

### Mental Load Distribution  
- Your mental load: ${results.myMentalPercentage}%
${results.partnerMentalPercentage ? `- Partner's mental load: ${results.partnerMentalPercentage}%` : ''}

${results.partnerMentalPercentage ? `
### Workload Balance Analysis
These imbalances can be conversation starters:
- Mental load difference: ${Math.abs(results.myMentalPercentage - results.partnerMentalPercentage)}% gap
- Visible work difference: ${Math.abs(results.myVisiblePercentage - (results.partnerVisiblePercentage || 0))}% gap
` : ''}

## Discussion Insights
${insights.length > 0 ? 
  insights.map(insight => `- **${insight.type}**: ${insight.description}${insight.taskName ? ` (${insight.taskName})` : ''}`).join('\n') :
  'No specific insights captured during assessment.'
}

## Conversation Notes
${Object.entries(discussionNotes).length > 0 ?
  Object.entries(discussionNotes).map(([key, note]) => `### ${key}\n${note}`).join('\n\n') :
  'No discussion notes recorded yet.'
}

## Ongoing Conversation Starters

### About Mental Load
- "When you think about all the planning and organizing for our household, what feels most overwhelming?"
- "What would happen if I stopped doing [specific mental task] for a week?"
- "How could we create systems so less mental tracking is needed?"

### About Fairness
- "What would 'fair' distribution look like, considering our different schedules and preferences?"
- "Which tasks do we each actually prefer or enjoy doing?"
- "What invisible work might we each be doing that the other doesn't see?"

### About Systems
- "What's one task we could completely eliminate or simplify?"
- "How could we reduce the mental load around [specific area]?"
- "What would help us both stay aware of household needs without one person tracking everything?"

---
*This report is designed to support ongoing conversations about household work. Revisit and update it regularly as your situation changes.*`;
};

// Shared vocabulary for mental load concepts
export const SHARED_VOCABULARY = {
  mentalLoad: {
    term: 'Mental Load',
    definition: 'The cognitive work of planning, remembering, monitoring, and managing household needs',
    examples: ['Remembering when bills are due', 'Planning meals for the week', 'Noticing when supplies are running low']
  },
  anticipationWork: {
    term: 'Anticipation Work',
    definition: 'Thinking ahead about what needs to be done and when',
    examples: ['Planning childcare for school holidays', 'Remembering to schedule appointments', 'Anticipating seasonal needs']
  },
  emotionalLabour: {
    term: 'Emotional Labour',
    definition: 'Managing feelings, relationships, and the emotional climate of the household',
    examples: ['Mediating family conflicts', 'Remembering important dates', 'Managing social obligations']
  },
  invisibleWork: {
    term: 'Invisible Work',
    definition: 'Tasks and mental work that are essential but often unnoticed by others',
    examples: ['Monitoring household supplies', 'Coordinating schedules', 'Maintaining family relationships']
  },
  cognitiveLabour: {
    term: 'Cognitive Labour',
    definition: 'The mental effort required to plan, organize, and coordinate household activities',
    examples: ['Creating shopping lists', 'Coordinating family schedules', 'Researching and making household decisions']
  }
};