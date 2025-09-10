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
import { calculatePersonLoad } from '@/lib/calculationUtils';
import { CalculatedResults, TaskResponse } from '@/types/assessment';
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
  const [activeTab, setActiveTab] = useState('conversation');
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

  // Calculate results using proper mental load formula
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

  const isSingleAdult = state.householdSetup.adults === 1;
  const isTogetherMode = state.householdSetup.assessmentMode === 'together';
  const hasPartnerData = state.partnerTaskResponses?.length;

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
        <h1 className="text-3xl font-bold mb-4">Understanding Your Household Work</h1>
        <p className="text-lg text-muted-foreground">
          {isTogetherMode 
            ? "Use this space to discuss your findings and plan next steps together"
            : "Reflect on these insights and consider how to discuss them with your household"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conversation">
            <MessageCircle className="h-4 w-4 mr-1" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BarChart3 className="h-4 w-4 mr-1" />
            Your Data
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
                    <p className="text-sm text-muted-foreground">
                      {isSingleAdult ? "Your visible work" : "Your share of visible work"}
                    </p>
                  </div>
                  
                  {!isSingleAdult && (
                    <div className="flex justify-between text-sm">
                      <span>Mine: {results.myVisiblePercentage}%</span>
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
                    <p className="text-sm text-muted-foreground">
                      {isSingleAdult ? "Your mental load" : "Your share of mental load"}
                    </p>
                  </div>
                  
                  {!isSingleAdult && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Mine: {results.myMentalPercentage}%</span>
                        <span>Partner: {results.partnerMentalPercentage}%</span>
                      </div>
                      
                      {/* Context for couples */}
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          {results.myMentalPercentage > 60 
                            ? "⚠️ You may be carrying a disproportionate mental load"
                            : results.myMentalPercentage < 40
                            ? "✓ Mental load appears fairly balanced"
                            : "✓ Mental load distribution looks balanced"
                          }
                        </p>
                      </div>
                    </>
                  )}
                  
                  {isSingleAdult && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Score: {results.myMentalLoad} - This reflects the cognitive burden from your household tasks. Higher scores indicate more mental effort required.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>


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
                    {isSingleAdult ? "Your Mental Load" : "My Mental Load"}
                  </h3>
                  <div className="text-3xl font-bold text-primary">
                    {results.myMentalLoad || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on burden and fairness ratings across all tasks
                  </p>
                  
                  {/* Mental Load Benchmark */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low (0-100)</span>
                      <span>Moderate (100-200)</span>
                      <span>High (200-300)</span>
                      <span>Very High (300+)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          results.myMentalLoad < 100 ? 'bg-green-500' :
                          results.myMentalLoad < 200 ? 'bg-yellow-500' :
                          results.myMentalLoad < 300 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((results.myMentalLoad / 400) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium">
                      {results.myMentalLoad < 100 ? '✓ Low mental load - manageable' :
                       results.myMentalLoad < 200 ? '⚠️ Moderate mental load - monitor stress' :
                       results.myMentalLoad < 300 ? '⚠️ High mental load - consider redistributing tasks' :
                       '🚨 Very high mental load - urgent attention needed'}
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