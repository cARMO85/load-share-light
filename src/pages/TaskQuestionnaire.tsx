import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { mentalLoadTasks } from '@/data/tasks';
import { TaskResponse } from '@/types/assessment';
import { Clock, Brain, Users, Info, X } from 'lucide-react';

const TaskQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { state, setTaskResponse, setCurrentStep } = useAssessment();
  
  const [responses, setResponses] = useState<Record<string, TaskResponse>>(
    state.taskResponses.reduce((acc, response) => {
      acc[response.taskId] = response;
      return acc;
    }, {} as Record<string, TaskResponse>)
  );

  const relevantTasks = useMemo(() => {
    const { householdSetup } = state;
    
    return mentalLoadTasks.filter(task => {
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
  }, [state.householdSetup]);

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Results", description: "View calculations" },
    { title: "Visualize", description: "Charts & insights" }
  ];

  const updateResponse = (taskId: string, updates: Partial<TaskResponse>) => {
    const task = relevantTasks.find(t => t.id === taskId);
    if (!task) return;

    const newResponse = {
      taskId,
      assignment: responses[taskId]?.assignment || 'me',
      estimatedMinutes: responses[taskId]?.estimatedMinutes || task.baseline_minutes_week,
      notApplicable: false,
      ...updates
    } as TaskResponse;

    setResponses(prev => ({ ...prev, [taskId]: newResponse }));
    setTaskResponse(newResponse);
  };

  const handleNext = () => {
    setCurrentStep(3);
    navigate('/results');
  };

  const isSingleAdult = state.householdSetup.adults === 1;
  const applicableTasks = relevantTasks.filter(task => !responses[task.id]?.notApplicable);
  const isComplete = applicableTasks.every(task => 
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={2} totalSteps={4} steps={steps} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Task Responsibility Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            For each task, indicate who primarily handles it and estimate the time involved.
          </p>
          {isSingleAdult && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
              Even if your partner isn't taking this assessment, you can still indicate their responsibilities.
            </p>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            Progress: {completedTasks} of {applicableTasks.length} tasks completed
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {relevantTasks.map((task) => {
            const response = responses[task.id];
            const showSlider = response?.assignment === 'shared' && !response?.notApplicable;
            const isNotApplicable = response?.notApplicable;
            
            return (
              <Card key={task.id} className={`shadow-md border-0 transition-all ${
                isNotApplicable 
                  ? 'opacity-50 bg-muted/50' 
                  : 'bg-gradient-to-br from-card to-card/80'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        {task.task_name}
                        {isNotApplicable && <span className="text-muted-foreground">(Not Applicable)</span>}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Category: {task.category} • Mental load weight: {task.mental_load_weight}x
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {!isNotApplicable ? (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Who primarily handles this?</Label>
                        <div className="flex gap-2 mb-2">
                          <Button
                            variant={response?.assignment === 'me' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateResponse(task.id, { assignment: 'me', mySharePercentage: undefined })}
                            className="flex-1"
                          >
                            {labels.me}
                          </Button>
                          <Button
                            variant={response?.assignment === 'shared' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateResponse(task.id, { assignment: 'shared', mySharePercentage: 50 })}
                            className="flex-1"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            {labels.shared}
                          </Button>
                          <Button
                            variant={response?.assignment === 'partner' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateResponse(task.id, { assignment: 'partner', mySharePercentage: undefined })}
                            className="flex-1"
                          >
                            {labels.partner}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateResponse(task.id, { notApplicable: true })}
                          className="w-full text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Not applicable to my household
                        </Button>
                      </div>

                      {showSlider && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">
                            What percentage do you handle? ({response?.mySharePercentage || 50}%)
                          </Label>
                          <div className="px-3">
                            <Slider
                              value={[response?.mySharePercentage || 50]}
                              onValueChange={([value]) => updateResponse(task.id, { mySharePercentage: value })}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Partner does it all</span>
                              <span>50/50</span>
                              <span>I do it all</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Estimated minutes per week:</Label>
                          <Input
                            type="number"
                            value={response?.estimatedMinutes || task.baseline_minutes_week}
                            onChange={(e) => updateResponse(task.id, { 
                              estimatedMinutes: parseInt(e.target.value) || task.baseline_minutes_week 
                            })}
                            className="w-20"
                            min="0"
                          />
                        </div>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground pl-7">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div>Typical range: {task.time_range}</div>
                            <div>Source: {task.source_details}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateResponse(task.id, { notApplicable: false })}
                      >
                        Mark as applicable
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleNext} 
            variant="hero" 
            size="lg"
            disabled={!isComplete}
            className="px-8"
          >
            {isComplete ? 'View Results' : `Complete ${applicableTasks.length - completedTasks} more tasks`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskQuestionnaire;