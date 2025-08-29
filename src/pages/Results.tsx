import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { DialogueFacilitator } from '@/components/DialogueFacilitator';
import { ConversationReport } from '@/components/ConversationReport';
import { SharedVocabulary } from '@/components/SharedVocabulary';
import { generateConversationPrompts } from '@/lib/conversationEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { allTaskLookup, physicalTaskLookup, cognitiveTaskLookup } from '@/data/allTasks';
import { calculatePersonLoad } from '@/lib/calculationUtils';
import { CalculatedResults, TaskResponse } from '@/types/assessment';
import { getEffectiveTaskTime } from '@/lib/timeAdjustmentUtils';
import { getResearchComparison, RESEARCH_BENCHMARKS } from '@/lib/researchBenchmarks';
import { 
  AlertCircle, 
  BarChart3, 
  BookOpen, 
  Clock, 
  Heart, 
  Lightbulb, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Brain,
  ArrowRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { InfoButton } from '@/components/InfoButton';
import { addSampleInsights, isDevelopment } from '@/lib/devUtils';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { state, addInsight } = useAssessment();
  const [activeTab, setActiveTab] = useState('conversation');
  const [discussionNotes, setDiscussionNotes] = useState<Record<string, string>>({});

  // Helper function to calculate loads using exact formula: Mental Load Score = (Time × Weight × Share%)
  const calculateLoadFromResponses = (responses: typeof state.taskResponses, taskLookup: typeof allTaskLookup, hasTwoAdults: boolean) => {
    let myVisibleTime = 0;
    let myMentalLoad = 0;
    let partnerVisibleTime = 0;
    let partnerMentalLoad = 0;

    // Filter out not applicable tasks
    const applicableResponses = responses.filter(response => !response.notApplicable);

    applicableResponses.forEach(response => {
      const task = taskLookup[response.taskId];
      if (!task) return;

      // Handle different task types
      const physicalTask = physicalTaskLookup[response.taskId];
      const cognitiveTask = cognitiveTaskLookup[response.taskId];
      
      let timeInMinutes = 0;
      let mentalLoadWeight = 1;
      
      if (physicalTask) {
        timeInMinutes = getEffectiveTaskTime(response, physicalTask.baseline_minutes_week);
        mentalLoadWeight = 1; // Physical tasks have fixed weight
      } else if (cognitiveTask && response.likertRating) {
        timeInMinutes = response.likertRating.burden * 10; // Convert burden to time equivalent
        mentalLoadWeight = 2; // Cognitive tasks have higher mental weight
      }

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
        const partnerSharePercent = (100 - (response.mySharePercentage || 0)) / 100;
        if (hasTwoAdults) {
          partnerVisibleTime += timeInMinutes * partnerSharePercent;
          partnerMentalLoad += timeInMinutes * mentalLoadWeight * partnerSharePercent;
        }
      } else if (response.assignment === 'shared') {
        const myShare = (response.mySharePercentage || 50) / 100;
        const partnerShare = hasTwoAdults ? (1 - myShare) : 0;

        myVisibleTime += timeInMinutes * myShare;
        myMentalLoad += timeInMinutes * mentalLoadWeight * myShare;
        
        if (hasTwoAdults) {
          partnerVisibleTime += timeInMinutes * partnerShare;
          partnerMentalLoad += timeInMinutes * mentalLoadWeight * partnerShare;
        }
      }
    });

    const totalVisibleTime = myVisibleTime + partnerVisibleTime;
    const totalMentalLoad = myMentalLoad + partnerMentalLoad;
    
    return {
      myVisibleTime: Math.round(myVisibleTime),
      myMentalLoad: Math.round(myMentalLoad * 10) / 10,
      partnerVisibleTime: Math.round(partnerVisibleTime),
      partnerMentalLoad: Math.round(partnerMentalLoad * 10) / 10,
      totalVisibleTime: Math.round(totalVisibleTime),
      totalMentalLoad: Math.round(totalMentalLoad * 10) / 10,
      myVisiblePercentage: totalVisibleTime > 0 ? Math.round((myVisibleTime / totalVisibleTime) * 100) : 0,
      myMentalPercentage: totalMentalLoad > 0 ? Math.round((myMentalLoad / totalMentalLoad) * 100) : 0,
      partnerVisiblePercentage: totalVisibleTime > 0 ? Math.round((partnerVisibleTime / totalVisibleTime) * 100) : 0,
      partnerMentalPercentage: totalMentalLoad > 0 ? Math.round((partnerMentalLoad / totalMentalLoad) * 100) : 0,
    };
  };

  // Calculate results using new hybrid system
  const results = useMemo(() => {
    const myCalculations = calculatePersonLoad(state.taskResponses, physicalTaskLookup, cognitiveTaskLookup);
    const hasTwoAdults = state.householdSetup.adults >= 2;
    
    // For together mode, calculate partner's perspective if available
    let partnerCalculations = null;
    let perceptionGaps = null;
    
    if (state.partnerTaskResponses?.length) {
      partnerCalculations = calculateLoadFromResponses(state.partnerTaskResponses, allTaskLookup, hasTwoAdults);
      
      // Calculate perception gaps
      perceptionGaps = {
        myVisibleTimeGap: myCalculations.myVisiblePercentage - partnerCalculations.partnerVisiblePercentage,
        myMentalLoadGap: myCalculations.myMentalPercentage - partnerCalculations.partnerMentalPercentage,
        partnerVisibleTimeGap: partnerCalculations.myVisiblePercentage - myCalculations.partnerVisiblePercentage,
        partnerMentalLoadGap: partnerCalculations.myMentalPercentage - myCalculations.partnerMentalPercentage,
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
  }, [state.taskResponses, state.partnerTaskResponses, state.householdSetup.adults]);

  const isSingleAdult = state.householdSetup.adults === 1;
  const isTogetherMode = state.householdSetup.assessmentMode === 'together';
  const hasPartnerData = results.perceptionGaps && state.partnerTaskResponses?.length;

  // Generate conversation prompts based on results
  const conversationPrompts = useMemo(() => {
    return generateConversationPrompts(results, state);
  }, [results, state]);

  // Define steps for progress indicator
  const steps = [
    { id: 1, name: 'Household Setup', status: 'complete' as const },
    { id: 2, name: 'Task Assessment', status: 'complete' as const },
    ...(isTogetherMode ? [{ id: 3, name: 'Perception Gap', status: 'complete' as const }] : []),
    { id: isTogetherMode ? 4 : 3, name: 'Conversation', status: 'current' as const },
    { id: isTogetherMode ? 5 : 4, name: 'Dashboard', status: 'upcoming' as const }
  ];

  const handleNext = () => {
    navigate('/dashboard');
  };

  const handleNotesUpdate = (promptId: string, notes: string) => {
    setDiscussionNotes(prev => ({ ...prev, [promptId]: notes }));
  };

  const handleInsightCapture = (insight: string) => {
    if (addInsight) {
      addInsight({
        id: Date.now().toString(),
        type: 'breakthrough',
        description: insight,
        timestamp: new Date()
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Progress</h2>
        <div className="flex items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.status === 'complete' ? 'bg-green-500 text-white' :
                step.status === 'current' ? 'bg-primary text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {step.id}
              </div>
              <span className="ml-2 text-sm">{step.name}</span>
              {index < steps.length - 1 && <div className="w-8 h-px bg-border mx-4" />}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Understanding Your Household Work</h1>
        <p className="text-lg text-muted-foreground">
          {isTogetherMode 
            ? "Use this space to discuss your findings and plan next steps together"
            : "Reflect on these insights and consider how to discuss them with your household"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversation">
            <MessageCircle className="h-4 w-4 mr-1" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BarChart3 className="h-4 w-4 mr-1" />
            Your Data
          </TabsTrigger>
          <TabsTrigger value="vocabulary">
            <BookOpen className="h-4 w-4 mr-1" />
            Key Terms
          </TabsTrigger>
          <TabsTrigger value="report">
            <TrendingUp className="h-4 w-4 mr-1" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="space-y-6">
          {/* Development Panel - Only visible in dev mode */}
          {isDevelopment && (
            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    DEV
                  </Badge>
                  Development Testing Tools
                </CardTitle>
                <CardDescription>
                  Tools for testing the conversation facilitator with sample data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addSampleInsights(addInsight)}
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900/20"
                  >
                    Add Sample Insights ({state.insights.length} current)
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center">
                    This will populate realistic sample comments from the questionnaire for testing
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <DialogueFacilitator
            prompts={conversationPrompts}
            onNotesUpdate={handleNotesUpdate}
            onInsightCapture={handleInsightCapture}
            existingNotes={discussionNotes}
            isTogetherMode={isTogetherMode}
            existingInsights={state.insights}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Data Overview Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-blue/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Visible Work Load
                </CardTitle>
                <CardDescription>
                  The actual time spent on household tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{results.myVisiblePercentage}%</div>
                    <p className="text-sm text-muted-foreground">Your share of visible work</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(results.myVisibleTime / 60 * 10) / 10} hours per week
                    </p>
                  </div>
                  
                  {!isSingleAdult && (
                    <div className="flex justify-between text-sm">
                      <span>You: {results.myVisiblePercentage}%</span>
                      <span>Partner: {results.partnerVisiblePercentage}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-purple/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Mental Load
                </CardTitle>
                <CardDescription>
                  The cognitive work of planning and managing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{results.myMentalPercentage}%</div>
                    <p className="text-sm text-muted-foreground">Your share of mental load</p>
                  </div>
                  
                  {!isSingleAdult && (
                    <div className="flex justify-between text-sm">
                      <span>You: {results.myMentalPercentage}%</span>
                      <span>Partner: {results.partnerMentalPercentage}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Perception Gaps for Together Mode */}
          {isTogetherMode && hasPartnerData && results.perceptionGaps && (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-orange/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Different Perspectives
                </CardTitle>
                <CardDescription>
                  How you each see the workload distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded">
                      <h4 className="font-medium mb-2">Visible Work Gap</h4>
                      <p className="text-sm text-muted-foreground">
                        {Math.abs(results.perceptionGaps.myVisibleTimeGap)}% difference in how you see your contributions
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded">
                      <h4 className="font-medium mb-2">Mental Load Gap</h4>
                      <p className="text-sm text-muted-foreground">
                        {Math.abs(results.perceptionGaps.myMentalLoadGap)}% difference in mental load perceptions
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/5 rounded border border-primary/20">
                    <p className="text-sm text-primary">
                      <strong>Discussion Opportunity:</strong> These perception differences reveal important insights 
                      about invisible work and different values around household tasks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Research Context with Benchmarks */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Research Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Here's how your results compare to recent research on household task distribution:
                </p>
                
                {/* Research Comparisons */}
                <div className="space-y-3">
                  {(() => {
                    const hasChildren = state.householdSetup.children > 0;
                    const userGender = 'unknown' as 'women' | 'men' | 'unknown'; // TODO: Add gender field to household setup
                    const researchComparison = getResearchComparison(
                      results.myVisibleTime, 
                      results.myVisiblePercentage, 
                      userGender, 
                      hasChildren
                    );
                    
                    return (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/30 rounded border">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-sm mb-1">Your Time Load</h4>
                                <p className="text-xs text-muted-foreground">{researchComparison.timeComparison}</p>
                              </div>
                              <InfoButton 
                                variant="tooltip" 
                                tooltipContent="Based on UN Women global data: women average 4.3 hours/day on unpaid care work, men average 1.6 hours/day" 
                              />
                            </div>
                          </div>
                          
                          <div className="p-3 bg-muted/30 rounded border">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-sm mb-1">Your Share Percentage</h4>
                                <p className="text-xs text-muted-foreground">{researchComparison.percentageComparison}</p>
                              </div>
                              <InfoButton 
                                variant="tooltip" 
                                tooltipContent={hasChildren 
                                  ? "Research shows women perform ~80% of household tasks after having children (Régnier-Loilier, 2009)" 
                                  : "Global research shows significant gender gaps in unpaid care work distribution"} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Key Research Findings */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Related Research Findings:</h4>
                          <div className="space-y-1">
                            {researchComparison.relevantBenchmarks.slice(0, 2).map((benchmark) => (
                              <div key={benchmark.id} className="flex items-start justify-between text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                <div>
                                  <span className="font-medium">{benchmark.description}:</span> {benchmark.finding}
                                </div>
                                <InfoButton 
                                  variant="tooltip" 
                                  tooltipContent={`Source: ${benchmark.source} (${benchmark.year})`} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded border border-primary/20">
                  <strong>Important:</strong> These comparisons are contextual. What matters most is what feels fair and 
                  sustainable for your specific relationship and circumstances.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-6">
          <SharedVocabulary 
            highlightTerms={['mental load', 'invisible work', 'emotional labour']}
            showExamples={true}
          />
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          <ConversationReport
            results={results}
            assessmentData={state}
            insights={state.insights || []}
            discussionNotes={discussionNotes}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <Button onClick={handleNext} size="lg" className="px-8">
          Continue to Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Results;