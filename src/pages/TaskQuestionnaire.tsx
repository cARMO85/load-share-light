import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { allTasks, ALL_CATEGORIES, isPhysicalTask, isCognitiveTask, allTaskLookup } from '@/data/allTasks';
import { TaskResponse, LikertRating } from '@/types/assessment';
import { Clock, Brain, Users, UserCheck, Heart, Calendar, Eye, BarChart3 } from 'lucide-react';
import { InfoButton } from '@/components/InfoButton';
import { createDemoResponses, isDevelopment } from '@/lib/devUtils';

const TaskQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { state, setTaskResponse, setPartnerTaskResponse, setCurrentStep, setCurrentResponder } = useAssessment();
  
  const isTogetherMode = state.householdSetup.assessmentMode === 'together';
  
  const [responses, setResponses] = useState<Record<string, TaskResponse>>(
    state.taskResponses.reduce((acc, response) => {
      acc[response.taskId] = response;
      return acc;
    }, {} as Record<string, TaskResponse>)
  );

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Dev function to auto-populate responses
  const handleAutoPopulate = () => {
    if (!isDevelopment) return;
    
    const { myResponses, partnerResponses } = createDemoResponses();
    
    // Set responses in local state
    const newResponses: Record<string, TaskResponse> = {};
    myResponses.forEach(response => {
      newResponses[response.taskId] = response;
      setTaskResponse(response);
    });
    setResponses(newResponses);
    
    // Set partner responses if in together mode
    if (isTogetherMode) {
      partnerResponses.forEach(response => {
        setPartnerTaskResponse(response);
      });
    }
  };

  // Organize tasks by category and filter by conditions
  const tasksByCategory = useMemo(() => {
    // Filter tasks based on household setup - simplified for all tasks
    const filtered = allTasks.filter(task => {
      const { children } = state.householdSetup;
      
      // Show childcare tasks only if there are children
      if (task.category === "Childcare" && children === 0) {
        return false;
      }
      
      return true;
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
      id: ALL_CATEGORIES.CHILDCARE, 
      label: "Childcare", 
      icon: Heart,
      description: "Care and activities for children",
      type: 'physical' as const
    },
    { 
      id: ALL_CATEGORIES.SHOPPING, 
      label: "Shopping", 
      icon: BarChart3,
      description: "Purchasing household items and groceries",
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
    { title: "Results", description: "View calculations" }
  ];

  const updateResponse = (taskId: string, updates: Partial<TaskResponse>) => {
    const task = allTaskLookup[taskId];
    if (!task) return;

    const currentResponse = responses[taskId];
    
    const newResponse: TaskResponse = {
      ...currentResponse,
      taskId,
      assignment: currentResponse?.assignment || 'me',
      measurementType: 'likert',
      ...updates
    };

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
    
    setCurrentStep(3);
    navigate('/results');
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
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

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradientClass || 'from-background via-background to-primary/5'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={2} totalSteps={3} steps={steps} />
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Who Does What?
          </h1>
          {isDevelopment && (
            <div className="mb-4">
              <Button 
                onClick={handleAutoPopulate} 
                variant="outline" 
                size="sm"
                className="text-xs bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-800"
              >
                🔧 Dev: Auto-populate Demo Data
              </Button>
            </div>
          )}
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
                        <span className="leading-tight">{'title' in task ? task.title : task.task_name}</span>
                        {isNotApplicable && <span className="text-muted-foreground text-sm">(Skipped)</span>}
                      </CardTitle>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <Brain className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Rated by burden and fairness</span>
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
                      </div>

                      {/* Share Percentage for Shared Tasks */}
                      {response?.assignment === 'shared' && (
                        <div className="space-y-2 bg-muted/20 p-3 rounded">
                          <Label className="text-sm font-medium">Your share: {response.mySharePercentage || 50}%</Label>
                          <Slider
                            value={[response.mySharePercentage || 50]}
                            onValueChange={([value]) => updateResponse(task.id, { mySharePercentage: value })}
                            max={100}
                            min={0}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Partner does more</span>
                            <span>You do more</span>
                          </div>
                        </div>
                      )}

                      {/* Likert Scale Ratings */}
                      {response?.assignment && (
                        <div className="space-y-4 bg-muted/10 p-3 rounded">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              How burdensome is this task? {response.likertRating?.burden || 3}/5
                            </Label>
                            <Slider
                              value={[response.likertRating?.burden || 3]}
                              onValueChange={([value]) => updateLikertRating(task.id, 'burden', value)}
                              max={5}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Not burdensome</span>
                              <span>Very burdensome</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              How fairly acknowledged is this work? {response.likertRating?.fairness || 3}/5
                            </Label>
                            <Slider
                              value={[response.likertRating?.fairness || 3]}
                              onValueChange={([value]) => updateLikertRating(task.id, 'fairness', value)}
                              max={5}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Unacknowledged</span>
                              <span>Well acknowledged</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      This task doesn't apply to your household
                    </div>
                  )}

                  {/* Not Applicable Toggle */}
                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateResponse(task.id, { 
                        notApplicable: !isNotApplicable,
                        assignment: isNotApplicable ? 'me' : undefined,
                        mySharePercentage: isNotApplicable ? 100 : undefined
                      })}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {isNotApplicable ? 'Mark as applicable' : 'Not applicable to our household'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0}
          >
            Previous Category
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {currentCategoryIndex + 1} of {categoryData.length} categories
          </div>

          <Button
            onClick={handleNext}
            disabled={!isCategoryComplete}
            className="min-w-[120px]"
          >
            {currentCategoryIndex >= categoryData.length - 1 ? 'View Results' : 'Next Category'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskQuestionnaire;