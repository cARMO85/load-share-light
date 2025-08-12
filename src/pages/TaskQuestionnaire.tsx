import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { mentalLoadTasks, TASK_CATEGORIES } from '@/data/tasks';
import { TaskResponse, TimeAdjustment } from '@/types/assessment';
import { formatTimeDisplay, getFrequencyDisplayText } from '@/lib/timeUtils';
import { calculateAdjustedTime, getTimeAdjustmentShortLabel } from '@/lib/timeAdjustmentUtils';
import { CoupleInsightCapture } from '@/components/CoupleInsightCapture';
import { Clock, Brain, Users, X, UserCheck, Heart, Calendar, Eye, Lightbulb, BarChart3, HeartHandshake, TrendingUp, TrendingDown, Minus, MessageCircle, AlertTriangle } from 'lucide-react';

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
  const currentResponder = state.currentResponder || 'me';
  const currentResponses = currentResponder === 'me' ? state.taskResponses : (state.partnerTaskResponses || []);
  
  const [responses, setResponses] = useState<Record<string, TaskResponse>>(
    currentResponses.reduce((acc, response) => {
      acc[response.taskId] = response;
      return acc;
    }, {} as Record<string, TaskResponse>)
  );

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showInsightCapture, setShowInsightCapture] = useState(false);
  const [insights, setInsights] = useState<InsightEntry[]>([]);
  const [currentDiscussionTask, setCurrentDiscussionTask] = useState<{id: string; name: string} | null>(null);

  // Scroll to top when switching to partner's turn
  useEffect(() => {
    if (isTogetherMode && currentResponder === 'partner') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentResponder, isTogetherMode]);

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
    if (currentResponder === 'me') {
      setTaskResponse(newResponse);
    } else {
      setPartnerTaskResponse(newResponse);
    }
  };

  const handleNext = () => {
    const isLastCategory = currentCategoryIndex >= categorizedTasks.length - 1;
    
    if (!isLastCategory) {
      // Move to next category
      setCurrentCategoryIndex(prev => prev + 1);
      return;
    }
    
    if (isTogetherMode && currentResponder === 'me') {
      // Switch to partner and reset category
      setCurrentResponder('partner');
      setCurrentCategoryIndex(0);
      setResponses({});
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

  const handleInsightAdded = (insight: InsightEntry) => {
    // If insight has no description, prompt for it
    if (!insight.description) {
      const description = prompt(`Add a note about this ${insight.type}:`);
      if (description && description.trim()) {
        insight.description = description.trim();
        setInsights(prev => [...prev, insight]);
        addInsight(insight);
      }
    } else {
      setInsights(prev => [...prev, insight]);
      addInsight(insight);
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
  }, [currentCategoryIndex, currentResponder]);

  // Dynamic styling based on current responder
  const getResponderTheme = () => {
    if (!isTogetherMode) return {};
    
    if (currentResponder === 'partner') {
      return {
        gradientClass: 'from-background via-background to-secondary/5',
        cardGradient: 'from-card to-secondary/5',
        headerIcon: <Heart className="h-6 w-6 text-secondary" />,
        accentColor: 'text-secondary',
        progressColor: 'secondary'
      };
    }
    
    return {
      gradientClass: 'from-background via-background to-primary/5',
      cardGradient: 'from-card to-primary/5', 
      headerIcon: <UserCheck className="h-6 w-6 text-primary" />,
      accentColor: 'text-primary',
      progressColor: 'primary'
    };
  };

  const theme = getResponderTheme();

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
            currentTask={currentDiscussionTask}
          />

          {/* Optional: Quick task reference for discussion */}
          <div className="mt-8">
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Task Reference for Discussion
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click on any task to set context for your insight capture
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categorizedTasks.flatMap(cat => cat.tasks).map(task => (
                    <Button
                      key={task.id}
                      variant={currentDiscussionTask?.id === task.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentDiscussionTask({id: task.id, name: task.task_name})}
                      className="justify-start text-left h-auto py-2 px-3"
                    >
                      <div className="truncate">
                        <div className="font-medium text-sm">{task.task_name}</div>
                        <div className="text-xs text-muted-foreground">{task.category}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradientClass || 'from-background via-background to-primary/5'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={2} totalSteps={6} steps={steps} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Mental Load Assessment
            {isTogetherMode && (
              <div className="flex items-center justify-center gap-3 text-lg font-normal mt-3">
                {theme.headerIcon}
                <span className={theme.accentColor}>
                  {currentResponder === 'me' ? "Your Turn" : "Partner's Turn"}
                </span>
              </div>
            )}
          </h1>
          
          {/* Category Header */}
          {currentCategory && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={theme.accentColor}>
                  {categoryInfo[currentCategory.name]?.icon}
                </div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {currentCategory.name}
                </h2>
              </div>
              <p className="text-muted-foreground text-lg mb-2">
                {categoryInfo[currentCategory.name]?.description}
              </p>
              <div className="text-sm text-muted-foreground">
                Category {currentCategoryIndex + 1} of {categorizedTasks.length} 
                • {completedTasks} of {applicableTasks.length} tasks completed
              </div>
            </div>
          )}

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            For each task, indicate who primarily handles it and how it compares to research-based time estimates.
          </p>
          {isSingleAdult && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
              Even if your partner isn't taking this assessment, you can still indicate their responsibilities.
            </p>
          )}
          {isTogetherMode && (
            <div className={`mt-4 p-4 rounded-lg border ${
              currentResponder === 'partner' 
                ? 'bg-secondary/10 border-secondary/20' 
                : 'bg-primary/10 border-primary/20'
            }`}>
              <p className={`text-sm ${theme.accentColor}`}>
                {currentResponder === 'me' 
                  ? "Answer based on your perspective. Your partner will answer next." 
                  : "Now let your partner answer the same questions from their perspective."}
              </p>
            </div>
          )}
          
          {/* Overall Progress Indicator */}
          <div className="mt-4 text-sm text-muted-foreground">
            Overall Progress: {totalCompletedTasks} of {allApplicableTasks.length} total tasks completed
          </div>
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
                      <CardTitle className="text-lg text-foreground flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="leading-tight">{task.task_name}</span>
                        {isNotApplicable && <span className="text-muted-foreground text-sm">(Skipped)</span>}
                      </CardTitle>
                       <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1">
                         <span>{task.category} • Mental load: {task.mental_load_weight}x</span>
                         <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md">
                           <Clock className="h-3 w-3" />
                           <span className="font-medium">Research baseline: {formatTimeDisplay(task.baseline_minutes_week)} per {getFrequencyDisplayText(task.default_frequency).toLowerCase()}</span>
                         </div>
                       </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-0">
                  {!isNotApplicable ? (
                    <>
                      {/* Assignment Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Who handles this?</Label>
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
                       <div className="space-y-3">
                         <Label className="text-sm font-medium flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           Does this take more or less time than research suggests?
                         </Label>
                         
                         <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-sm">
                           <div className="flex items-center gap-2 mb-1">
                             <Brain className="h-4 w-4 text-primary" />
                             <span className="font-medium text-foreground">Research baseline:</span>
                             <span className="text-primary font-bold">{formatTimeDisplay(task.baseline_minutes_week)} per week</span>
                           </div>
                           <p className="text-muted-foreground text-xs">
                             Source: {task.source} • Range: {task.time_range}
                           </p>
                         </div>
                         
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
                           <div className="text-xs text-foreground bg-secondary/20 p-2 rounded border border-secondary/30">
                             <strong>Your adjusted time:</strong> {formatTimeDisplay(calculateAdjustedTime(task.baseline_minutes_week, response.timeAdjustment))} per {getFrequencyDisplayText(task.default_frequency).toLowerCase()}
                           </div>
                         )}
                       </div>

                      {/* Per-task Insight Capture for Couples */}
                      {isTogetherMode && response?.assignment && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              Discussion notes
                            </Label>
                            {taskInsights.length > 0 && (
                              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded">
                                {taskInsights.length} note{taskInsights.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1 mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentDiscussionTask({id: task.id, name: task.task_name});
                                // Add a quick breakthrough
                                const insight: InsightEntry = {
                                  id: `${Date.now()}-breakthrough`,
                                  type: 'breakthrough',
                                  taskId: task.id,
                                  taskName: task.task_name,
                                  description: '', // Will be filled by user
                                  timestamp: new Date()
                                };
                                handleInsightAdded(insight);
                              }}
                              className="text-xs h-7 flex items-center gap-1"
                            >
                              <Lightbulb className="h-3 w-3" />
                              Aha!
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentDiscussionTask({id: task.id, name: task.task_name});
                                const insight: InsightEntry = {
                                  id: `${Date.now()}-disagreement`,
                                  type: 'disagreement',
                                  taskId: task.id,
                                  taskName: task.task_name,
                                  description: '', // Will be filled by user
                                  timestamp: new Date()
                                };
                                handleInsightAdded(insight);
                              }}
                              className="text-xs h-7 flex items-center gap-1"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              Disagree
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentDiscussionTask({id: task.id, name: task.task_name});
                                const insight: InsightEntry = {
                                  id: `${Date.now()}-surprise`,
                                  type: 'surprise',
                                  taskId: task.id,
                                  taskName: task.task_name,
                                  description: '', // Will be filled by user
                                  timestamp: new Date()
                                };
                                handleInsightAdded(insight);
                              }}
                              className="text-xs h-7 flex items-center gap-1"
                            >
                              <Heart className="h-3 w-3" />
                              Surprise
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
              isTogetherMode && currentResponder === 'me' ? 
                "Partner's Turn" : 
                isTogetherMode ? "Compare & Discuss" : "Continue"
            ) : (
              "Next Category"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskQuestionnaire;