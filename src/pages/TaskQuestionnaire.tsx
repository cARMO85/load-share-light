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
import { Clock, Brain, Users } from 'lucide-react';

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
      assignment: responses[taskId]?.assignment || 'shared',
      estimatedMinutes: responses[taskId]?.estimatedMinutes || task.baseline_minutes_week,
      ...updates
    } as TaskResponse;

    setResponses(prev => ({ ...prev, [taskId]: newResponse }));
    setTaskResponse(newResponse);
  };

  const handleNext = () => {
    setCurrentStep(3);
    navigate('/results');
  };

  const isComplete = relevantTasks.every(task => responses[task.id]?.assignment);
  const completedTasks = relevantTasks.filter(task => responses[task.id]?.assignment).length;

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
          <div className="mt-4 text-sm text-muted-foreground">
            Progress: {completedTasks} of {relevantTasks.length} tasks completed
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {relevantTasks.map((task) => {
            const response = responses[task.id];
            const showSlider = response?.assignment === 'me' || response?.assignment === 'partner';
            
            return (
              <Card key={task.id} className="shadow-md border-0 bg-gradient-to-br from-card to-card/80">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        {task.task_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Category: {task.category} • Mental load weight: {task.mental_load_weight}x
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Who primarily handles this?</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={response?.assignment === 'me' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateResponse(task.id, { assignment: 'me', personalShare: 8 })}
                        className="flex-1"
                      >
                        Me
                      </Button>
                      <Button
                        variant={response?.assignment === 'shared' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateResponse(task.id, { assignment: 'shared' })}
                        className="flex-1"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Shared
                      </Button>
                      {state.householdSetup.adults === 2 && (
                        <Button
                          variant={response?.assignment === 'partner' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateResponse(task.id, { assignment: 'partner', personalShare: 8 })}
                          className="flex-1"
                        >
                          Partner
                        </Button>
                      )}
                    </div>
                  </div>

                  {showSlider && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        How much do you handle? (Scale: 6 = barely any, 10 = almost all)
                      </Label>
                      <div className="px-3">
                        <Slider
                          value={[response?.personalShare || 8]}
                          onValueChange={([value]) => updateResponse(task.id, { personalShare: value })}
                          min={6}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Minimal</span>
                          <span className="font-medium">{response?.personalShare}/10</span>
                          <span>Almost all</span>
                        </div>
                      </div>
                    </div>
                  )}

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
            {isComplete ? 'View Results' : `Complete ${relevantTasks.length - completedTasks} more tasks`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskQuestionnaire;