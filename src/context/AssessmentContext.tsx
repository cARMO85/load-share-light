import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AssessmentData, HouseholdSetup, TaskResponse, PerceptionGapResponse, EmotionalImpactResponse } from '@/types/assessment';

interface InsightEntry {
  id: string;
  type: 'breakthrough' | 'disagreement' | 'surprise';
  taskId?: string;
  taskName?: string;
  description: string;
  timestamp: Date;
  starred?: boolean;
  followUpAction?: string;
}

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

interface ActionItem {
  id: string;
  title: string;
  description: string;
  owner: 'me' | 'partner' | 'both';
  timeline: 'immediate' | 'week' | 'month' | 'ongoing';
  category: 'redistribute' | 'system' | 'conversation' | 'experiment';
  completed?: boolean;
  createdAt: Date;
}

interface AssessmentState extends AssessmentData {
  insights: InsightEntry[];
  discussionPrompts: ConversationPrompt[];
  actionPlan: ActionItem[];
}

type AssessmentAction = 
  | { type: 'SET_HOUSEHOLD_SETUP'; payload: HouseholdSetup }
  | { type: 'SET_TASK_RESPONSE'; payload: TaskResponse }
  | { type: 'SET_PARTNER_TASK_RESPONSE'; payload: TaskResponse }
  | { type: 'SET_PERCEPTION_GAP_RESPONSES'; payload: PerceptionGapResponse }
  | { type: 'SET_PARTNER_PERCEPTION_GAP_RESPONSES'; payload: PerceptionGapResponse }
  | { type: 'SET_EMOTIONAL_IMPACT_RESPONSES'; payload: EmotionalImpactResponse }
  | { type: 'SET_PARTNER_EMOTIONAL_IMPACT_RESPONSES'; payload: EmotionalImpactResponse }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_CURRENT_RESPONDER'; payload: 'me' | 'partner' }
  | { type: 'ADD_INSIGHT'; payload: InsightEntry }
  | { type: 'UPDATE_INSIGHT'; payload: InsightEntry }
  | { type: 'DELETE_INSIGHT'; payload: string }
  | { type: 'SET_DISCUSSION_PROMPTS'; payload: ConversationPrompt[] }
  | { type: 'UPDATE_DISCUSSION_PROMPT'; payload: { promptId: string; notes: string } }
  | { type: 'SET_ACTION_PLAN'; payload: ActionItem[] }
  | { type: 'RESET_ASSESSMENT' };

const initialState: AssessmentState = {
  householdSetup: {
    householdType: 'single' as const,
    assessmentMode: 'solo' as const,
    adults: 1,
    children: 0,
    hasPets: false,
    hasGarden: false,
    gardenSize: undefined,
    isEmployed: false
  },
  taskResponses: [],
  partnerTaskResponses: [],
  perceptionGapResponses: undefined,
  partnerPerceptionGapResponses: undefined,
  emotionalImpactResponses: undefined,
  partnerEmotionalImpactResponses: undefined,
  currentStep: 1,
  currentResponder: 'me',
  insights: [],
  discussionPrompts: [],
  actionPlan: []
};

const assessmentReducer = (state: AssessmentState, action: AssessmentAction): AssessmentState => {
  switch (action.type) {
    case 'SET_HOUSEHOLD_SETUP':
      return { ...state, householdSetup: action.payload };
    case 'SET_TASK_RESPONSE':
      const existingIndex = state.taskResponses.findIndex(r => r.taskId === action.payload.taskId);
      const newResponses = [...state.taskResponses];
      if (existingIndex >= 0) {
        newResponses[existingIndex] = action.payload;
      } else {
        newResponses.push(action.payload);
      }
      return { ...state, taskResponses: newResponses };
    case 'SET_PARTNER_TASK_RESPONSE':
      const existingPartnerIndex = (state.partnerTaskResponses || []).findIndex(r => r.taskId === action.payload.taskId);
      const newPartnerResponses = [...(state.partnerTaskResponses || [])];
      if (existingPartnerIndex >= 0) {
        newPartnerResponses[existingPartnerIndex] = action.payload;
      } else {
        newPartnerResponses.push(action.payload);
      }
      return { ...state, partnerTaskResponses: newPartnerResponses };
    case 'SET_PERCEPTION_GAP_RESPONSES':
      return { ...state, perceptionGapResponses: action.payload };
    case 'SET_PARTNER_PERCEPTION_GAP_RESPONSES':
      return { ...state, partnerPerceptionGapResponses: action.payload };
    case 'SET_EMOTIONAL_IMPACT_RESPONSES':
      return { ...state, emotionalImpactResponses: action.payload };
    case 'SET_PARTNER_EMOTIONAL_IMPACT_RESPONSES':
      return { ...state, partnerEmotionalImpactResponses: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_CURRENT_RESPONDER':
      return { ...state, currentResponder: action.payload };
    case 'ADD_INSIGHT':
      return { ...state, insights: [...state.insights, action.payload] };
    case 'UPDATE_INSIGHT':
      return { 
        ...state, 
        insights: state.insights.map(insight => 
          insight.id === action.payload.id ? action.payload : insight
        ) 
      };
    case 'DELETE_INSIGHT':
      return { 
        ...state, 
        insights: state.insights.filter(insight => insight.id !== action.payload) 
      };
    case 'SET_DISCUSSION_PROMPTS':
      return { ...state, discussionPrompts: action.payload };
    case 'UPDATE_DISCUSSION_PROMPT':
      return {
        ...state,
        discussionPrompts: state.discussionPrompts.map(prompt =>
          prompt.id === action.payload.promptId 
            ? { ...prompt, discussed: true, notes: action.payload.notes }
            : prompt
        )
      };
    case 'SET_ACTION_PLAN':
      return { ...state, actionPlan: action.payload };
    case 'RESET_ASSESSMENT':
      return initialState;
    default:
      return state;
  }
};

interface AssessmentContextType {
  state: AssessmentState;
  dispatch: React.Dispatch<AssessmentAction>;
  setHouseholdSetup: (setup: HouseholdSetup) => void;
  setTaskResponse: (response: TaskResponse) => void;
  setPartnerTaskResponse: (response: TaskResponse) => void;
  setPerceptionGapResponses: (responses: PerceptionGapResponse) => void;
  setPartnerPerceptionGapResponses: (responses: PerceptionGapResponse) => void;
  setEmotionalImpactResponses: (responses: EmotionalImpactResponse) => void;
  setPartnerEmotionalImpactResponses: (responses: EmotionalImpactResponse) => void;
  setCurrentStep: (step: number) => void;
  setCurrentResponder: (responder: 'me' | 'partner') => void;
  addInsight: (insight: InsightEntry) => void;
  updateInsight: (insight: InsightEntry) => void;
  deleteInsight: (insightId: string) => void;
  setDiscussionPrompts: (prompts: ConversationPrompt[]) => void;
  updateDiscussionPrompt: (promptId: string, notes: string) => void;
  setActionPlan: (actions: ActionItem[]) => void;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  const setHouseholdSetup = (setup: HouseholdSetup) => {
    dispatch({ type: 'SET_HOUSEHOLD_SETUP', payload: setup });
  };

  const setTaskResponse = (response: TaskResponse) => {
    dispatch({ type: 'SET_TASK_RESPONSE', payload: response });
  };

  const setPartnerTaskResponse = (response: TaskResponse) => {
    dispatch({ type: 'SET_PARTNER_TASK_RESPONSE', payload: response });
  };

  const setPerceptionGapResponses = (responses: PerceptionGapResponse) => {
    dispatch({ type: 'SET_PERCEPTION_GAP_RESPONSES', payload: responses });
  };

  const setPartnerPerceptionGapResponses = (responses: PerceptionGapResponse) => {
    dispatch({ type: 'SET_PARTNER_PERCEPTION_GAP_RESPONSES', payload: responses });
  };

  const setEmotionalImpactResponses = (responses: EmotionalImpactResponse) => {
    dispatch({ type: 'SET_EMOTIONAL_IMPACT_RESPONSES', payload: responses });
  };

  const setPartnerEmotionalImpactResponses = (responses: EmotionalImpactResponse) => {
    dispatch({ type: 'SET_PARTNER_EMOTIONAL_IMPACT_RESPONSES', payload: responses });
  };

  const setCurrentStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const setCurrentResponder = (responder: 'me' | 'partner') => {
    dispatch({ type: 'SET_CURRENT_RESPONDER', payload: responder });
  };

  const addInsight = (insight: InsightEntry) => {
    dispatch({ type: 'ADD_INSIGHT', payload: insight });
  };

  const updateInsight = (updatedInsight: InsightEntry) => {
    dispatch({ type: 'UPDATE_INSIGHT', payload: updatedInsight });
  };

  const deleteInsight = (insightId: string) => {
    dispatch({ type: 'DELETE_INSIGHT', payload: insightId });
  };

  const setDiscussionPrompts = (prompts: ConversationPrompt[]) => {
    dispatch({ type: 'SET_DISCUSSION_PROMPTS', payload: prompts });
  };

  const updateDiscussionPrompt = (promptId: string, notes: string) => {
    dispatch({ type: 'UPDATE_DISCUSSION_PROMPT', payload: { promptId, notes } });
  };

  const setActionPlan = (actions: ActionItem[]) => {
    dispatch({ type: 'SET_ACTION_PLAN', payload: actions });
  };

  const resetAssessment = () => {
    dispatch({ type: 'RESET_ASSESSMENT' });
  };

  return (
    <AssessmentContext.Provider value={{
      state,
      dispatch,
      setHouseholdSetup,
      setTaskResponse,
      setPartnerTaskResponse,
      setPerceptionGapResponses,
      setPartnerPerceptionGapResponses,
      setEmotionalImpactResponses,
      setPartnerEmotionalImpactResponses,
      setCurrentStep,
      setCurrentResponder,
      addInsight,
      updateInsight,
      deleteInsight,
      setDiscussionPrompts,
      updateDiscussionPrompt,
      setActionPlan,
      resetAssessment
    }}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};