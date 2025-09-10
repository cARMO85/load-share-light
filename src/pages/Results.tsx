import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { DiscussionNotes } from '@/components/DiscussionNotes';
import { ConversationReport } from '@/components/ConversationReport';
import { SharedVocabulary } from '@/components/SharedVocabulary';
import { generateConversationPrompts } from '@/lib/conversationEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { allTaskLookup, physicalTaskLookup, cognitiveTaskLookup } from '@/data/allTasks';
import { calculatePersonLoad, calculateWMLI } from '@/lib/calculationUtils';
import { CalculatedResults, TaskResponse } from '@/types/assessment';
import HouseholdInsights from '@/components/HouseholdInsights';
import { WMLIBreakdown } from '@/components/WMLIBreakdown';
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
  const { state } = useAssessment();
  const [activeTab, setActiveTab] = useState('insights');
  const [discussionNotes, setDiscussionNotes] = useState<Record<string, string>>({});

  const calculateLoadFromResponses = (responses: TaskResponse[]) => {
    const result = calculatePersonLoad(responses, allTaskLookup);
    return {
      myVisibleLoad: result.myVisibleLoad,
      myMentalLoad: result.myMentalLoad,
      partnerVisibleLoad: result.partnerVisibleLoad,
      partnerMentalLoad: result.partnerMentalLoad,
      totalVisibleLoad: result.totalVisibleLoad,
      totalMentalLoad: result.totalMentalLoad,
      myVisiblePercentage: result.myVisiblePercentage,
      myMentalPercentage: result.myMentalPercentage,
      partnerVisiblePercentage: result.partnerVisiblePercentage,
      partnerMentalPercentage: result.partnerMentalPercentage
    };
  };

  const isSingleAdult = state.householdSetup.adults === 1;
  const isTogetherMode = state.householdSetup.assessmentMode === 'together';
  const hasPartnerData = state.partnerTaskResponses?.length;

  // Calculate WMLI and evidence-based insights
  const wmliResults = useMemo(() => {
    // If in together mode but no separate partner responses, split the combined responses
    if (isTogetherMode && (!state.partnerTaskResponses || state.partnerTaskResponses.length === 0)) {
      // Split combined responses into separate perspectives
      const myResponses = state.taskResponses.map(response => ({
        ...response,
        // Adjust share percentage to be from "my" perspective
        mySharePercentage: response.mySharePercentage || 50
      }));
      
      const partnerResponses = state.taskResponses.map(response => ({
        ...response,
        // Flip the perspective for partner - if I have 30%, partner has 70%
        mySharePercentage: 100 - (response.mySharePercentage || 50),
        // Flip assignment perspective
        assignment: response.assignment === 'me' ? 'partner' as const : 
                   response.assignment === 'partner' ? 'me' as const : 
                   'shared' as const
      }));
      
      return calculateWMLI(myResponses, allTaskLookup, partnerResponses);
    }
    
    return calculateWMLI(
      state.taskResponses,
      allTaskLookup,
      isTogetherMode ? state.partnerTaskResponses : undefined
    );
  }, [state.taskResponses, state.partnerTaskResponses, isTogetherMode]);

  // Calculate results using proper mental load formula (legacy compatibility)
  const results = useMemo(() => {
    const myCalculations = calculatePersonLoad(state.taskResponses, allTaskLookup);
    
    // For together mode, calculate partner's perspective if available
    let partnerCalculations = null;
    
    if (state.partnerTaskResponses?.length) {
      partnerCalculations = calculateLoadFromResponses(state.partnerTaskResponses);
    }

    return {
      ...myCalculations,
      partnerPerspectiveMyVisibleTime: partnerCalculations?.myVisibleTime,
      partnerPerspectiveMyMentalLoad: partnerCalculations?.myMentalLoad,
      partnerPerspectivePartnerVisibleTime: partnerCalculations?.partnerVisibleTime,
      partnerPerspectivePartnerMentalLoad: partnerCalculations?.partnerMentalLoad
    };
  }, [state.taskResponses, state.partnerTaskResponses]);


  // Generate conversation prompts based on results
  const conversationPrompts = useMemo(() => {
    return generateConversationPrompts(results, state);
  }, [results, state]);

  // Define steps for progress indicator
  const steps = [
    { id: 1, name: 'Household Setup', status: 'complete' as const },
    { id: 2, name: 'Task Assessment', status: 'complete' as const },
    { id: 3, name: 'Results', status: 'current' as const }
  ];

  const handleNext = () => {
    navigate('/');
  };

  const handleNotesUpdate = (promptId: string, notes: string) => {
    setDiscussionNotes(prev => ({ ...prev, [promptId]: notes }));
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
        <h1 className="text-3xl font-bold mb-4">
          {isSingleAdult ? "Your Household Work Assessment" : "Your Household Work Assessment"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isTogetherMode 
            ? "Explore your results together and use these insights to strengthen your partnership"
            : isSingleAdult 
              ? "Reflect on these insights about your household work patterns"
              : "Share these insights with your partner and plan improvements together"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="conversation">
            <MessageCircle className="h-4 w-4 mr-1" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Users className="h-4 w-4 mr-1" />
            {isSingleAdult ? "Your Data" : "Household Overview"}
          </TabsTrigger>
          <TabsTrigger value="wmli">
            <Brain className="h-4 w-4 mr-1" />
            WMLI Analysis
          </TabsTrigger>
          <TabsTrigger value="visible-vs-mental">
            <Clock className="h-4 w-4 mr-1" />
            Visible vs Mental
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
                    onClick={() => console.log('Demo functionality removed')}
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900/20"
                  >
                    Demo Button (Functionality Removed)
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center">
                    This will populate realistic sample comments from the questionnaire for testing
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <DiscussionNotes 
            notes={discussionNotes}
            isTogetherMode={isTogetherMode}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <HouseholdInsights 
            wmliResults={wmliResults}
            taskResponses={state.taskResponses}
            results={results}
            isSingleAdult={isSingleAdult}
          />
        </TabsContent>

        <TabsContent value="wmli" className="space-y-6">
          <WMLIBreakdown 
            wmliResults={wmliResults}
            taskResponses={state.taskResponses}
            isSingleAdult={isSingleAdult}
          />
        </TabsContent>

        <TabsContent value="visible-vs-mental" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invisible Mental Load vs Visible Time</CardTitle>
              <CardDescription>
                Understanding the difference between time spent doing tasks (visible) and the cognitive burden of managing them (mental load)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {isSingleAdult ? "Your Mental Load Analysis" : "My Mental Load Analysis"}
                    </h3>
                    <div className="text-3xl font-bold text-primary">
                      WMLI {wmliResults.myWMLI}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Research-based Weighted Mental Load Index
                    </p>
                    
                    {/* Evidence-Based Context */}
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium mb-2">Evidence-Based Assessment:</p>
                        <div className="space-y-1">
                          {wmliResults.myFlags.highSubjectiveStrain && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs">High burden on tasks you primarily own</span>
                            </div>
                          )}
                          {wmliResults.myFlags.fairnessRisk && (
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs">Unfairness concerns detected</span>
                            </div>
                          )}
                          {wmliResults.myFlags.equityPriority && (
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs">Priority for equity conversation</span>
                            </div>
                          )}
                          {!wmliResults.myFlags.highSubjectiveStrain && !wmliResults.myFlags.fairnessRisk && (
                            <div className="flex items-center gap-2 text-green-600">
                              <UserCheck className="h-4 w-4" />
                              <span className="text-xs">No major strain indicators detected</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          <strong>Interpretation:</strong> {wmliResults.interpretationContext}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Scores combine burden and fairness ratings weighted by responsibility. Population benchmarks will be established from pilot data.
                        </p>
                      </div>
                    </div>
                  
                  {!isSingleAdult && (
                    <>
                      <div className="text-sm">
                        <strong>Percentage of household mental load:</strong> {results.myMentalPercentage || 0}%
                      </div>
                      
                      {/* Visual percentage bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Mine</span>
                          <span>Partner</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div className="h-full flex">
                            <div 
                              className="bg-purple-500 transition-all duration-500" 
                              style={{ width: `${results.myMentalPercentage}%` }}
                            />
                            <div 
                              className="bg-purple-300" 
                              style={{ width: `${results.partnerMentalPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                          <span>{results.myMentalPercentage}%</span>
                          <span>{results.partnerMentalPercentage}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {isSingleAdult ? "Your Visible Work" : "My Visible Work"}
                  </h3>
                  <div className="text-3xl font-bold text-secondary">
                    {results.myVisibleLoad || 0} tasks
                  </div>
                   <p className="text-sm text-muted-foreground">
                     Your share of visible household tasks
                   </p>
                  
                  {!isSingleAdult && (
                    <>
                      <div className="text-sm">
                        <strong>Percentage of household visible work:</strong> {results.myVisiblePercentage || 0}%
                      </div>
                      
                      {/* Visual percentage bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Mine</span>
                          <span>Partner</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div className="h-full flex">
                            <div 
                              className="bg-blue-500 transition-all duration-500" 
                              style={{ width: `${results.myVisiblePercentage}%` }}
                            />
                            <div 
                              className="bg-blue-300" 
                              style={{ width: `${results.partnerVisiblePercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                          <span>{results.myVisiblePercentage}%</span>
                          <span>{results.partnerVisiblePercentage}%</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                    <strong>What this means:</strong> This is the actual time spent doing tasks - the visible work that's easy to see and measure.
                  </div>
                </div>
              </div>
              
              {isTogetherMode && results.partnerMentalLoad !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Partner's Mental Load</h3>
                    <div className="text-3xl font-bold text-primary">
                      {results.partnerMentalLoad}
                    </div>
                    <div className="text-sm">
                      <strong>Percentage:</strong> {results.partnerMentalPercentage}%
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Partner's Visible Time</h3>
                    <div className="text-3xl font-bold text-secondary">
                      {results.partnerVisibleLoad} tasks
                    </div>
                    <div className="text-sm">
                      <strong>Percentage:</strong> {results.partnerVisiblePercentage}%
                    </div>
                  </div>
                </div>
              )}
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
            insights={[]}
            discussionNotes={discussionNotes}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <Button onClick={handleNext} size="lg" className="px-8">
          Start New Assessment
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Results;