import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { mentalLoadTasks, TASK_CATEGORIES } from '@/data/tasks';
import { TaskResponse, TimeAdjustment } from '@/types/assessment';
import { formatTimeDisplay, getFrequencyDisplayText } from '@/lib/timeUtils';
import { calculateAdjustedTime, getTimeAdjustmentShortLabel } from '@/lib/timeAdjustmentUtils';
import { CoupleInsightCapture } from '@/components/CoupleInsightCapture';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Brain, Users, X, UserCheck, Heart, Calendar, Eye, Lightbulb, BarChart3, HeartHandshake, TrendingUp, TrendingDown, Minus, MessageCircle, AlertTriangle } from 'lucide-react';
import { InfoButton } from '@/components/InfoButton';

interface InsightEntry {
  id: string;
  type: 'breakthrough' | 'disagreement' | 'surprise';
  taskId?: string;
  taskName?: string;
  description: string;
  timestamp: Date;
}

const TaskQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { state, setTaskResponse, setPartnerTaskResponse, setCurrentStep, setCurrentResponder, addInsight } = useAssessment();
  
  const isTogetherMode = state.householdSetup.assessmentMode === 'together';
  
  const [responses, setResponses] = useState<Record<string, TaskResponse>>(
    state.taskResponses.reduce((acc, response) => {
      acc[response.taskId] = response;
      return acc;
    }, {} as Record<string, TaskResponse>)
  );

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showInsightCapture, setShowInsightCapture] = useState(false);
  const [insights, setInsights] = useState<InsightEntry[]>([]);
  const [currentDiscussionTask, setCurrentDiscussionTask] = useState<{id: string; name: string} | null>(null);

  // DEV FEATURE: Prepopulate responses based on research showing women handle more household tasks
  const prepopulateResponses = () => {
    const allTasks = categorizedTasks.flatMap(cat => cat.tasks);
    const newResponses: Record<string, TaskResponse> = {};
    
    allTasks.forEach(task => {
      // Research shows women handle ~67% of household tasks, with higher mental load
      // High mental load tasks (anticipation, emotional labor) - mostly assigned to women
      if (task.category === TASK_CATEGORIES.ANTICIPATION || 
          task.category === TASK_CATEGORIES.EMOTIONAL_LABOUR ||
          task.mental_load_weight >= 1.3) {
        newResponses[task.id] = {
          taskId: task.id,
          assignment: 'me',
          mySharePercentage: Math.random() > 0.3 ? (Math.random() > 0.5 ? 80 : 90) : 100, // Mostly high percentages
          timeAdjustment: Math.random() > 0.7 ? 'more' : 'about_right', // Often takes more time
          estimatedMinutes: calculateAdjustedTime(task.baseline_minutes_week, Math.random() > 0.7 ? 'more' : 'about_right'),
          frequency: task.default_frequency,
          notApplicable: false
        };
      }
      // Medium tasks - shared but with higher female percentage
      else if (task.mental_load_weight >= 1.1) {
        newResponses[task.id] = {
          taskId: task.id,
          assignment: Math.random() > 0.6 ? 'me' : 'shared',
          mySharePercentage: Math.random() > 0.4 ? 70 : 60,
          timeAdjustment: 'about_right',
          estimatedMinutes: calculateAdjustedTime(task.baseline_minutes_week, 'about_right'),
          frequency: task.default_frequency,
          notApplicable: false
        };
      }
      // Lower mental load tasks - more likely to be shared or partner
      else {
        const rand = Math.random();
        newResponses[task.id] = {
          taskId: task.id,
          assignment: rand > 0.7 ? 'partner' : (rand > 0.4 ? 'shared' : 'me'),
          mySharePercentage: rand > 0.7 ? 20 : (rand > 0.4 ? 50 : 60),
          timeAdjustment: 'about_right',
          estimatedMinutes: calculateAdjustedTime(task.baseline_minutes_week, 'about_right'),
          frequency: task.default_frequency,
          notApplicable: Math.random() > 0.95 // 5% chance not applicable
        };
      }
    });
    
    setResponses(newResponses);
    // Update context with all responses
    Object.values(newResponses).forEach(response => {
      setTaskResponse(response);
    });
  };

  // Organize tasks by category
  const categorizedTasks = useMemo(() => {
    const { householdSetup } = state;
    
    const relevantTasks = mentalLoadTasks.filter(task => {
      return task.condition_trigger.some(condition => {
        switch (condition) {
          case 'all':
            return true;
          case 'two_adults':
            return householdSetup.adults === 2;
          case 'has_children':
            return householdSetup.children > 0;
          case 'has_pets':
            return householdSetup.hasPets;
          case 'has_garden':
            return householdSetup.hasGarden;
          case 'is_employed':
            return householdSetup.isEmployed || householdSetup.partnerEmployed;
          default:
            return false;
        }
      });
    });

    // Group tasks by category
    const categories = Object.values(TASK_CATEGORIES);
    return categories.map(category => ({
      name: category,
      tasks: relevantTasks.filter(task => task.category === category)
    })).filter(category => category.tasks.length > 0);
  }, [state.householdSetup]);

  const currentCategory = categorizedTasks[currentCategoryIndex];
  const currentCategoryTasks = currentCategory?.tasks || [];

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Perspectives", description: "Share your views" },
    { title: "Impact", description: "Emotional insights" },
    { title: "Results", description: "View calculations" },
    { title: "Visualize", description: "Charts & insights" }
  ];

  // Category information with icons and descriptions
  const categoryInfo = {
    [TASK_CATEGORIES.ANTICIPATION]: {
      icon: <Calendar className="h-5 w-5" />,
      description: "Planning ahead and thinking about future needs"
    },
    [TASK_CATEGORIES.IDENTIFICATION]: {
      icon: <Eye className="h-5 w-5" />,
      description: "Noticing what needs attention and when"
    },
    [TASK_CATEGORIES.DECISION_MAKING]: {
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Making choices and evaluating options"
    },
    [TASK_CATEGORIES.MONITORING]: {
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Keeping track of progress and ensuring completion"
    },
    [TASK_CATEGORIES.EMOTIONAL_LABOUR]: {
      icon: <HeartHandshake className="h-5 w-5" />,
      description: "Managing emotions and relationships"
    }
  };

  const updateResponse = (taskId: string, updates: Partial<TaskResponse>) => {
    const allTasks = categorizedTasks.flatMap(cat => cat.tasks);
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const currentResponse = responses[taskId];
    const timeAdjustment = updates.timeAdjustment || currentResponse?.timeAdjustment || 'about_right';
    
    const newResponse = {
      taskId,
      assignment: currentResponse?.assignment || 'me',
      timeAdjustment,
      estimatedMinutes: calculateAdjustedTime(task.baseline_minutes_week, timeAdjustment),
      frequency: task.default_frequency,
      notApplicable: false,
      ...updates
    } as TaskResponse;

    setResponses(prev => ({ ...prev, [taskId]: newResponse }));
    setTaskResponse(newResponse);
  };

  const handleNext = () => {
    const isLastCategory = currentCategoryIndex >= categorizedTasks.length - 1;
    
    if (!isLastCategory) {
      // Move to next category
      setCurrentCategoryIndex(prev => prev + 1);
      return;
    }
    
    // In together mode, show insight capture phase before continuing
    if (isTogetherMode && !showInsightCapture) {
      setShowInsightCapture(true);
      return;
    }
    
    // Continue to next phase
    if (isTogetherMode) {
      setCurrentStep(3);
      navigate('/perception-gap');
    } else {
      setCurrentStep(4);
      navigate('/emotional-impact');
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const [showInsightModal, setShowInsightModal] = useState(false);
  const [pendingInsightType, setPendingInsightType] = useState<'breakthrough' | 'disagreement' | 'surprise' | null>(null);
  const [insightDescription, setInsightDescription] = useState('');
  
  const handleInsightAdded = (insight: InsightEntry) => {
    setInsights(prev => [...prev, insight]);
    addInsight(insight);
    setShowInsightModal(false);
    setPendingInsightType(null);
    setInsightDescription('');
  };

  const handleQuickInsight = (type: 'breakthrough' | 'disagreement' | 'surprise', taskId: string, taskName: string) => {
    setPendingInsightType(type);
    setCurrentDiscussionTask({id: taskId, name: taskName});
    setShowInsightModal(true);
  };

  const handleInsightSave = () => {
    if (!insightDescription.trim() || !pendingInsightType || !currentDiscussionTask) return;
    
    const insight: InsightEntry = {
      id: `${Date.now()}-${pendingInsightType}`,
      type: pendingInsightType,
      taskId: currentDiscussionTask.id,
      taskName: currentDiscussionTask.name,
      description: insightDescription.trim(),
      timestamp: new Date()
    };
    
    handleInsightAdded(insight);
  };
  
  // Development helper to fill sample data
  const fillSampleData = (scenario: 'single' | 'couple' | 'family') => {
    const sampleAssignments = {
      single: ['me', 'me', 'shared', 'me'],
      couple: ['me', 'partner', 'shared', 'me', 'partner'], 
      family: ['me', 'partner', 'shared', 'me', 'shared']
    };
    
    const sampleTimeAdjustments: TimeAdjustment[] = ['much_less', 'less', 'about_right', 'more', 'much_more'];
    
    const newResponses: Record<string, TaskResponse> = {};
    
    categorizedTasks.forEach(category => {
      category.tasks.forEach((task, index) => {
        const assignments = sampleAssignments[scenario];
        const assignment = assignments[index % assignments.length] as 'me' | 'partner' | 'shared';
        const timeAdjustment = sampleTimeAdjustments[index % sampleTimeAdjustments.length];
        
        const response: TaskResponse = {
          taskId: task.id,
          assignment,
          timeAdjustment,
          estimatedMinutes: calculateAdjustedTime(task.baseline_minutes_week, timeAdjustment),
          frequency: task.default_frequency,
          notApplicable: Math.random() < 0.05, // 5% chance of not applicable
          mySharePercentage: assignment === 'me' ? 90 : assignment === 'partner' ? 10 : 50
        };
        
        newResponses[task.id] = response;
        setTaskResponse(response);
      });
    });
    
    setResponses(newResponses);
    
    // Add some sample insights if in together mode
    if (isTogetherMode) {
      const sampleInsights = [
        {
          id: 'insight-1',
          type: 'breakthrough' as const,
          taskId: categorizedTasks[0]?.tasks[0]?.id,
          taskName: categorizedTasks[0]?.tasks[0]?.task_name,
          description: "Wow, I never realized how much mental load meal planning actually involves!",
          timestamp: new Date()
        },
        {
          id: 'insight-2', 
          type: 'disagreement' as const,
          taskId: categorizedTasks[1]?.tasks[0]?.id,
          taskName: categorizedTasks[1]?.tasks[0]?.task_name,
          description: "We disagree on how long this takes - maybe we should time it next week",
          timestamp: new Date()
        }
      ];
      
      sampleInsights.forEach(insight => {
        if (insight.taskId) {
          setInsights(prev => [...prev, insight]);
          addInsight(insight);
        }
      });
    }
  };

  const handleInsightContinue = () => {
    // Store insights in context for later use in results
    insights.forEach(insight => addInsight(insight));
    
    // Continue to next phase
    if (isTogetherMode) {
      setCurrentStep(3);
      navigate('/perception-gap');
    } else {
      setCurrentStep(4);
      navigate('/emotional-impact');
    }
  };

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentCategoryIndex]);

  // Simplified theme - no more responder switching
  const theme = {
    gradientClass: 'from-background via-background to-primary/5',
    cardGradient: 'from-card to-primary/5', 
    headerIcon: <UserCheck className="h-6 w-6 text-primary" />,
    accentColor: 'text-primary',
    progressColor: 'primary'
  };

  const isSingleAdult = state.householdSetup.adults === 1;
  const applicableTasks = currentCategoryTasks.filter(task => !responses[task.id]?.notApplicable);
  const isCategoryComplete = applicableTasks.every(task => 
    responses[task.id]?.assignment || responses[task.id]?.notApplicable
  );
  const completedTasks = applicableTasks.filter(task => 
    responses[task.id]?.assignment && !responses[task.id]?.notApplicable
  ).length;

  // Overall progress across all categories
  const allTasks = categorizedTasks.flatMap(cat => cat.tasks);
  const allApplicableTasks = allTasks.filter(task => !responses[task.id]?.notApplicable);
  const totalCompletedTasks = allApplicableTasks.filter(task => 
    responses[task.id]?.assignment && !responses[task.id]?.notApplicable
  ).length;

  const getAssignmentLabels = () => {
    if (isSingleAdult) {
      return {
        me: "Me",
        shared: "Both of us", 
        partner: "My partner"
      };
    }
    return {
      me: "Me",
      shared: "Shared",
      partner: "Partner"
    };
  };

  const labels = getAssignmentLabels();

  // Show insight capture phase if in together mode and both partners completed tasks
  if (isTogetherMode && showInsightCapture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ProgressSteps currentStep={2} totalSteps={6} steps={steps} />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Compare & Discuss
              <div className="flex items-center justify-center gap-3 text-lg font-normal mt-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span className="text-primary">Capture Your Insights</span>
              </div>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Now that you've both completed the assessment, discuss your responses together. 
              This is where the real mental load conversation begins - capture breakthrough moments and disagreements.
            </p>
          </div>

          <CoupleInsightCapture
            onInsightAdded={handleInsightAdded}
            onContinue={handleInsightContinue}
            insights={insights}
            currentTask={null}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradientClass || 'from-background via-background to-primary/5'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={2} totalSteps={6} steps={steps} />
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Who Does What?
          </h1>
          <p className="text-muted-foreground">
            {isTogetherMode ? "Discuss and assign each task" : "Assign household tasks"}
          </p>
          
          {/* DEV FEATURE: Prepopulate button */}
          <div className="mt-4">
            <Button 
              onClick={prepopulateResponses}
              variant="outline" 
              size="sm"
              className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
            >
              🚧 DEV: Prepopulate (Women's Pattern)
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Research-based prepopulation reflecting typical gender patterns
            </p>
          </div>
        </div>
          
        {/* Category Header */}
        {currentCategory && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={theme.accentColor}>
                {categoryInfo[currentCategory.name]?.icon}
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {currentCategory.name}
              </h2>
              <InfoButton 
                variant="tooltip" 
                tooltipContent={`${categoryInfo[currentCategory.name]?.description}. Research shows these tasks often involve invisible cognitive work.`}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Category {currentCategoryIndex + 1} of {categorizedTasks.length} 
              • {completedTasks} of {applicableTasks.length} tasks completed
            </div>
          </div>
        )}

        {/* Minimal progress info */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            {completedTasks} of {applicableTasks.length} tasks done
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {currentCategoryTasks.map((task) => {
            const response = responses[task.id];
            const showSlider = (response?.assignment === 'me' || response?.assignment === 'partner') && !response?.notApplicable;
            const isNotApplicable = response?.notApplicable;
            const taskInsights = insights.filter(insight => insight.taskId === task.id);
            
            return (
              <Card key={task.id} className={`transition-all border-0 ${
                isNotApplicable 
                  ? 'opacity-60 bg-muted/30' 
                  : 'shadow-md hover:shadow-lg bg-gradient-to-br from-card/95 to-card/80'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="leading-tight">{task.task_name}</span>
                        {isNotApplicable && <span className="text-muted-foreground text-sm">(Skipped)</span>}
                      </CardTitle>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Research: {formatTimeDisplay(task.baseline_minutes_week)}/week</span>
                        <InfoButton 
                          variant="tooltip" 
                          tooltipContent={`Research Source: ${task.source}. Time range: ${task.time_range}. Mental load weight: ${task.mental_load_weight}x. This baseline comes from time-use studies and household labor research.`}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-0">
                  {!isNotApplicable ? (
                    <>
                      {/* Assignment Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Who does this?</Label>
                        <div className="grid grid-cols-3 gap-1">
                          <Button
                            variant={response?.assignment === 'me' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateResponse(task.id, { assignment: 'me', mySharePercentage: 100 })}
                            className="text-sm"
                          >
                            {labels.me}
                          </Button>
                          <Button
                            variant={response?.assignment === 'shared' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateResponse(task.id, { assignment: 'shared', mySharePercentage: 50 })}
                            className="text-sm"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Shared
                          </Button>
                          <Button
                            variant={response?.assignment === 'partner' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateResponse(task.id, { assignment: 'partner', mySharePercentage: 0 })}
                            className="text-sm"
                          >
                            {labels.partner}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateResponse(task.id, { notApplicable: true })}
                          className="w-full text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Not applicable
                        </Button>
                      </div>

                      {/* Share Percentage - Only for individual assignments */}
                      {showSlider && response?.assignment !== 'shared' && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Your share: {response?.mySharePercentage || (response?.assignment === 'me' ? 100 : 0)}%
                          </Label>
                          <Slider
                            value={[response?.mySharePercentage || (response?.assignment === 'me' ? 100 : 0)]}
                            onValueChange={([value]) => updateResponse(task.id, { mySharePercentage: value })}
                            min={0}
                            max={100}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Partner (0%)</span>
                            <span>Equal (50%)</span>
                            <span>Me (100%)</span>
                          </div>
                        </div>
                      )}

                       {/* Time Adjustment */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            How long does this take you?
                          </Label>
                         
                         <div className="grid grid-cols-5 gap-1">
                           {(['much_less', 'less', 'about_right', 'more', 'much_more'] as TimeAdjustment[]).map((adjustment) => (
                             <Button
                               key={adjustment}
                               variant={response?.timeAdjustment === adjustment ? 'default' : 'outline'}
                               size="sm"
                               onClick={() => updateResponse(task.id, { timeAdjustment: adjustment })}
                               className="text-xs px-1 py-1 h-auto flex flex-col gap-0.5"
                             >
                               {adjustment === 'much_less' && <TrendingDown className="h-3 w-3" />}
                               {adjustment === 'less' && <Minus className="h-3 w-3" />}
                               {adjustment === 'about_right' && <span className="h-3 w-3 rounded-full bg-current" />}
                               {adjustment === 'more' && <TrendingUp className="h-3 w-3" />}
                               {adjustment === 'much_more' && <TrendingUp className="h-3 w-3" />}
                               <span>{getTimeAdjustmentShortLabel(adjustment)}</span>
                             </Button>
                           ))}
                         </div>
                         
                          {response?.timeAdjustment && response.timeAdjustment !== 'about_right' && (
                            <div className="text-xs text-foreground bg-secondary/20 p-2 rounded">
                              <strong>Your time:</strong> {formatTimeDisplay(calculateAdjustedTime(task.baseline_minutes_week, response.timeAdjustment))} per week
                            </div>
                          )}
                        </div>

                      {/* Per-task Insight Capture for All Users */}
                      {response?.assignment && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              Notes
                            </Label>
                            {taskInsights.length > 0 && (
                              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded">
                                {taskInsights.length}
                              </span>
                            )}
                          </div>
                           
                           <div className="grid grid-cols-3 gap-1 mb-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleQuickInsight('breakthrough', task.id, task.task_name)}
                               className="text-xs h-7 flex items-center gap-1 hover:bg-primary/10"
                             >
                               <Lightbulb className="h-3 w-3" />
                               {isTogetherMode ? "Aha!" : "Insight"}
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleQuickInsight('disagreement', task.id, task.task_name)}
                               className="text-xs h-7 flex items-center gap-1 hover:bg-destructive/10"
                             >
                               <AlertTriangle className="h-3 w-3" />
                               {isTogetherMode ? "Disagree" : "Challenge"}
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleQuickInsight('surprise', task.id, task.task_name)}
                               className="text-xs h-7 flex items-center gap-1 hover:bg-secondary/10"
                             >
                               <Heart className="h-3 w-3" />
                               {isTogetherMode ? "Surprise" : "Surprise"}
                             </Button>
                           </div>

                          {/* Show existing insights for this task */}
                          {taskInsights.length > 0 && (
                            <div className="space-y-1">
                              {taskInsights.map((insight) => (
                                <div key={insight.id} className="text-xs bg-muted/50 p-2 rounded flex items-start gap-2">
                                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${
                                    insight.type === 'breakthrough' ? 'bg-primary' :
                                    insight.type === 'disagreement' ? 'bg-destructive' :
                                    'bg-secondary'
                                  }`} />
                                  <span className="flex-1 text-foreground">{insight.description || `${insight.type} noted`}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <X className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Not applicable to your household</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentCategoryIndex === 0}
            className="flex items-center gap-2"
          >
            Previous Category
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isCategoryComplete ? (
                <>✓ Category Complete ({completedTasks}/{applicableTasks.length} tasks)</>
              ) : (
                <>{completedTasks}/{applicableTasks.length} tasks completed</>
              )}
            </p>
          </div>
          
          <Button
            onClick={handleNext}
            disabled={!isCategoryComplete}
            className="flex items-center gap-2"
          >
            {currentCategoryIndex >= categorizedTasks.length - 1 ? (
              isTogetherMode ? "Compare & Discuss" : "Continue"
            ) : (
              "Next Category"
            )}
          </Button>
        </div>

        {/* Insight Modal */}
        <Dialog open={showInsightModal} onOpenChange={setShowInsightModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {pendingInsightType === 'breakthrough' && <Lightbulb className="h-5 w-5 text-primary" />}
                {pendingInsightType === 'disagreement' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                {pendingInsightType === 'surprise' && <Heart className="h-5 w-5 text-secondary" />}
                {pendingInsightType === 'breakthrough' && 'Breakthrough Moment'}
                {pendingInsightType === 'disagreement' && 'Disagreement to Resolve'}
                {pendingInsightType === 'surprise' && 'Surprising Discovery'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {currentDiscussionTask && (
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">About task:</div>
                  <div className="font-medium">{currentDiscussionTask.name}</div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-sm">What did you discover?</Label>
                <Textarea
                  value={insightDescription}
                  onChange={(e) => setInsightDescription(e.target.value)}
                  placeholder={
                    pendingInsightType === 'breakthrough' 
                      ? "e.g., 'I never realized how much mental load this actually involves...'"
                      : pendingInsightType === 'disagreement'
                      ? "e.g., 'We disagree on how much time this really takes - need to track it'"
                      : "e.g., 'Surprised that we both thought the other was handling this!'"
                  }
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInsightSave}
                  disabled={!insightDescription.trim()}
                  className="flex-1"
                >
                  Save Insight
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInsightModal(false);
                    setInsightDescription('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TaskQuestionnaire;