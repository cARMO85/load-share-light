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

  // Helper function to calculate loads using exact formula: Mental Load Score = (Time × Weight × Share%)
  const calculateLoadFromResponses = (responses: typeof state.taskResponses, taskLookup: Record<string, typeof mentalLoadTasks[0]>, hasTwoAdults: boolean) => {
    let myVisibleTime = 0;
    let myMentalLoad = 0;
    let partnerVisibleTime = 0;
    let partnerMentalLoad = 0;

    // Filter out not applicable tasks
    const applicableResponses = responses.filter(response => !response.notApplicable);

    applicableResponses.forEach(response => {
      const task = taskLookup[response.taskId];
      if (!task) return;

      const timeInMinutes = response.estimatedMinutes;
      const mentalLoadWeight = task.mental_load_weight;

      if (response.assignment === 'me') {
        // Me: 100% share
        const sharePercent = (response.mySharePercentage || 100) / 100;
        myVisibleTime += timeInMinutes * sharePercent;
        myMentalLoad += timeInMinutes * mentalLoadWeight * sharePercent;
        
        // Partner gets remainder
        const partnerSharePercent = 1 - sharePercent;
        if (hasTwoAdults && partnerSharePercent > 0) {
          partnerVisibleTime += timeInMinutes * partnerSharePercent;
          partnerMentalLoad += timeInMinutes * mentalLoadWeight * partnerSharePercent;
        }
      } else if (response.assignment === 'partner') {
        // Partner: 100% share  
        const sharePercent = (response.mySharePercentage || 0) / 100;
        myVisibleTime += timeInMinutes * sharePercent;
        myMentalLoad += timeInMinutes * mentalLoadWeight * sharePercent;
        
        // Partner gets remainder
        const partnerSharePercent = 1 - sharePercent;
        if (hasTwoAdults) {
          partnerVisibleTime += timeInMinutes * partnerSharePercent;
          partnerMentalLoad += timeInMinutes * mentalLoadWeight * partnerSharePercent;
        }
      } else if (response.assignment === 'shared') {
        // Shared: 50/50 by default
        const mySharePercent = 50 / 100; // Always 50/50 for shared
        const partnerSharePercent = 1 - mySharePercent;
        
        myVisibleTime += timeInMinutes * mySharePercent;
        myMentalLoad += timeInMinutes * mentalLoadWeight * mySharePercent;
        
        if (hasTwoAdults) {
          partnerVisibleTime += timeInMinutes * partnerSharePercent;
          partnerMentalLoad += timeInMinutes * mentalLoadWeight * partnerSharePercent;
        }
      }
    });

    const totalVisibleTime = myVisibleTime + partnerVisibleTime;
    const totalMentalLoad = myMentalLoad + partnerMentalLoad;

    return {
      myVisibleTime: Math.round(myVisibleTime),
      myMentalLoad: Math.round(myMentalLoad),
      partnerVisibleTime: hasTwoAdults ? Math.round(partnerVisibleTime) : undefined,
      partnerMentalLoad: hasTwoAdults ? Math.round(partnerMentalLoad) : undefined,
      totalVisibleTime: Math.round(totalVisibleTime),
      totalMentalLoad: Math.round(totalMentalLoad),
      myVisiblePercentage: totalVisibleTime > 0 ? Math.round((myVisibleTime / totalVisibleTime) * 100) : 0,
      myMentalPercentage: totalMentalLoad > 0 ? Math.round((myMentalLoad / totalMentalLoad) * 100) : 0,
      partnerVisiblePercentage: hasTwoAdults && totalVisibleTime > 0 
        ? Math.round((partnerVisibleTime / totalVisibleTime) * 100) : undefined,
      partnerMentalPercentage: hasTwoAdults && totalMentalLoad > 0 
        ? Math.round((partnerMentalLoad / totalMentalLoad) * 100) : undefined,
    };
  };

  const results = useMemo((): CalculatedResults => {
    const taskLookup = mentalLoadTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, typeof mentalLoadTasks[0]>);

    const isTogetherMode = state.householdSetup.assessmentMode === 'together';
    
    // Calculate from my perspective
    const myCalculations = calculateLoadFromResponses(state.taskResponses, taskLookup, state.householdSetup.adults === 2);
    
    // Calculate from partner's perspective (if together mode)
    let partnerCalculations = null;
    let perceptionGaps = null;
    
    if (isTogetherMode && state.partnerTaskResponses && state.partnerTaskResponses.length > 0) {
      partnerCalculations = calculateLoadFromResponses(state.partnerTaskResponses, taskLookup, true);
      
      // Calculate perception gaps
      perceptionGaps = {
        myVisibleTimeGap: partnerCalculations.myVisibleTime - myCalculations.myVisibleTime,
        myMentalLoadGap: partnerCalculations.myMentalLoad - myCalculations.myMentalLoad,
        partnerVisibleTimeGap: partnerCalculations.partnerVisibleTime! - myCalculations.partnerVisibleTime!,
        partnerMentalLoadGap: partnerCalculations.partnerMentalLoad! - myCalculations.partnerMentalLoad!,
      };
    }

    return {
      ...myCalculations,
      partnerPerspectiveMyVisibleTime: partnerCalculations?.myVisibleTime,
      partnerPerspectiveMyMentalLoad: partnerCalculations?.myMentalLoad,
      partnerPerspectivePartnerVisibleTime: partnerCalculations?.partnerVisibleTime,
      partnerPerspectivePartnerMentalLoad: partnerCalculations?.partnerMentalLoad,
      perceptionGaps
    };
  }, [state.taskResponses, state.partnerTaskResponses, state.householdSetup]);

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
  const isTogetherMode = state.householdSetup.assessmentMode === 'together';
  const hasPerceptionGaps = results.perceptionGaps && state.partnerTaskResponses?.length;

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
            
            {/* Perception Gaps for Together Mode */}
            {hasPerceptionGaps && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Perception Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Comparing how each of you sees the workload distribution:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">Your Workload (from both perspectives)</h4>
                    <div className="space-y-1 text-sm">
                      <div>Your view: {results.myVisibleTime} min visible, {results.myMentalLoad} mental load</div>
                      <div>Partner's view: {results.partnerPerspectiveMyVisibleTime} min visible, {results.partnerPerspectiveMyMentalLoad} mental load</div>
                      {results.perceptionGaps && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Gap: {results.perceptionGaps.myVisibleTimeGap > 0 ? '+' : ''}{results.perceptionGaps.myVisibleTimeGap} min visible, 
                          {results.perceptionGaps.myMentalLoadGap > 0 ? '+' : ''}{results.perceptionGaps.myMentalLoadGap} mental load
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                    <h4 className="font-medium text-secondary mb-2">Partner's Workload (from both perspectives)</h4>
                    <div className="space-y-1 text-sm">
                      <div>Your view: {results.partnerVisibleTime} min visible, {results.partnerMentalLoad} mental load</div>
                      <div>Partner's view: {results.partnerPerspectivePartnerVisibleTime} min visible, {results.partnerPerspectivePartnerMentalLoad} mental load</div>
                      {results.perceptionGaps && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Gap: {results.perceptionGaps.partnerVisibleTimeGap > 0 ? '+' : ''}{results.perceptionGaps.partnerVisibleTimeGap} min visible, 
                          {results.perceptionGaps.partnerMentalLoadGap > 0 ? '+' : ''}{results.perceptionGaps.partnerMentalLoadGap} mental load
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {results.perceptionGaps && (
                  Math.abs(results.perceptionGaps.myVisibleTimeGap) > 30 || 
                  Math.abs(results.perceptionGaps.partnerVisibleTimeGap) > 30 ||
                  Math.abs(results.perceptionGaps.myMentalLoadGap) > 50 ||
                  Math.abs(results.perceptionGaps.partnerMentalLoadGap) > 50
                ) && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-sm text-accent-foreground">
                      <strong>Significant perception gaps detected!</strong> These differences in how you each view the workload 
                      distribution can be valuable discussion points for better household balance.
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