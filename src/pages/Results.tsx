import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { mentalLoadTasks } from '@/data/tasks';
import { CalculatedResults } from '@/types/assessment';
import { Clock, Brain, BarChart3, Users } from 'lucide-react';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { state, setCurrentStep } = useAssessment();

  const results = useMemo((): CalculatedResults => {
    const taskLookup = mentalLoadTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, typeof mentalLoadTasks[0]>);

    let myVisibleTime = 0;
    let myMentalLoad = 0;
    let partnerVisibleTime = 0;
    let partnerMentalLoad = 0;

    // Filter out not applicable tasks
    const applicableResponses = state.taskResponses.filter(response => !response.notApplicable);

    applicableResponses.forEach(response => {
      const task = taskLookup[response.taskId];
      if (!task) return;

      const minutes = response.estimatedMinutes;
      const mentalWeight = task.mental_load_weight;

      if (response.assignment === 'me') {
        // Me: 100% to me, 0% to partner
        myVisibleTime += minutes;
        myMentalLoad += minutes * mentalWeight;
      } else if (response.assignment === 'partner') {
        // Partner: 0% to me, 100% to partner
        if (state.householdSetup.adults === 2) {
          partnerVisibleTime += minutes;
          partnerMentalLoad += minutes * mentalWeight;
        }
      } else if (response.assignment === 'shared') {
        // Shared: use mySharePercentage (default 50%)
        const myShare = (response.mySharePercentage || 50) / 100;
        const partnerShare = 1 - myShare;
        
        myVisibleTime += minutes * myShare;
        myMentalLoad += minutes * mentalWeight * myShare;
        
        if (state.householdSetup.adults === 2) {
          partnerVisibleTime += minutes * partnerShare;
          partnerMentalLoad += minutes * mentalWeight * partnerShare;
        }
      }
    });

    const totalVisibleTime = myVisibleTime + partnerVisibleTime;
    const totalMentalLoad = myMentalLoad + partnerMentalLoad;

    return {
      myVisibleTime: Math.round(myVisibleTime),
      myMentalLoad: Math.round(myMentalLoad),
      partnerVisibleTime: state.householdSetup.adults === 2 ? Math.round(partnerVisibleTime) : undefined,
      partnerMentalLoad: state.householdSetup.adults === 2 ? Math.round(partnerMentalLoad) : undefined,
      totalVisibleTime: Math.round(totalVisibleTime),
      totalMentalLoad: Math.round(totalMentalLoad),
      myVisiblePercentage: totalVisibleTime > 0 ? Math.round((myVisibleTime / totalVisibleTime) * 100) : 0,
      myMentalPercentage: totalMentalLoad > 0 ? Math.round((myMentalLoad / totalMentalLoad) * 100) : 0,
      partnerVisiblePercentage: state.householdSetup.adults === 2 && totalVisibleTime > 0 
        ? Math.round((partnerVisibleTime / totalVisibleTime) * 100) : undefined,
      partnerMentalPercentage: state.householdSetup.adults === 2 && totalMentalLoad > 0 
        ? Math.round((partnerMentalLoad / totalMentalLoad) * 100) : undefined,
    };
  }, [state.taskResponses, state.householdSetup]);

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Results", description: "View calculations" },
    { title: "Visualize", description: "Charts & insights" }
  ];

  const handleNext = () => {
    setCurrentStep(4);
    navigate('/dashboard');
  };

  const isSingleAdult = state.householdSetup.adults === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={3} totalSteps={4} steps={steps} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Your Mental Load Analysis
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isSingleAdult 
              ? "Here's your total household workload breakdown"
              : "Here's how the mental load is distributed in your household"
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Visible Time Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Clock className="h-6 w-6 text-primary" />
                Visible Time Load
              </CardTitle>
              <CardDescription>Actual time spent on tasks</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-3xl font-bold text-primary">
                {results.myVisibleTime} minutes/week
              </div>
              {!isSingleAdult && (
                <div className="text-lg text-muted-foreground">
                  {results.myVisiblePercentage}% of total household visible work
                </div>
              )}
              {!isSingleAdult && results.partnerVisibleTime && (
                <div className="text-sm text-muted-foreground border-t pt-4">
                  Partner: {results.partnerVisibleTime} minutes/week ({results.partnerVisiblePercentage}%)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mental Load Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Brain className="h-6 w-6 text-secondary" />
                Mental Load
              </CardTitle>
              <CardDescription>Cognitive burden (time × complexity)</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-3xl font-bold text-secondary">
                {results.myMentalLoad} points/week
              </div>
              {!isSingleAdult && (
                <div className="text-lg text-muted-foreground">
                  {results.myMentalPercentage}% of total household mental load
                </div>
              )}
              {!isSingleAdult && results.partnerMentalLoad && (
                <div className="text-sm text-muted-foreground border-t pt-4">
                  Partner: {results.partnerMentalLoad} points/week ({results.partnerMentalPercentage}%)
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-foreground" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSingleAdult ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Your total weekly household commitment is <strong>{results.myVisibleTime} minutes</strong> of visible work 
                  with a mental load impact of <strong>{results.myMentalLoad} points</strong>.
                </p>
                <p className="text-muted-foreground">
                  This represents approximately <strong>{Math.round(results.myVisibleTime / 60)} hours</strong> per week 
                  of household management.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  You handle <strong>{results.myVisiblePercentage}%</strong> of visible household work and{' '}
                  <strong>{results.myMentalPercentage}%</strong> of the mental load.
                </p>
                
                {Math.abs(results.myVisiblePercentage - results.myMentalPercentage) > 10 && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-sm text-accent-foreground">
                      <strong>Notice:</strong> There's a {Math.abs(results.myVisiblePercentage - results.myMentalPercentage)}% 
                      difference between your visible work and mental load percentages. This suggests the cognitive burden 
                      may not be evenly distributed.
                    </p>
                  </div>
                )}
                
                {results.myMentalPercentage > 60 && (
                  <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                    <p className="text-sm text-secondary-foreground">
                      You're carrying a significant portion of the household's mental load. 
                      Consider discussing task redistribution with your partner.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            onClick={handleNext} 
            variant="hero" 
            size="lg"
            className="px-8"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            View Detailed Visualizations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;