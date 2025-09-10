import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AssessmentData, HouseholdSetup, TaskResponse } from '@/types/assessment';

interface AssessmentState extends AssessmentData {
  discussionNotes?: Record<string, string>;
}

type AssessmentAction = 
  | { type: 'SET_HOUSEHOLD_SETUP'; payload: HouseholdSetup }
  | { type: 'SET_TASK_RESPONSE'; payload: TaskResponse }
  | { type: 'SET_PARTNER_TASK_RESPONSE'; payload: TaskResponse }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_CURRENT_RESPONDER'; payload: 'me' | 'partner' }
  | { type: 'ADD_DISCUSSION_NOTE'; payload: { taskId: string; note: string } }
  | { type: 'RESET_ASSESSMENT' };

const initialState: AssessmentState = {
  householdSetup: {
    householdType: 'single' as const,
    assessmentMode: 'solo' as const,
    adults: 1,
    children: 0,
    isEmployed: false
  },
  taskResponses: [],
  partnerTaskResponses: [],
  currentStep: 1,
  currentResponder: 'me',
  discussionNotes: {}
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
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_CURRENT_RESPONDER':
      return { ...state, currentResponder: action.payload };
    case 'ADD_DISCUSSION_NOTE':
      return { 
        ...state, 
        discussionNotes: { 
          ...state.discussionNotes, 
          [action.payload.taskId]: action.payload.note 
        } 
      };
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
  setCurrentStep: (step: number) => void;
  setCurrentResponder: (responder: 'me' | 'partner') => void;
  addDiscussionNote: (taskId: string, note: string) => void;
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



  const setCurrentStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const setCurrentResponder = (responder: 'me' | 'partner') => {
    dispatch({ type: 'SET_CURRENT_RESPONDER', payload: responder });
  };

  const addDiscussionNote = (taskId: string, note: string) => {
    dispatch({ type: 'ADD_DISCUSSION_NOTE', payload: { taskId, note } });
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
      setCurrentStep,
      setCurrentResponder,
      addDiscussionNote,
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