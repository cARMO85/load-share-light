import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { mentalLoadTasks, TASK_CATEGORIES } from '@/data/tasks';
import { CalculatedResults, TaskResponse } from '@/types/assessment';
import { Clock, Brain, BarChart3, Users, UserCheck, Heart, Lightbulb, Calendar, Eye, Monitor, HeartHandshake } from 'lucide-react';

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

  // Category analysis for personalized advice
  const categoryAnalysis = useMemo(() => {
    const taskLookup = mentalLoadTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, typeof mentalLoadTasks[0]>);

    const categories = Object.values(TASK_CATEGORIES);
    const analysis: Record<string, {
      myMentalLoad: number;
      partnerMentalLoad: number;
      myPercentage: number;
      partnerPercentage: number;
      taskCount: number;
    }> = {};

    categories.forEach(category => {
      let myLoad = 0;
      let partnerLoad = 0;
      let taskCount = 0;

      state.taskResponses.forEach(response => {
        const task = taskLookup[response.taskId];
        if (!task || task.category !== category || response.notApplicable) return;

        taskCount++;
        const timeInMinutes = response.estimatedMinutes;
        const mentalLoadWeight = task.mental_load_weight;

        if (response.assignment === 'me') {
          const sharePercent = (response.mySharePercentage || 100) / 100;
          myLoad += timeInMinutes * mentalLoadWeight * sharePercent;
          if (state.householdSetup.adults === 2) {
            partnerLoad += timeInMinutes * mentalLoadWeight * (1 - sharePercent);
          }
        } else if (response.assignment === 'partner') {
          const sharePercent = (response.mySharePercentage || 0) / 100;
          myLoad += timeInMinutes * mentalLoadWeight * sharePercent;
          if (state.householdSetup.adults === 2) {
            partnerLoad += timeInMinutes * mentalLoadWeight * (1 - sharePercent);
          }
        } else if (response.assignment === 'shared') {
          const mySharePercent = 0.5;
          myLoad += timeInMinutes * mentalLoadWeight * mySharePercent;
          if (state.householdSetup.adults === 2) {
            partnerLoad += timeInMinutes * mentalLoadWeight * (1 - mySharePercent);
          }
        }
      });

      const totalLoad = myLoad + partnerLoad;
      analysis[category] = {
        myMentalLoad: Math.round(myLoad),
        partnerMentalLoad: Math.round(partnerLoad),
        myPercentage: totalLoad > 0 ? Math.round((myLoad / totalLoad) * 100) : 0,
        partnerPercentage: totalLoad > 0 ? Math.round((partnerLoad / totalLoad) * 100) : 0,
        taskCount
      };
    });

    return analysis;
  }, [state.taskResponses, state.householdSetup]);

  // Generate personalized advice
  const personalizedAdvice = useMemo(() => {
    const advice: string[] = [];
    const isTwoAdults = state.householdSetup.adults === 2;
    
    if (!isTwoAdults) {
      advice.push("As a single adult household, you're managing all the mental load responsibilities. Consider strategies for reducing overall burden through simplification and external support when possible.");
      return advice;
    }

    // Find dominant categories for each person
    const myDominantCategories = Object.entries(categoryAnalysis)
      .filter(([_, data]) => data.myPercentage > 70 && data.taskCount > 0)
      .map(([category, _]) => category);

    const partnerDominantCategories = Object.entries(categoryAnalysis)
      .filter(([_, data]) => data.partnerPercentage > 70 && data.taskCount > 0)
      .map(([category, _]) => category);

    // Overall mental load balance
    const myTotalPercentage = results.myMentalPercentage;
    const partnerTotalPercentage = results.partnerMentalPercentage || 0;

    if (Math.abs(myTotalPercentage - 50) > 20) {
      if (myTotalPercentage > 70) {
        advice.push(`⚖️ **Workload Imbalance**: You're carrying ${myTotalPercentage}% of the mental load, which is significantly higher than your partner's ${partnerTotalPercentage}%. This imbalance can lead to stress and relationship tension over time.`);
      } else if (myTotalPercentage < 30) {
        advice.push(`⚖️ **Partner Carries More**: Your partner is handling ${partnerTotalPercentage}% of the mental load. While this might work for your relationship, it's worth checking if this distribution feels fair to both of you.`);
      }
    } else {
      advice.push(`✅ **Balanced Distribution**: You have a relatively balanced mental load distribution (${myTotalPercentage}% vs ${partnerTotalPercentage}%). This suggests good collaboration in household management.`);
    }

    // Category-specific insights
    if (myDominantCategories.includes(TASK_CATEGORIES.ANTICIPATION)) {
      advice.push(`📅 **You Lead Planning**: You're handling most of the **Anticipation** tasks, which means you're the household's primary planner. This involves thinking ahead about meals, schedules, and future needs. This mental work often goes unnoticed but is crucial for smooth household functioning.`);
    }

    if (myDominantCategories.includes(TASK_CATEGORIES.EMOTIONAL_LABOUR)) {
      advice.push(`💕 **Emotional Manager**: You're carrying most of the **Emotional Labour** in your relationship. This includes managing family conflicts, providing emotional support, and maintaining relationships. This type of mental work can be particularly draining as it requires constant emotional availability.`);
    }

    if (myDominantCategories.includes(TASK_CATEGORIES.MONITORING)) {
      advice.push(`👀 **The Tracker**: You're responsible for most **Monitoring** tasks - keeping track of appointments, following up on delegated tasks, and ensuring things get done. This makes you the household's memory and quality controller.`);
    }

    if (partnerDominantCategories.includes(TASK_CATEGORIES.ANTICIPATION)) {
      advice.push(`📋 **Partner Plans Ahead**: Your partner is taking the lead on **Anticipation** tasks, handling the future-focused planning that keeps your household running smoothly. This frees you from having to constantly think ahead about upcoming needs.`);
    }

    if (partnerDominantCategories.includes(TASK_CATEGORIES.EMOTIONAL_LABOUR)) {
      advice.push(`💝 **Partner Manages Emotions**: Your partner is handling most of the **Emotional Labour**, including family relationship management and emotional support. This is valuable invisible work that contributes significantly to family well-being.`);
    }

    if (partnerDominantCategories.includes(TASK_CATEGORIES.DECISION_MAKING)) {
      advice.push(`🤔 **Partner Makes Decisions**: Your partner is taking responsibility for most **Decision-Making** tasks - from choosing service providers to making budget allocations. This decision-making load can be mentally taxing but ensures household needs are met.`);
    }

    // Shared categories insight
    const sharedCategories = Object.entries(categoryAnalysis)
      .filter(([_, data]) => Math.abs(data.myPercentage - 50) < 20 && data.taskCount > 0)
      .map(([category, _]) => category);

    if (sharedCategories.length > 0) {
      advice.push(`🤝 **Good Collaboration**: You're sharing responsibilities well in **${sharedCategories.join(', ')}**. This balanced approach helps prevent one person from becoming overwhelmed in these areas.`);
    }

    // Recommendations based on patterns
    if (myDominantCategories.length > 2) {
      advice.push(`💡 **Recommendation**: Consider discussing task redistribution. You're dominant in multiple mental load categories, which could lead to burnout. Try delegating some ${myDominantCategories.slice(-1)[0]} tasks to create better balance.`);
    }

    if (partnerDominantCategories.length === 0 && isTwoAdults) {
      advice.push(`🔄 **Consider Rebalancing**: Your partner isn't leading in any mental load category. This might be an opportunity to have them take ownership of specific areas like ${Object.keys(categoryAnalysis)[0]} or ${Object.keys(categoryAnalysis)[1]} to create better balance.`);
    }

    return advice;
  }, [categoryAnalysis, results, state.householdSetup.adults]);

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
  const hasPartnerData = results.perceptionGaps && state.partnerTaskResponses?.length;

  // Calculate partner's perspective results for together mode
  const partnerPerspectiveResults = useMemo(() => {
    if (!hasPartnerData) return null;
    
    const taskLookup = mentalLoadTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, typeof mentalLoadTasks[0]>);
    
    return calculateLoadFromResponses(state.partnerTaskResponses!, taskLookup, true);
  }, [state.partnerTaskResponses, hasPartnerData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={3} totalSteps={4} steps={steps} />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {isTogetherMode && hasPartnerData ? 'Perception Comparison Results' : 'Your Mental Load Analysis'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isTogetherMode && hasPartnerData 
              ? "Here's how each of you perceives the household workload distribution"
              : isSingleAdult 
                ? "Here's your total household workload breakdown"
                : "Here's how the mental load is distributed in your household"
            }
          </p>
        </div>

        {/* Together Mode: Side-by-side comparison */}
        {isTogetherMode && hasPartnerData && partnerPerspectiveResults ? (
          <div className="space-y-8 mb-8">
            {/* Header explaining the comparison */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-accent/5">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6 text-accent" />
                  Perception Comparison
                </CardTitle>
                <CardDescription>
                  Each column shows how one person views the household workload distribution
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Side-by-side comparison cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Your Perspective */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-primary text-center flex items-center justify-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Your Perspective
                </h2>
                
                {/* Your view - Visible Time */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
                  <CardHeader className="text-center pb-3">
                    <CardTitle className="flex items-center justify-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      Visible Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">You handle:</div>
                      <div className="text-2xl font-bold text-primary">{results.myVisibleTime} min/week</div>
                      <div className="text-sm text-muted-foreground">({results.myVisiblePercentage}%)</div>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <div className="text-sm text-muted-foreground">Partner handles:</div>
                      <div className="text-lg font-semibold">{results.partnerVisibleTime} min/week</div>
                      <div className="text-sm text-muted-foreground">({results.partnerVisiblePercentage}%)</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Your view - Mental Load */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
                  <CardHeader className="text-center pb-3">
                    <CardTitle className="flex items-center justify-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      Mental Load
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">You carry:</div>
                      <div className="text-2xl font-bold text-primary">{results.myMentalLoad} points</div>
                      <div className="text-sm text-muted-foreground">({results.myMentalPercentage}%)</div>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <div className="text-sm text-muted-foreground">Partner carries:</div>
                      <div className="text-lg font-semibold">{results.partnerMentalLoad} points</div>
                      <div className="text-sm text-muted-foreground">({results.partnerMentalPercentage}%)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Partner's Perspective */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-secondary text-center flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5" />
                  Partner's Perspective
                </h2>
                
                {/* Partner's view - Visible Time */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-secondary/5">
                  <CardHeader className="text-center pb-3">
                    <CardTitle className="flex items-center justify-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-secondary" />
                      Visible Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">You handle:</div>
                      <div className="text-2xl font-bold text-secondary">{partnerPerspectiveResults.myVisibleTime} min/week</div>
                      <div className="text-sm text-muted-foreground">({partnerPerspectiveResults.myVisiblePercentage}%)</div>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <div className="text-sm text-muted-foreground">Partner handles:</div>
                      <div className="text-lg font-semibold">{partnerPerspectiveResults.partnerVisibleTime} min/week</div>
                      <div className="text-sm text-muted-foreground">({partnerPerspectiveResults.partnerVisiblePercentage}%)</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Partner's view - Mental Load */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-secondary/5">
                  <CardHeader className="text-center pb-3">
                    <CardTitle className="flex items-center justify-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-secondary" />
                      Mental Load
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">You carry:</div>
                      <div className="text-2xl font-bold text-secondary">{partnerPerspectiveResults.myMentalLoad} points</div>
                      <div className="text-sm text-muted-foreground">({partnerPerspectiveResults.myMentalPercentage}%)</div>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <div className="text-sm text-muted-foreground">Partner carries:</div>
                      <div className="text-lg font-semibold">{partnerPerspectiveResults.partnerMentalLoad} points</div>
                      <div className="text-sm text-muted-foreground">({partnerPerspectiveResults.partnerMentalPercentage}%)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Perception Gaps Analysis */}
            {results.perceptionGaps && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-accent" />
                    Key Perception Differences
                  </CardTitle>
                  <CardDescription>
                    Where your perspectives differ and what it might mean
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Your Workload Differences</h4>
                      <div className="text-sm space-y-1">
                        <div>Visible time gap: <span className={`font-medium ${results.perceptionGaps.myVisibleTimeGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {results.perceptionGaps.myVisibleTimeGap > 0 ? '+' : ''}{results.perceptionGaps.myVisibleTimeGap} minutes
                        </span></div>
                        <div>Mental load gap: <span className={`font-medium ${results.perceptionGaps.myMentalLoadGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {results.perceptionGaps.myMentalLoadGap > 0 ? '+' : ''}{results.perceptionGaps.myMentalLoadGap} points
                        </span></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Partner's Workload Differences</h4>
                      <div className="text-sm space-y-1">
                        <div>Visible time gap: <span className={`font-medium ${results.perceptionGaps.partnerVisibleTimeGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {results.perceptionGaps.partnerVisibleTimeGap > 0 ? '+' : ''}{results.perceptionGaps.partnerVisibleTimeGap} minutes
                        </span></div>
                        <div>Mental load gap: <span className={`font-medium ${results.perceptionGaps.partnerMentalLoadGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {results.perceptionGaps.partnerMentalLoadGap > 0 ? '+' : ''}{results.perceptionGaps.partnerMentalLoadGap} points
                        </span></div>
                      </div>
                    </div>
                  </div>
                  
                  {(Math.abs(results.perceptionGaps.myVisibleTimeGap) > 30 || 
                    Math.abs(results.perceptionGaps.partnerVisibleTimeGap) > 30 ||
                    Math.abs(results.perceptionGaps.myMentalLoadGap) > 50 ||
                    Math.abs(results.perceptionGaps.partnerMentalLoadGap) > 50) && (
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 mt-4">
                      <p className="text-sm text-accent-foreground">
                        <strong>Discussion Opportunity:</strong> These perception differences reveal important insights about how household work is viewed. 
                        Consider discussing which tasks feel more/less burdensome and why your estimates differ.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Single Person or Solo Mode View */
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
        )}

        {/* Summary Card - shown for all modes */}
        {!isTogetherMode || !hasPartnerData ? (
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

        {/* Category Breakdown and Personalized Advice */}
        <div className="grid gap-6 mb-8">
          {/* Category Analysis */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-accent" />
                Mental Load by Category
              </CardTitle>
              <CardDescription>
                How responsibilities are distributed across different types of mental work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(categoryAnalysis).map(([category, data]) => {
                  if (data.taskCount === 0) return null;
                  
                  const categoryIcons = {
                    [TASK_CATEGORIES.ANTICIPATION]: <Calendar className="h-5 w-5" />,
                    [TASK_CATEGORIES.IDENTIFICATION]: <Eye className="h-5 w-5" />,
                    [TASK_CATEGORIES.DECISION_MAKING]: <Lightbulb className="h-5 w-5" />,
                    [TASK_CATEGORIES.MONITORING]: <Monitor className="h-5 w-5" />,
                    [TASK_CATEGORIES.EMOTIONAL_LABOUR]: <HeartHandshake className="h-5 w-5" />
                  };

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2 font-medium">
                        {categoryIcons[category]}
                        <span>{category}</span>
                        <span className="text-sm text-muted-foreground">({data.taskCount} tasks)</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-muted-foreground">You:</div>
                          <div className="font-medium text-primary">
                            {data.myMentalLoad} points ({data.myPercentage}%)
                          </div>
                        </div>
                        {!isSingleAdult && (
                          <div className="space-y-1">
                            <div className="text-muted-foreground">Partner:</div>
                            <div className="font-medium text-secondary">
                              {data.partnerMentalLoad} points ({data.partnerPercentage}%)
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Visual bar */}
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${data.myPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Personalized Advice */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                Personalized Insights & Recommendations
              </CardTitle>
              <CardDescription>
                Based on your mental load patterns, here's what we've learned about your household dynamics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizedAdvice.map((advice, index) => (
                  <div key={index} className="p-4 rounded-lg bg-background/50 border">
                    <p className="text-sm leading-relaxed">{advice}</p>
                  </div>
                ))}
                
                {personalizedAdvice.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Complete more tasks to receive personalized insights about your household mental load patterns.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
            </CardContent>
          </Card>
        ) : null}

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