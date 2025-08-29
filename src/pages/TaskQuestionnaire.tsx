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
import { allTasks, ALL_CATEGORIES, isPhysicalTask, isCognitiveTask, allTaskLookup } from '@/data/allTasks';
import { TaskResponse, TimeAdjustment, LikertRating } from '@/types/assessment';
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

  // Organize tasks by category and filter by conditions
  const tasksByCategory = useMemo(() => {
    const filtered = allTasks.filter(task => {
      const { householdType, adults, children, isEmployed } = state.householdSetup;
      
      return task.condition_trigger.some(condition => {
        switch (condition) {
          case 'all':
            return true;
          case 'has_children':
            return children > 0;
          case 'two_adults':
            return adults >= 2;
          case 'is_employed':
            return isEmployed;
          default:
            return false;
        }
      });
    });

    const grouped = filtered.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, typeof allTasks>);

    return grouped;
  }, [state.householdSetup]);

  const categoryData = [
    // Physical task categories
    { 
      id: ALL_CATEGORIES.COOKING, 
      label: "Cooking & Food Prep", 
      icon: Calendar,
      description: "Preparing meals and food-related tasks",
      type: 'physical' as const
    },
    { 
      id: ALL_CATEGORIES.CLEANING, 
      label: "Cleaning & Housework", 
      icon: Eye,
      description: "Maintaining cleanliness and household spaces",
      type: 'physical' as const
    },
    { 
      id: ALL_CATEGORIES.LAUNDRY, 
      label: "Laundry", 
      icon: Brain,
      description: "Washing, drying, and managing clothing",
      type: 'physical' as const
    },
    { 
      id: ALL_CATEGORIES.CHILDCARE_BASIC, 
      label: "Basic Childcare", 
      icon: Heart,
      description: "Physical care and basic needs of children",
      type: 'physical' as const
    },
    { 
      id: ALL_CATEGORIES.CHILDCARE_EDUCATIONAL, 
      label: "Educational Childcare", 
      icon: Lightbulb,
      description: "Learning activities and educational support",
      type: 'physical' as const
    },
    { 
      id: ALL_CATEGORIES.SHOPPING, 
      label: "Shopping", 
      icon: BarChart3,
      description: "Purchasing household items and groceries",
      type: 'physical' as const
    },
    { 
      id: ALL_CATEGORIES.TRAVEL, 
      label: "Family Travel", 
      icon: UserCheck,
      description: "Transportation for family activities",
      type: 'physical' as const
    },
    // Cognitive task categories
    { 
      id: ALL_CATEGORIES.ANTICIPATION, 
      label: "Anticipation", 
      icon: Calendar,
      description: "Planning ahead and thinking about what needs to happen",
      type: 'cognitive' as const
    },
    { 
      id: ALL_CATEGORIES.IDENTIFICATION, 
      label: "Identification", 
      icon: Eye,
      description: "Noticing what needs attention or action",
      type: 'cognitive' as const
    },
    { 
      id: ALL_CATEGORIES['Decision-making'], 
      label: "Decision-making", 
      icon: Brain,
      description: "Making choices about household matters",
      type: 'cognitive' as const
    },
    { 
      id: ALL_CATEGORIES.MONITORING, 
      label: "Monitoring", 
      icon: BarChart3,
      description: "Keeping track of progress and following up",
      type: 'cognitive' as const
    },
    { 
      id: ALL_CATEGORIES['Emotional Labour'], 
      label: "Emotional Labour", 
      icon: Heart,
      description: "Managing emotions and relationships within the home",
      type: 'cognitive' as const
    }
  ].filter(category => tasksByCategory[category.id]?.length > 0);

  const currentCategory = categoryData[currentCategoryIndex];
  const currentCategoryTasks = currentCategory ? tasksByCategory[currentCategory.id] || [] : [];

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Perspectives", description: "Share your views" },
    { title: "Impact", description: "Emotional insights" },
    { title: "Results", description: "View calculations" },
    { title: "Visualize", description: "Charts & insights" }
  ];

  const updateResponse = (taskId: string, updates: Partial<TaskResponse>) => {
    const task = allTaskLookup[taskId];
    if (!task) return;

    const currentResponse = responses[taskId];
    const isPhysical = isPhysicalTask(task);
    
    const newResponse: TaskResponse = {
      ...currentResponse,
      taskId,
      assignment: currentResponse?.assignment || 'me',
      measurementType: isPhysical ? 'time' : 'likert',
      ...updates
    };

    // Handle time-based tasks
    if (isPhysical && updates.timeAdjustment) {
      newResponse.timeAdjustment = updates.timeAdjustment;
      newResponse.estimatedMinutes = calculateAdjustedTime(task.baseline_minutes_week, updates.timeAdjustment);
      newResponse.frequency = task.default_frequency;
    }

    setResponses(prev => ({ ...prev, [taskId]: newResponse }));
    setTaskResponse(newResponse);
  };

  const updateLikertRating = (taskId: string, field: keyof LikertRating, value: number) => {
    const currentResponse = responses[taskId];
    const currentLikert = currentResponse?.likertRating || { burden: 3, fairness: 3 };
    
    const newLikert = { ...currentLikert, [field]: value };
    updateResponse(taskId, { likertRating: newLikert });
  };

  const handleNext = () => {
    const isLastCategory = currentCategoryIndex >= categoryData.length - 1;
    
    if (!isLastCategory) {
      setCurrentCategoryIndex(prev => prev + 1);
      return;
    }
    
    if (isTogetherMode && !showInsightCapture) {
      setShowInsightCapture(true);
      return;
    }
    
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

  const handleInsightContinue = () => {
    insights.forEach(insight => addInsight(insight));
    
    if (isTogetherMode) {
      setCurrentStep(3);
      navigate('/perception-gap');
    } else {
      setCurrentStep(4);
      navigate('/emotional-impact');
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentCategoryIndex]);

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
          <p className="text-muted-foreground mb-4">
            {isTogetherMode ? "Discuss and assign each task" : "Assign household tasks"}
          </p>
        </div>
          
        {/* Category Header */}
        {currentCategory && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={theme.accentColor}>
                <currentCategory.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {currentCategory.label}
              </h2>
              <InfoButton 
                variant="tooltip" 
                tooltipContent={`${currentCategory.description}. ${currentCategory.type === 'cognitive' ? 'Measured with burden and fairness ratings.' : 'Measured in time based on UK 2024 Time Use Survey.'}`}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Category {currentCategoryIndex + 1} of {categoryData.length} 
              • {completedTasks} of {applicableTasks.length} tasks completed
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {currentCategoryTasks.map((task) => {
            const response = responses[task.id];
            const showSlider = (response?.assignment === 'me' || response?.assignment === 'partner') && !response?.notApplicable;
            const isNotApplicable = response?.notApplicable;
            const taskInsights = insights.filter(insight => insight.taskId === task.id);
            const isPhysical = isPhysicalTask(task);
            const isCognitive = isCognitiveTask(task);
            
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
                        {isPhysical ? <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" /> : <Brain className="h-4 w-4 text-purple-500 flex-shrink-0" />}
                        <span className="leading-tight">{task.task_name}</span>
                        {isNotApplicable && <span className="text-muted-foreground text-sm">(Skipped)</span>}
                      </CardTitle>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      {isPhysical && (
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Research baseline: {formatTimeDisplay(task.baseline_minutes_week)}/week</span>
                          {response?.timeAdjustment && (
                            <span className="font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded">
                              Current: {getTimeAdjustmentShortLabel(response.timeAdjustment)} 
                              ({formatTimeDisplay(calculateAdjustedTime(task.baseline_minutes_week, response.timeAdjustment))}/week)
                            </span>
                          )}
                        </div>
                      )}
                      {isCognitive && (
                        <div className="flex items-center gap-2 text-xs">
                          <Brain className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Cognitive/emotional task - rated by burden and fairness</span>
                        </div>
                      )}
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

                      {/* Time Adjustment for Physical Tasks */}
                      {isPhysical && response?.assignment && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            How long does this take you compared to research baseline?
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
                        </div>
                      )}

                      {/* Likert Rating for Cognitive Tasks */}
                      {isCognitive && response?.assignment && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">How burdensome is this task? (1 = Very Easy, 5 = Very Difficult)</Label>
                            <Slider
                              value={[response?.likertRating?.burden || 3]}
                              onValueChange={([value]) => updateLikertRating(task.id, 'burden', value)}
                              min={1}
                              max={5}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Very Easy (1)</span>
                              <span>Moderate (3)</span>
                              <span>Very Difficult (5)</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">How fairly acknowledged is this work? (1 = Not Acknowledged, 5 = Fully Acknowledged)</Label>
                            <Slider
                              value={[response?.likertRating?.fairness || 3]}
                              onValueChange={([value]) => updateLikertRating(task.id, 'fairness', value)}
                              min={1}
                              max={5}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Not Acknowledged (1)</span>
                              <span>Somewhat (3)</span>
                              <span>Fully Acknowledged (5)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Per-task Insight Capture */}
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
            {currentCategoryIndex >= categoryData.length - 1 ? (
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