import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAssessment } from '@/context/AssessmentContext';
import { allTaskLookup } from '@/data/allTasks';
import { calculatePersonLoad, calculateWMLI } from '@/lib/calculationUtils';
import { 
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Brain,
  Clock,
  MessageCircle,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Plus,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { state, addDiscussionNote } = useAssessment();
  
  // Collapsible states
  const [openSections, setOpenSections] = useState({
    overview: true,
    drivers: false,
    comparison: false,
    intensity: false,
    nextSteps: false
  });

  // Action items state
  const [actionItems, setActionItems] = useState<Array<{id: string, text: string, owner: string, date: string}>>([]);
  const [summary, setSummary] = useState('');

  // Auto-open Next Steps section when notes are added
  React.useEffect(() => {
    if (summary.trim()) {
      setOpenSections(prev => ({ ...prev, nextSteps: true }));
    }
  }, [summary]);

  const isSingleAdult = state.householdSetup.adults === 1;
  const isTogetherMode = state.householdSetup.assessmentMode === 'together';

  // Calculate WMLI results
  const wmliResults = useMemo(() => {
    if (isTogetherMode && (!state.partnerTaskResponses || state.partnerTaskResponses.length === 0)) {
      const myResponses = state.taskResponses.map(response => ({
        ...response,
        mySharePercentage: response.mySharePercentage || 50
      }));
      
      const partnerResponses = state.taskResponses.map(response => ({
        ...response,
        mySharePercentage: 100 - (response.mySharePercentage || 50),
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

  // Calculate visible work shares
  const visibleResults = useMemo(() => {
    return calculatePersonLoad(state.taskResponses, allTaskLookup);
  }, [state.taskResponses]);

  // Status determination
  const getStatusInfo = () => {
    if (isSingleAdult) {
      return { status: 'Single Household', color: 'bg-blue-500', description: 'Individual assessment complete' };
    }

    const mentalGap = Math.abs((wmliResults.myWMLI_Share || 50) - 50);
    const hasHighBurden = wmliResults.myFlags.highSubjectiveStrain || wmliResults.partnerFlags?.highSubjectiveStrain;
    const hasFairnessRisk = wmliResults.myFlags.fairnessRisk || wmliResults.partnerFlags?.fairnessRisk;

    if (mentalGap < 10 && !hasHighBurden) {
      return { status: 'Balanced', color: 'bg-green-500', description: 'Mental load well distributed' };
    } else if (mentalGap <= 20 || (hasHighBurden && !hasFairnessRisk)) {
      return { status: 'Needs Conversation', color: 'bg-yellow-500', description: 'Some imbalance detected' };
    } else {
      return { status: 'Urgent Imbalance', color: 'bg-red-500', description: 'Significant disparity requiring attention' };
    }
  };

  // Enhanced hotspots with pain point analysis
  const getHotspots = () => {
    if (isSingleAdult) {
      // Individual: Show individual pain points (current logic)
      const taskScores = state.taskResponses
        .filter(r => !r.notApplicable && r.likertRating)
        .map(response => {
          const responsibility = response.mySharePercentage ? response.mySharePercentage / 100 : 0.5;
          const burden = response.likertRating!.burden;
          const fairness = response.likertRating!.fairness;
          const unfairness = (5 - fairness) / 4; // Convert to 0-1 scale
          const normalizedBurden = (burden - 1) / 4; // Convert to 0-1 scale
          
          const driverScore = responsibility * ((normalizedBurden + unfairness) / 2);
          
          const task = allTaskLookup[response.taskId];
          return {
            taskId: response.taskId,
            taskName: (task && 'title' in task) ? task.title : (task && 'task_name' in task) ? task.task_name : response.taskId,
            driverScore,
            responsibility,
            burden,
            fairness,
            type: 'individual' as const,
            tags: [
              ...(burden >= 4 && responsibility >= 0.6 ? ['High burden'] : []),
              ...(fairness <= 2 && responsibility >= 0.6 ? ['Unfairness concern'] : [])
            ]
          };
        })
        .sort((a, b) => b.driverScore - a.driverScore)
        .slice(0, 3);
      
      return taskScores;
    } else {
      // Couples: Enhanced pain point analysis
      const partnerResponses = state.partnerTaskResponses || [];
      const imbalances = state.taskResponses
        .filter(r => !r.notApplicable)
        .map(myResponse => {
          const partnerResponse = partnerResponses.find(pr => pr.taskId === myResponse.taskId);
          if (!partnerResponse) return null;
          
          const getResponsibilityShare = (response: any) => {
            if (response.assignment === 'me') return 1.0;
            if (response.assignment === 'partner') return 0.0;
            if (response.assignment === 'shared' && response.mySharePercentage) {
              return response.mySharePercentage / 100;
            }
            return 0.5;
          };

          const myResponsibility = getResponsibilityShare(myResponse);
          const partnerResponsibility = getResponsibilityShare(partnerResponse);
          const responsibilityGap = Math.abs(myResponsibility - partnerResponsibility);
          
          let burdenGap = 0;
          let fairnessGap = 0;
          let myBurden = 0;
          let partnerBurden = 0;
          let myFairness = 0;
          let partnerFairness = 0;
          
          if (myResponse.likertRating && partnerResponse.likertRating) {
            myBurden = myResponse.likertRating.burden;
            partnerBurden = partnerResponse.likertRating.burden;
            burdenGap = Math.abs(myBurden - partnerBurden);
            
            myFairness = myResponse.likertRating.fairness;
            partnerFairness = partnerResponse.likertRating.fairness;
            fairnessGap = Math.abs(myFairness - partnerFairness);
          }
          
          // Enhanced categorization logic
          const getImbalanceType = () => {
            const highResponsibility = Math.max(myResponsibility, partnerResponsibility) > 0.7;
            const highBurden = Math.max(myBurden, partnerBurden) >= 4;
            
            if (highResponsibility && highBurden) {
              return 'High Responsibility & High Burden';
            } else if (fairnessGap > 1.5) {
              return 'Perception Mismatch';
            } else if (responsibilityGap > 0.3 && burdenGap < 1) {
              return 'Silent Load';
            } else if (responsibilityGap > 0.3) {
              return 'Responsibility Gap';
            } else if (burdenGap > 1) {
              return 'Burden Gap';
            }
            return 'Minor Imbalance';
          };

          const getKeyInsight = () => {
            const type = getImbalanceType();
            const whoDoesMore = myResponsibility > partnerResponsibility ? 'You' : 'Your partner';
            const respPerc = Math.round(Math.max(myResponsibility, partnerResponsibility) * 100);
            
            switch (type) {
              case 'High Responsibility & High Burden':
                return `${whoDoesMore} carry ${respPerc}% responsibility and report high burden (${whoDoesMore === 'You' ? myBurden : partnerBurden}/5), while your partner ${whoDoesMore === 'You' ? 'may not fully recognize' : 'reports lower burden'}. This creates hidden stress.`;
              
              case 'Perception Mismatch':
                return `Both partners share responsibility but have very different fairness perceptions (You=${myFairness}/5, Partner=${partnerFairness}/5). This gap could lead to resentment.`;
              
              case 'Silent Load':
                return `${whoDoesMore} handle ${respPerc}% responsibility, but both rate burden similarly. The planning and mental work may be invisible to your partner.`;
              
              case 'Responsibility Gap':
                return `Significant responsibility imbalance (You=${Math.round(myResponsibility * 100)}%, Partner=${Math.round(partnerResponsibility * 100)}%) without major burden differences.`;
              
              case 'Burden Gap':
                return `Similar responsibility levels but different burden experiences (You=${myBurden}/5, Partner=${partnerBurden}/5). May indicate task complexity differences.`;
              
              default:
                return `Minor differences in how this task is perceived and handled between partners.`;
            }
          };

          const getConversationPrompt = () => {
            const type = getImbalanceType();
            
            switch (type) {
              case 'High Responsibility & High Burden':
                return "Would you feel comfortable swapping this task occasionally to share the planning work, or finding ways to make the invisible parts more visible?";
              
              case 'Perception Mismatch':
                return "Do you both agree this task is fairly recognized and appreciated, even if one person does more of it? What would help align your perspectives?";
              
              case 'Silent Load':
                return "Could you use a shared list, reminder system, or brief check-ins to make the planning and decision-making parts of this task more visible?";
              
              case 'Responsibility Gap':
                return "How do you both feel about the current distribution? Would you like to experiment with a more balanced approach?";
              
              case 'Burden Gap':
                return "Since you experience this task differently, what would help make it feel more manageable for whoever finds it more challenging?";
              
              default:
                return "How could you both work together to maintain good balance in this area?";
            }
          };
          
          const imbalanceScore = responsibilityGap * 3 + (burdenGap + fairnessGap) / 10;
          const task = allTaskLookup[myResponse.taskId];
          
          return {
            taskId: myResponse.taskId,
            taskName: (task && 'title' in task) ? task.title : (task && 'task_name' in task) ? task.task_name : myResponse.taskId,
            imbalanceScore,
            myResponsibility,
            partnerResponsibility,
            myBurden,
            partnerBurden,
            myFairness,
            partnerFairness,
            whoDoesMore: myResponsibility > partnerResponsibility ? 'me' : 'partner',
            type: 'imbalance' as const,
            imbalanceType: getImbalanceType(),
            keyInsight: getKeyInsight(),
            conversationPrompt: getConversationPrompt(),
            tags: [getImbalanceType()]
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null && item.imbalanceScore > 0.1)
        .sort((a, b) => b.imbalanceScore - a.imbalanceScore)
        .slice(0, 3);
      
      return imbalances;
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (section: string) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const statusInfo = getStatusInfo();
  const hotspots = getHotspots();

  const ConversationPrompts = ({ 
    taskName, 
    isCouple = false, 
    imbalanceData 
  }: { 
    taskName: string; 
    isCouple?: boolean;
    imbalanceData?: any;
  }) => {
    const [noteText, setNoteText] = useState('');
    const taskId = `task_${taskName.toLowerCase().replace(/\s+/g, '_')}`;
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4 mr-1" />
            Talk about this
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Discussion: {taskName}</DialogTitle>
            <DialogDescription>
              {isCouple 
                ? 'Use these prompts to discuss this imbalance with your partner'
                : 'Reflection prompts for managing this task'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isCouple && imbalanceData ? (
              // Couple-focused prompts based on imbalance data
              <>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    "I noticed we have different levels of responsibility for {taskName}. 
                    {imbalanceData.whoDoesMore === 'me' 
                      ? " I'm handling more of this - how do you see it?"
                      : " You're handling more of this - how does that feel for you?"
                    }"
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    "How could we redistribute {taskName} so it feels more balanced for both of us?"
                  </p>
                </div>
                {Math.abs(imbalanceData.myBurden - imbalanceData.partnerBurden) > 1 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      "We seem to experience different levels of burden with {taskName}. 
                      Can we talk about what makes this feel {imbalanceData.myBurden > imbalanceData.partnerBurden ? 'harder for me' : 'easier for me'}?"
                    </p>
                  </div>
                )}
                {Math.abs(imbalanceData.myFairness - imbalanceData.partnerFairness) > 1 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      "We have different perceptions about fairness around {taskName}. 
                      What would help us both feel better about how this is handled?"
                    </p>
                  </div>
                )}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    "What support would help the person doing {taskName} feel more appreciated?"
                  </p>
                </div>
              </>
            ) : isCouple ? (
              // General couple prompts
              <>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">"How do you feel about how we currently handle {taskName}?"</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">"What would make {taskName} feel more balanced between us?"</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">"Are there specific aspects of {taskName} that feel overwhelming or underappreciated?"</p>
                </div>
              </>
            ) : (
              // Individual/single prompts
              <>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">"What makes {taskName} feel particularly burdensome right now?"</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">"What systems or support could help make {taskName} more manageable?"</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">"How could I simplify or delegate parts of {taskName}?"</p>
                </div>
              </>
            )}
            
            {/* Note-taking area */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Discussion Notes</Label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Capture key insights from your discussion about this task..."
                className="min-h-[100px]"
              />
              <Button 
                onClick={() => {
                  if (noteText.trim()) {
                    addDiscussionNote(taskId, noteText.trim());
                    setNoteText('');
                    // Auto-open the Next Steps section when notes are added
                    setOpenSections(prev => ({ ...prev, nextSteps: true }));
                  }
                }}
                disabled={!noteText.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Save Discussion Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
           <nav className="flex items-center justify-between">
             <div className="flex items-center space-x-6 text-sm">
               <button onClick={() => scrollToSection('overview')} className="hover:text-primary transition-colors">
                 Big Numbers
               </button>
               <button onClick={() => scrollToSection('drivers')} className="hover:text-primary transition-colors">
                 Imbalances
               </button>
               <button onClick={() => scrollToSection('intensity')} className="hover:text-primary transition-colors">
                 Mental Load
               </button>
               <button onClick={() => scrollToSection('next-steps')} className="hover:text-primary transition-colors">
                 Next Steps
               </button>
             </div>
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => navigate('/')}
               className="text-sm"
             >
               Home
             </Button>
           </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Your Household Work Assessment</h1>
          <p className="text-lg text-muted-foreground">
            {isTogetherMode 
              ? "Explore your results together and strengthen your partnership"
              : isSingleAdult 
                ? "Insights about your household work patterns"
                : "Share these insights with your partner"
            }
          </p>
        </div>

        {/* 1. Overview Card */}
        <Card id="overview" className="border-2">
          <Collapsible open={openSections.overview} onOpenChange={() => toggleSection('overview')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Big Numbers & Status
                    </CardTitle>
                    <CardDescription>Your key metrics at a glance</CardDescription>
                  </div>
                  {openSections.overview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {isSingleAdult ? (
                  // Single Adult View
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <div className="text-2xl font-bold text-blue-600">{visibleResults.myVisiblePercentage}%</div>
                      <div className="text-sm font-medium">Your visible time share</div>
                      <div className="text-xs text-muted-foreground mt-1">Individual household</div>
                    </div>
                    
                    <div className={`text-center p-4 rounded-lg ${
                      wmliResults.myWMLI_Intensity <= 33 ? 'bg-green-50 dark:bg-green-950/20' :
                      wmliResults.myWMLI_Intensity <= 66 ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                      'bg-red-50 dark:bg-red-950/20'
                    }`}>
                      <div className={`text-2xl font-bold ${
                        wmliResults.myWMLI_Intensity <= 33 ? 'text-green-600' :
                        wmliResults.myWMLI_Intensity <= 66 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{wmliResults.myWMLI_Intensity}/100</div>
                      <div className="text-sm font-medium">Your mental load intensity</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {wmliResults.myWMLI_Intensity <= 33 ? 'light subjective workload' :
                         wmliResults.myWMLI_Intensity <= 66 ? 'moderate mental strain' :
                         'high mental burden'}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <div className="text-2xl font-bold text-blue-600">{wmliResults.myWMLI_Share || 50}%</div>
                      <div className="text-sm font-medium">Your share of household mental load</div>
                      <div className="text-xs text-muted-foreground mt-1">Individual household</div>
                    </div>
                  </div>
                ) : (
                  // Couple View - Both Partners' Results
                  <div className="space-y-6">
                    {/* Household Status */}
                    <div className="text-center p-6 rounded-lg border-2 border-dashed border-muted-foreground/30">
                      <h3 className="text-lg font-semibold mb-2">Household Balance Status</h3>
                      {(() => {
                        const visibleGap = Math.abs(visibleResults.myVisiblePercentage - 50);
                        const mentalGap = Math.abs((wmliResults.myWMLI_Share || 50) - 50);
                        const avgGap = (visibleGap + mentalGap) / 2;
                        
                        if (avgGap <= 8) {
                          return (
                            <div className="text-green-700">
                              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                              <p className="text-lg font-medium">Well Balanced Partnership</p>
                              <p className="text-sm text-muted-foreground">Both partners carry roughly equal shares of household work</p>
                            </div>
                          );
                        } else if (avgGap <= 20) {
                          return (
                            <div className="text-amber-700">
                              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                              <p className="text-lg font-medium">Some Imbalance Present</p>
                              <p className="text-sm text-muted-foreground">One partner may be carrying more load - worth discussing</p>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-red-700">
                              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                              <p className="text-lg font-medium">Significant Imbalance</p>
                              <p className="text-sm text-muted-foreground">Workload distribution needs immediate attention</p>
                            </div>
                          );
                        }
                      })()}
                    </div>

                    {/* Both Partners' Individual Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Partner 1 Scores */}
                      <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium text-blue-900">Partner 1 (Assessment Taker)</h4>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="text-center p-3 rounded bg-blue-100">
                            <div className="text-xl font-bold text-blue-700">{visibleResults.myVisiblePercentage}%</div>
                            <div className="text-xs">Visible work share</div>
                          </div>
                          <div className="text-center p-3 rounded bg-blue-100">
                            <div className="text-xl font-bold text-blue-700">{wmliResults.myWMLI_Share || 50}%</div>
                            <div className="text-xs">Mental load share</div>
                          </div>
                          <div className="text-center p-3 rounded bg-blue-100">
                            <div className="text-xl font-bold text-blue-700">{wmliResults.myWMLI_Intensity}/100</div>
                            <div className="text-xs">Mental load intensity</div>
                          </div>
                        </div>
                      </div>

                      {/* Partner 2 Scores */}
                      <div className="p-4 rounded-lg bg-orange-50/50 border border-orange-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5 text-orange-600" />
                          <h4 className="font-medium text-orange-900">Partner 2</h4>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="text-center p-3 rounded bg-orange-100">
                            <div className="text-xl font-bold text-orange-700">{100 - visibleResults.myVisiblePercentage}%</div>
                            <div className="text-xs">Visible work share</div>
                          </div>
                          <div className="text-center p-3 rounded bg-orange-100">
                            <div className="text-xl font-bold text-orange-700">{100 - (wmliResults.myWMLI_Share || 50)}%</div>
                            <div className="text-xs">Mental load share</div>
                          </div>
                          <div className="text-center p-3 rounded bg-orange-100">
                            <div className="text-xl font-bold text-orange-700">{wmliResults.partnerWMLI_Intensity || 50}/100</div>
                            <div className="text-xs">Mental load intensity</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Household Summary */}
                    <div className="p-4 rounded-lg bg-purple-50/50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <h4 className="font-medium text-purple-900">Household Summary</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium mb-2">Work Distribution Balance</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Visible work gap:</span>
                              <span className={Math.abs(visibleResults.myVisiblePercentage - 50) <= 10 ? 'text-green-600' : 'text-amber-600'}>
                                {Math.abs(visibleResults.myVisiblePercentage - 50)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mental load gap:</span>
                              <span className={Math.abs((wmliResults.myWMLI_Share || 50) - 50) <= 10 ? 'text-green-600' : 'text-amber-600'}>
                                {Math.abs((wmliResults.myWMLI_Share || 50) - 50)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-2">Household Stress Level</div>
                          {(() => {
                            const myIntensity = wmliResults.myWMLI_Intensity;
                            const partnerIntensity = wmliResults.partnerWMLI_Intensity || 0;
                            const avgIntensity = (myIntensity + partnerIntensity) / 2;
                            const visibleGap = Math.abs(visibleResults.myVisiblePercentage - 50);
                            const mentalGap = Math.abs((wmliResults.myWMLI_Share || 50) - 50);
                            const avgGap = (visibleGap + mentalGap) / 2;
                            
                            let adjustedStress = avgIntensity;
                            if (avgGap > 20) {
                              adjustedStress = Math.min(100, avgIntensity + 25);
                            } else if (avgGap > 10) {
                              adjustedStress = Math.min(100, avgIntensity + 15);
                            }
                            
                            let stressLevel = '';
                            let stressColor = '';
                            if (adjustedStress <= 30) {
                              stressLevel = 'Low';
                              stressColor = 'text-green-600';
                            } else if (adjustedStress <= 60) {
                              stressLevel = 'Moderate';
                              stressColor = 'text-yellow-600';
                            } else {
                              stressLevel = 'High';
                              stressColor = 'text-red-600';
                            }
                            
                            return (
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Overall stress:</span>
                                  <span className={stressColor}>{stressLevel}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Based on partner intensity levels and workload balance
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Partnership Insight */}
                    <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Partnership Analysis</h4>
                          <p className="text-sm text-gray-800">
                            {(() => {
                              const visibleDiff = visibleResults.myVisiblePercentage - 50;
                              const mentalDiff = (wmliResults.myWMLI_Share || 50) - 50;
                              
                              if (Math.abs(visibleDiff) <= 8 && Math.abs(mentalDiff) <= 8) {
                                return "Both partners contribute fairly equally to household work. This balanced partnership is associated with higher relationship satisfaction and lower stress for both partners.";
                              } else if (visibleDiff > 15 && mentalDiff > 15) {
                                return "Partner 1 is carrying significantly more of both visible and mental work. The partnership may benefit from redistributing some responsibilities to prevent burnout.";
                              } else if (visibleDiff < -15 && mentalDiff < -15) {
                                return "Partner 2 is handling most of the household work. Their contribution should be acknowledged and responsibilities could be redistributed for better balance.";
                              } else if (Math.abs(visibleDiff - mentalDiff) > 15) {
                                return "There's a mismatch between who does the work and who manages it. The partner doing less visible work could take on more of the planning and organizing.";
                              } else {
                                return "The partnership shows some imbalance. Regular check-ins about household responsibilities can help maintain fairness and prevent resentment over time.";
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Chip & Evidence Flags */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${statusInfo.color} text-white px-4 py-2 text-sm`}>
                        {statusInfo.status === 'Balanced' && <CheckCircle className="h-4 w-4 mr-1" />}
                        {statusInfo.status === 'Needs Conversation' && <MessageCircle className="h-4 w-4 mr-1" />}
                        {statusInfo.status === 'Urgent Imbalance' && <AlertTriangle className="h-4 w-4 mr-1" />}
                        {statusInfo.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{statusInfo.description}</span>
                    </div>
                  </div>

                  {/* Prominent Evidence Flags */}
                  {(wmliResults.myFlags.highSubjectiveStrain || wmliResults.myFlags.fairnessRisk || wmliResults.myFlags.equityPriority) && (
                    <div className="flex justify-center">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {wmliResults.myFlags.highSubjectiveStrain && (
                          <Badge variant="destructive" className="px-3 py-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            High Subjective Strain
                          </Badge>
                        )}
                        {wmliResults.myFlags.fairnessRisk && (
                          <Badge variant="outline" className="border-orange-500 text-orange-600 px-3 py-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            High Equity Risk
                          </Badge>
                        )}
                        {wmliResults.myFlags.equityPriority && (
                          <Badge variant="outline" className="border-purple-500 text-purple-600 px-3 py-1">
                            Equity Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 2. Top 3 Hotspots/Imbalances */}
        <Card id="drivers" className="border-2">
          <Collapsible open={openSections.drivers} onOpenChange={() => toggleSection('drivers')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {isSingleAdult ? 'Tasks adding most to your mental load' : 'Biggest imbalances between partners'}
                    </CardTitle>
                    <CardDescription>
                      {isSingleAdult 
                        ? 'Areas of highest burden that might need attention'
                        : 'Tasks where the workload distribution needs the most discussion'
                      }
                    </CardDescription>
                  </div>
                  {openSections.drivers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {hotspots.map((hotspot, index) => (
                    <div key={hotspot.taskId} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Task Header */}
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{index + 1} {hotspot.taskName}</span>
                            {hotspot.type === 'imbalance' ? (
                              <Badge variant="outline" className="text-xs">
                                {hotspot.imbalanceType}
                              </Badge>
                            ) : (
                              hotspot.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            )}
                          </div>
                          
                          {/* Key Insight */}
                          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-blue-900 mb-1">Key Insight</div>
                            <p className="text-sm text-blue-800">
                              {hotspot.type === 'imbalance' ? hotspot.keyInsight : (() => {
                                // Individual view insight
                                if (hotspot.burden >= 4) {
                                  return `This task feels very burdensome (rated ${hotspot.burden}/5 for difficulty) and you handle ${Math.round(hotspot.responsibility * 100)}% of it. This high combination may be contributing to mental load strain.`;
                                } else {
                                  return `This task has high impact on your mental load with you responsible for ${Math.round(hotspot.responsibility * 100)}% and burden rating of ${hotspot.burden}/5. ${hotspot.fairness <= 2 ? 'Additionally, it feels underappreciated.' : ''}`;
                                }
                              })()}
                            </p>
                          </div>

                          {/* Suggested Conversation Prompt */}
                          <div className="p-3 bg-green-50/50 rounded-lg border border-green-200">
                            <div className="text-sm font-medium text-green-900 mb-1">Suggested Conversation Prompt</div>
                            <p className="text-sm text-green-800 italic">
                              "{hotspot.type === 'imbalance' ? hotspot.conversationPrompt : (() => {
                                // Individual prompts
                                if (hotspot.burden >= 4 && hotspot.responsibility >= 0.6) {
                                  return "What support systems or tools could help make this task feel more manageable? Could parts of it be simplified or delegated?";
                                } else if (hotspot.fairness <= 2) {
                                  return "How could the value and effort of this task be better recognized? What would make it feel more appreciated?";
                                } else {
                                  return "What changes would help reduce the mental load of this task while maintaining its quality?";
                                }
                              })()}"
                            </p>
                          </div>

                          {/* Additional Context for Couples */}
                          {hotspot.type === 'imbalance' && (
                            <div className="text-sm text-muted-foreground mt-2 space-y-1">
                              <div className="flex justify-between items-center">
                                <span>You: <strong>{Math.round(hotspot.myResponsibility * 100)}%</strong> responsibility</span>
                                <span>Partner: <strong>{Math.round(hotspot.partnerResponsibility * 100)}%</strong> responsibility</span>
                              </div>
                              {hotspot.myBurden > 0 && (
                                <div className="flex justify-between items-center">
                                  <span>You rate burden: <strong>{hotspot.myBurden}/5</strong></span>
                                  <span>Partner rates burden: <strong>{hotspot.partnerBurden}/5</strong></span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <ConversationPrompts 
                          taskName={hotspot.taskName} 
                          isCouple={!isSingleAdult}
                          imbalanceData={hotspot.type === 'imbalance' ? hotspot : undefined}
                        />
                      </div>
                    </div>
                  ))}
                  {hotspots.length === 0 && (
                    <div className="py-8 space-y-4">
                      {isSingleAdult ? (
                        <div className="text-center text-muted-foreground">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                          <p>No significant hotspots detected. Your workload appears well-managed!</p>
                        </div>
                      ) : (() => {
                        // Enhanced positive reinforcement for couples
                        const partnerResponses = state.partnerTaskResponses || [];
                        const hasMinorIssues = state.taskResponses
                          .filter(r => !r.notApplicable)
                          .some(myResponse => {
                            const partnerResponse = partnerResponses.find(pr => pr.taskId === myResponse.taskId);
                            if (!partnerResponse) return false;
                            
                            const getResponsibilityShare = (response: any) => {
                              if (response.assignment === 'me') return 1.0;
                              if (response.assignment === 'partner') return 0.0;
                              if (response.assignment === 'shared' && response.mySharePercentage) {
                                return response.mySharePercentage / 100;
                              }
                              return 0.5;
                            };

                            const myResp = getResponsibilityShare(myResponse);
                            const partnerResp = getResponsibilityShare(partnerResponse);
                            const respGap = Math.abs(myResp - partnerResp);
                            
                            let burdenGap = 0;
                            if (myResponse.likertRating && partnerResponse.likertRating) {
                              burdenGap = Math.abs(myResponse.likertRating.burden - partnerResponse.likertRating.burden);
                            }
                            
                            return respGap > 0.15 || burdenGap > 0.5;
                          });

                        return (
                          <div className="space-y-4">
                            <div className="text-center mb-6">
                              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                              <p className="text-lg font-medium text-green-800">Excellent Partnership Balance!</p>
                              <p className="text-muted-foreground">You and your partner show strong alignment on household responsibilities.</p>
                            </div>
                            
                            {/* Maintenance Suggestions */}
                            <div className="p-4 bg-green-50/30 rounded-lg border border-green-200">
                              <div className="flex items-start gap-3">
                                <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-green-800 mb-2">Maintaining Your Balance</h4>
                                  <div className="text-sm text-green-700 space-y-1">
                                    <p>• <strong>Regular Check-ins:</strong> Consider a brief monthly conversation to spot changes before they become issues</p>
                                    <p>• <strong>Appreciate Efforts:</strong> Continue recognizing each other's contributions, both visible and invisible</p>
                                    <p>• <strong>Stay Flexible:</strong> Be ready to adjust when life circumstances change (work, health, family)</p>
                                    {hasMinorIssues && (
                                      <p>• <strong>Fine-tune Together:</strong> Some small differences exist - these are normal and can be great discussion points</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Conversation Starter for Maintenance */}
                            <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-200">
                              <div className="text-sm font-medium text-blue-900 mb-1">Monthly Check-in Prompt</div>
                              <p className="text-sm text-blue-800 italic">
                                "How are we both feeling about our household balance lately? Is there anything that's shifted or could be tweaked?"
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>


        {/* 4. Mental Load Intensity */}
        <Card id="intensity" className="border-2">
          <Collapsible open={openSections.intensity} onOpenChange={() => toggleSection('intensity')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                     <CardTitle className="flex items-center gap-2">
                       <Brain className="h-5 w-5" />
                       Mental Load Intensity Explanation
                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                         <HelpCircle className="h-4 w-4" />
                       </Button>
                    </CardTitle>
                    <CardDescription>Understanding your mental workload level</CardDescription>
                  </div>
                  {openSections.intensity ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {isSingleAdult ? (
                  // Single Adult - Original gauge view
                  <>
                    <div className="text-center space-y-4">
                      <div className="relative w-48 h-24 mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-t-full"></div>
                        <div 
                          className="absolute w-1 h-12 bg-primary rounded-full origin-bottom"
                          style={{
                            left: '50%',
                            bottom: '0',
                            transform: `translateX(-50%) rotate(${(wmliResults.myWMLI_Intensity - 50) * 1.8}deg)`,
                            transformOrigin: 'center bottom'
                          }}
                        ></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-primary">{wmliResults.myWMLI_Intensity}/100</div>
                        <div className="text-sm text-muted-foreground">
                          {wmliResults.myWMLI_Intensity <= 30 ? 'Light subjective workload' :
                           wmliResults.myWMLI_Intensity <= 60 ? 'Moderate subjective workload' :
                           'Heavy subjective workload'}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Couple - Side by side comparison
                  <>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">Mental Load Intensity Comparison</h3>
                      <p className="text-sm text-muted-foreground">How heavy the mental load feels for each partner</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Your Intensity */}
                      <div className="text-center space-y-4">
                        <h4 className="font-medium text-blue-900">Your Mental Load Intensity</h4>
                        <div className="relative w-48 h-24 mx-auto">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-t-full"></div>
                          <div 
                            className="absolute w-1 h-12 bg-blue-600 rounded-full origin-bottom"
                            style={{
                              left: '50%',
                              bottom: '0',
                              transform: `translateX(-50%) rotate(${(wmliResults.myWMLI_Intensity - 50) * 1.8}deg)`,
                              transformOrigin: 'center bottom'
                            }}
                          ></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full"></div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-blue-600">{wmliResults.myWMLI_Intensity}/100</div>
                          <div className={`text-sm font-medium ${
                            wmliResults.myWMLI_Intensity <= 30 ? 'text-green-600' :
                            wmliResults.myWMLI_Intensity <= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {wmliResults.myWMLI_Intensity <= 30 ? 'Light subjective workload' :
                             wmliResults.myWMLI_Intensity <= 60 ? 'Moderate subjective workload' :
                             'Heavy subjective workload'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Partner Intensity */}
                      <div className="text-center space-y-4">
                        <h4 className="font-medium text-orange-900">Partner's Mental Load Intensity</h4>
                        <div className="relative w-48 h-24 mx-auto">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-t-full"></div>
                          <div 
                            className="absolute w-1 h-12 bg-orange-600 rounded-full origin-bottom"
                            style={{
                              left: '50%',
                              bottom: '0',
                              transform: `translateX(-50%) rotate(${((wmliResults.partnerWMLI_Intensity || 50) - 50) * 1.8}deg)`,
                              transformOrigin: 'center bottom'
                            }}
                          ></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-600 rounded-full"></div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-orange-600">{wmliResults.partnerWMLI_Intensity || 50}/100</div>
                          <div className={`text-sm font-medium ${
                            (wmliResults.partnerWMLI_Intensity || 50) <= 30 ? 'text-green-600' :
                            (wmliResults.partnerWMLI_Intensity || 50) <= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(wmliResults.partnerWMLI_Intensity || 50) <= 30 ? 'Light subjective workload' :
                             (wmliResults.partnerWMLI_Intensity || 50) <= 60 ? 'Moderate subjective workload' :
                             'Heavy subjective workload'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Comparison Insight */}
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 mt-6">
                      <div className="text-center">
                        <h4 className="font-medium text-blue-900 mb-2">Household Intensity Analysis</h4>
                        <p className="text-sm text-blue-800">
                          {(() => {
                            const myIntensity = wmliResults.myWMLI_Intensity;
                            const partnerIntensity = wmliResults.partnerWMLI_Intensity || 50;
                            const gap = Math.abs(myIntensity - partnerIntensity);
                            
                            if (gap <= 10) {
                              return "Both partners experience similar levels of mental load intensity - good alignment in how burdensome household tasks feel.";
                            } else if (myIntensity > partnerIntensity) {
                              return `You experience ${gap} points higher intensity than your partner. Consider discussing whether some responsibilities could be redistributed.`;
                            } else {
                              return `Your partner experiences ${gap} points higher intensity than you. They may benefit from support or task redistribution.`;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Simplified Interpretation */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <strong>Mental Load Intensity (0–100):</strong> This score reflects how heavy {isSingleAdult ? 'your' : 'each partner\'s'} share of invisible household work feels — higher = more mental strain.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Technical: Average subjective workload across tasks (burden + unfairness, weighted by responsibility).
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                      <div className="font-medium">0–30</div>
                      <div>Light</div>
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                      <div className="font-medium">31–60</div>
                      <div>Moderate</div>
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
                      <div className="font-medium">61–100</div>
                      <div>Heavy</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p><strong>Temporary pilot thresholds</strong></p>
                    <p>Will be replaced with real population benchmarks after research validation</p>
                  </div>
                </div>

                {/* Detailed Definitions Tooltip */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium hover:text-primary">
                      <HelpCircle className="h-4 w-4 inline mr-1" />
                      Understanding Mental Load Metrics
                    </summary>
                    <div className="mt-3 space-y-2 text-xs text-muted-foreground pl-4">
                      <p><strong>Mental Load Share (%):</strong> Which partner carries what proportion of the household's total mental load.</p>
                      <p><strong>Equity rule of thumb:</strong> Balanced bands: 40–60% each. Outside 60% signals potential inequity.</p>
                      <p><strong>Evidence flags:</strong> Research-backed indicators of workload strain and fairness concerns.</p>
                    </div>
                  </details>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 5. Next Steps */}
        <Card id="next-steps" className="border-2">
          <Collapsible open={openSections.nextSteps} onOpenChange={() => toggleSection('nextSteps')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Next Steps
                      {summary.trim() && (
                        <Badge variant="secondary" className="ml-2">
                          Has notes
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Action planning and follow-up</CardDescription>
                  </div>
                  {openSections.nextSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Positive Framing First */}
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">What's Working Well</h4>
                      <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        {statusInfo.status === 'Balanced' && (
                          <p>• Your household shows good balance in mental load distribution</p>
                        )}
                        {wmliResults.myWMLI_Intensity <= 33 && (
                          <p>• You're managing your mental load without excessive strain</p>
                        )}
                        {hotspots.length === 0 && (
                          <p>• No major hotspots detected in your household work patterns</p>
                        )}
                        {!wmliResults.myFlags.highSubjectiveStrain && (
                          <p>• Your current workload feels manageable and sustainable</p>
                        )}
                        {Math.abs(visibleResults.myVisiblePercentage - 50) <= 15 && (
                          <p>• Time-based tasks are reasonably shared between partners</p>
                        )}
                        <p>• Taking this assessment shows commitment to household equity</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pre-populated Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-medium">Recommended Actions</h4>
                  
                  {/* Evidence-based suggestions */}
                  <div className="space-y-3">
                    {hotspots.length > 0 && (
                      <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <div className="text-sm font-medium mb-2">Based on your hotspots:</div>
                        <div className="text-sm space-y-1">
                          {hotspots.slice(0, 2).map((hotspot, index) => (
                            <div key={index}>• Try sharing {hotspot.taskName.toLowerCase()} responsibilities</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {wmliResults.myFlags.fairnessRisk && (
                      <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                        <div className="text-sm">• Revisit acknowledgment and appreciation for household decisions</div>
                      </div>
                    )}
                    
                    {(wmliResults.myWMLI_Share || 50) > 60 && (
                      <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                        <div className="text-sm">• Consider redistributing planning and monitoring tasks</div>
                      </div>
                    )}
                  </div>

                  {/* Action Items */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Your Action Items</h5>
                    {actionItems.length > 0 && (
                      <div className="space-y-2">
                        {actionItems.map(item => (
                          <div key={item.id} className="p-3 border rounded-lg">
                            <div className="text-sm">{item.text}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Owner: {item.owner} | Due: {item.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Action Item
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Set Check-in
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Discussion Notes Display */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    Discussion Notes
                    {Object.keys(state.discussionNotes || {}).length > 0 && (
                      <Badge variant="secondary">
                        {Object.keys(state.discussionNotes || {}).length} task{Object.keys(state.discussionNotes || {}).length !== 1 ? 's' : ''} discussed
                      </Badge>
                    )}
                  </h4>
                  
                  {Object.keys(state.discussionNotes || {}).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(state.discussionNotes || {}).map(([taskId, note]) => (
                        <div key={taskId} className="p-3 border rounded-lg bg-muted/30">
                          <div className="text-sm font-medium mb-1 capitalize">
                            {taskId.replace('task_', '').replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">{note}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No discussion notes yet</p>
                      <p className="text-xs">Use the "Talk about this" buttons above to add notes from your conversations</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Additional Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium">Additional Notes</h4>
                  <Textarea 
                    placeholder="Add any additional insights, agreements, or follow-up thoughts..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Separator />

                {/* Export Options */}
                <div className="flex gap-2">
                  <Button>
                    <Download className="h-4 w-4 mr-1" />
                    Export Summary
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Start New Assessment
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};

export default Results;