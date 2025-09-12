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

  // Data-driven imbalance detection with specific templates
  const getHotspots = () => {
    if (isSingleAdult) {
      // Individual: surface top drivers of subjective strain
      const taskScores = state.taskResponses
        .filter(r => !r.notApplicable && r.likertRating)
        .map(response => {
          const responsibility = response.mySharePercentage != null
            ? response.mySharePercentage / 100
            : response.assignment === 'me' ? 1
            : response.assignment === 'partner' ? 0
            : 0.5;

          const burden = response.likertRating!.burden;   // 1–5
          const fairness = response.likertRating!.fairness; // 1–5

          const unfairness01 = (5 - fairness) / 4;      // 0–1
          const burden01 = (burden - 1) / 4;            // 0–1

          const driverScore = responsibility * ((burden01 + unfairness01) / 2);

          const task = allTaskLookup[response.taskId];
          const taskName =
            (task && 'title' in task) ? task.title :
            (task && 'task_name' in task) ? task.task_name :
            response.taskId;

          return {
            taskId: response.taskId,
            taskName,
            type: 'individual' as const,
            driverScore,
            responsibility,
            burden,
            fairness,
            tags: [
              ...(burden >= 4 && responsibility >= 0.6 ? ['High burden'] : []),
              ...(fairness <= 2 && responsibility >= 0.6 ? ['Unfairness concern'] : []),
            ],
          };
        })
        .sort((a, b) => b.driverScore - a.driverScore)
        .slice(0, 3);

      return taskScores;
    }

    // Couples
    const partnerResponses = state.partnerTaskResponses || [];
    const imbalances: Array<{
      taskId: string;
      taskName: string;
      type: 'imbalance';
      imbalanceType: 'responsibility-gap' | 'high-burden-responsibility' | 'fairness-disagreement';
      priority: number;
      keyInsight: string;
      conversationPrompt: string;
      tags: string[];
      // fields used by ConversationPrompts / UI
      myResponsibility: number;
      partnerResponsibility: number;
      myBurden: number | null;
      partnerBurden: number | null;
      myFairness: number | null;
      partnerFairness: number | null;
      whoDoesMore: 'You' | 'Your partner' | 'Evenly shared';
    }> = [];

    const getResponsibilityShare = (r: any) => {
      if (r.assignment === 'me') return 1;
      if (r.assignment === 'partner') return 0;
      if (r.assignment === 'shared' && typeof r.mySharePercentage === 'number') {
        return r.mySharePercentage / 100;
      }
      return 0.5;
    };

  state.taskResponses
    .filter(r => !r.notApplicable)
    .forEach(myResponse => {
      const partnerResponse = partnerResponses.find(pr => pr.taskId === myResponse.taskId);
      if (!partnerResponse) {
        console.log(`Debug - No partner response for task: ${myResponse.taskId}`);
        return;
      }

        const myResp = getResponsibilityShare(myResponse);
        const partnerResp = getResponsibilityShare(partnerResponse);
        const gapPct = Math.abs(myResp - partnerResp) * 100;

        const myBurden = myResponse.likertRating?.burden ?? null;
        const partnerBurden = partnerResponse.likertRating?.burden ?? null;
        const myFairness = myResponse.likertRating?.fairness ?? null;
        const partnerFairness = partnerResponse.likertRating?.fairness ?? null;

        const task = allTaskLookup[myResponse.taskId];
        const taskName =
          (task && 'title' in task) ? task.title :
          (task && 'task_name' in task) ? task.task_name :
          myResponse.taskId;

        const whoDoesMore =
          Math.abs(myResp - partnerResp) < 0.05
            ? 'Evenly shared'
            : myResp > partnerResp ? 'You' : 'Your partner';

      // ---------- Template 1: Responsibility gap ----------
      console.log(`Debug - Task ${taskName}: gap=${gapPct}%, myResp=${myResp}, partnerResp=${partnerResp}`);
      if (gapPct >= 25) {
        console.log(`Debug - Found responsibility gap for ${taskName}: ${gapPct}%`);
        const higherPct = Math.round(Math.max(myResp, partnerResp) * 100);
        const lowerPct  = Math.round(Math.min(myResp, partnerResp) * 100);

          imbalances.push({
            taskId: myResponse.taskId,
            taskName,
            type: 'imbalance',
            imbalanceType: 'responsibility-gap',
            priority: gapPct, // strongest first
            keyInsight: `${whoDoesMore} report carrying ${higherPct}% of this task, while the other partner carries ${lowerPct}%. This gap may feel unbalanced, especially if it's recurring.`,
            conversationPrompt: 'Would rotating weeks or setting a shared plan help make this task feel fairer?',
            tags: ['High Responsibility Gap'],
            myResponsibility: myResp,
            partnerResponsibility: partnerResp,
            myBurden,
            partnerBurden,
            myFairness,
            partnerFairness,
            whoDoesMore,
          });
        }

      // ---------- Template 2: High burden AND high responsibility ----------
      console.log(`Debug - Task ${taskName}: myResp=${myResp}, myBurden=${myBurden}, partnerResp=${partnerResp}, partnerBurden=${partnerBurden}`);
      if (myResp >= 0.6 && (myBurden ?? 0) >= 4) {
        console.log(`Debug - Found high burden+responsibility for me on ${taskName}`);
          imbalances.push({
            taskId: myResponse.taskId,
            taskName,
            type: 'imbalance',
            imbalanceType: 'high-burden-responsibility',
            priority: myResp * 100 + (myBurden ?? 0) * 10,
            keyInsight: `You carry ${Math.round(myResp * 100)}% of this responsibility, and it feels very burdensome (${myBurden}/5). This may lead to fatigue unless some parts are shared.`,
            conversationPrompt: 'What part of this task feels heaviest? Could some of it be handed over or automated?',
            tags: ['High Burden & Responsibility'],
            myResponsibility: myResp,
            partnerResponsibility: partnerResp,
            myBurden,
            partnerBurden,
            myFairness,
            partnerFairness,
            whoDoesMore,
          });
        }
        if (partnerResp >= 0.6 && (partnerBurden ?? 0) >= 4) {
          imbalances.push({
            taskId: myResponse.taskId,
            taskName,
            type: 'imbalance',
            imbalanceType: 'high-burden-responsibility',
            priority: partnerResp * 100 + (partnerBurden ?? 0) * 10,
            keyInsight: `Your partner carries ${Math.round(partnerResp * 100)}% of this responsibility and rates it very burdensome (${partnerBurden}/5). They may need support or redistribution.`,
            conversationPrompt: 'What part of this task feels heaviest for your partner? Could some of it be shared or simplified?',
            tags: ['High Burden & Responsibility'],
            myResponsibility: myResp,
            partnerResponsibility: partnerResp,
            myBurden,
            partnerBurden,
            myFairness,
            partnerFairness,
            whoDoesMore,
          });
        }

        // ---------- Template 3: Fairness disagreement ----------
        const fairnessDisagrees =
          (myFairness != null && partnerFairness != null) &&
          ((myFairness <= 2 && partnerFairness >= 4) || (myFairness >= 4 && partnerFairness <= 2));

        if (fairnessDisagrees) {
          const unfairSide = (myFairness ?? 0) <= 2 ? 'You' : 'Your partner';
          imbalances.push({
            taskId: myResponse.taskId,
            taskName,
            type: 'imbalance',
            imbalanceType: 'fairness-disagreement',
            priority: Math.abs((myFairness ?? 0) - (partnerFairness ?? 0)) * 20,
            keyInsight: `${unfairSide} rated this work as unfair (${(myFairness ?? partnerFairness)}/5), while the other partner rated it as fair (${(partnerFairness ?? myFairness)}/5). This signals a mismatch in recognition.`,
            conversationPrompt: 'Do we both feel this work is acknowledged? How could appreciation be shown more clearly?',
            tags: ['Different Fairness Views'],
            myResponsibility: myResp,
            partnerResponsibility: partnerResp,
            myBurden,
            partnerBurden,
            myFairness,
            partnerFairness,
            whoDoesMore,
          });
        }
      });

    // Sort by priority, take top 3
    return imbalances.sort((a, b) => b.priority - a.priority).slice(0, 3);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (section: string) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const statusInfo = getStatusInfo();
  const hotspots = getHotspots();
  
  // Debug logging
  console.log('Debug - Assessment data:', {
    isSingleAdult,
    isTogetherMode,
    taskResponsesCount: state.taskResponses.length,
    partnerResponsesCount: state.partnerTaskResponses?.length || 0,
    sampleTaskResponse: state.taskResponses[0],
    samplePartnerResponse: state.partnerTaskResponses?.[0],
    hotspots
  });

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

        {/* 2. Biggest Imbalances Between Partners */}
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
                  {(() => {
                    const imbalances = [];
                    
                    console.log('DEBUG - Imbalance Detection Start:', {
                      isSingleAdult,
                      hasPartnerResponses: !!state.partnerTaskResponses,
                      partnerResponsesLength: state.partnerTaskResponses?.length || 0,
                      myResponsesLength: state.taskResponses.length,
                      sampleMyResponse: state.taskResponses[0],
                      samplePartnerResponse: state.partnerTaskResponses?.[0]
                    });
                    
                    if (!isSingleAdult && state.partnerTaskResponses) {
                      // Check each task for imbalances
                      state.taskResponses
                        .filter(r => !r.notApplicable)
                        .forEach(myResponse => {
                          const partnerResponse = state.partnerTaskResponses!.find(pr => pr.taskId === myResponse.taskId);
                          if (!partnerResponse) return;

                          const getShare = (r: any) => {
                            if (r.assignment === 'me') return 100;
                            if (r.assignment === 'partner') return 0;
                            if (r.assignment === 'shared' && typeof r.mySharePercentage === 'number') {
                              return r.mySharePercentage;
                            }
                            return 50;
                          };

                          const myShare = getShare(myResponse);
                          const partnerShare = getShare(partnerResponse);
                          const gap = Math.abs(myShare - partnerShare);

                          const task = allTaskLookup[myResponse.taskId];
                          const taskName = (task && 'title' in task) ? task.title : 
                                         (task && 'task_name' in task) ? task.task_name : 
                                         myResponse.taskId;

                          console.log('DEBUG - Checking task:', {
                            taskName,
                            myShare,
                            partnerShare,
                            gap,
                            myBurden: myResponse.likertRating?.burden,
                            partnerBurden: partnerResponse.likertRating?.burden,
                            myFairness: myResponse.likertRating?.fairness,
                            partnerFairness: partnerResponse.likertRating?.fairness
                          });

                          // High responsibility gap (lowered to 15% for testing)
                          if (gap >= 15) {
                            console.log('DEBUG - Found responsibility gap!', taskName, gap);
                            imbalances.push({
                              taskName,
                              type: 'High Responsibility Gap',
                              insight: `${myShare > partnerShare ? 'You' : 'Your partner'} handle ${Math.max(myShare, partnerShare)}% while the other handles ${Math.min(myShare, partnerShare)}%. This gap may feel unbalanced.`,
                              prompt: 'Would rotating weeks or setting a shared plan help make this task feel fairer?',
                              priority: gap
                            });
                          }

                          // High burden + high responsibility (lowered to 40%+ responsibility AND 3+ burden)
                          const myBurden = myResponse.likertRating?.burden || 0;
                          const partnerBurden = partnerResponse.likertRating?.burden || 0;
                          
                          if (myShare >= 40 && myBurden >= 3) {
                            console.log('DEBUG - Found high burden+responsibility for me!', taskName);
                            imbalances.push({
                              taskName,
                              type: 'High Burden & Responsibility',
                              insight: `You carry ${myShare}% of this responsibility and rate it very burdensome (${myBurden}/5). This may lead to fatigue.`,
                              prompt: 'What part of this task feels heaviest? Could some of it be handed over or automated?',
                              priority: myShare + myBurden * 10
                            });
                          }

                          if (partnerShare >= 40 && partnerBurden >= 3) {
                            console.log('DEBUG - Found high burden+responsibility for partner!', taskName);
                            imbalances.push({
                              taskName,
                              type: 'High Burden & Responsibility',
                              insight: `Your partner carries ${partnerShare}% of this responsibility and rates it very burdensome (${partnerBurden}/5). They may need support.`,
                              prompt: 'What part of this task feels heaviest for your partner? Could some of it be shared?',
                              priority: partnerShare + partnerBurden * 10
                            });
                          }

                          // Fairness disagreement (one rates ≤2, other ≥4)
                          const myFairness = myResponse.likertRating?.fairness || 0;
                          const partnerFairness = partnerResponse.likertRating?.fairness || 0;
                          
                          if ((myFairness <= 2 && partnerFairness >= 4) || (myFairness >= 4 && partnerFairness <= 2)) {
                            const unfairSide = myFairness <= 2 ? 'You' : 'Your partner';
                            imbalances.push({
                              taskName,
                              type: 'Different Fairness Views',
                              insight: `${unfairSide} rate this as unfair while the other sees it as fair. This signals a mismatch in recognition.`,
                              prompt: 'Do we both feel this work is acknowledged? How could appreciation be shown more clearly?',
                              priority: Math.abs(myFairness - partnerFairness) * 20
                            });
                          }
                        });

                      // Sort by priority and take top 3
                      imbalances.sort((a, b) => b.priority - a.priority);
                    }

                    return imbalances.slice(0, 3).length > 0 ? (
                      imbalances.slice(0, 3).map((imbalance, index) => (
                        <div key={`${imbalance.taskName}-${index}`} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">#{index + 1} {imbalance.taskName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {imbalance.type}
                                </Badge>
                              </div>
                              
                              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                                <div className="text-sm font-medium text-blue-900 mb-1">Key Insight</div>
                                <p className="text-sm text-blue-800">{imbalance.insight}</p>
                              </div>
                              
                              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                                <div className="text-sm font-medium text-amber-900 mb-1">Conversation Starter</div>
                                <p className="text-sm text-amber-800 italic">"{imbalance.prompt}"</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <h3 className="text-lg font-medium text-green-700 mb-2">
                          {isSingleAdult ? 'Well-Managed Tasks!' : 'Excellent Partnership Balance!'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {isSingleAdult 
                            ? 'Your current task management appears well-balanced without major strain areas.'
                            : 'You and your partner show strong alignment on household responsibilities.'
                          }
                        </p>
                        <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-200 max-w-md mx-auto">
                          <div className="text-sm font-medium text-blue-900 mb-1">Maintenance Prompt</div>
                          <p className="text-sm text-blue-800 italic">
                            "What's working well for us right now that we want to make sure we keep?"
                          </p>
                        </div>
                      </div>
                    );
                  })()}
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