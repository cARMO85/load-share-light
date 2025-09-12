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
  HelpCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';

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
      
      // If no partner response, analyze for single-person couple hotspots
      if (!partnerResponse) {
        console.log(`Debug - No partner response for task: ${myResponse.taskId}, analyzing single-person hotspots`);
        
        const myResp = getResponsibilityShare(myResponse);
        const myBurden = myResponse.likertRating?.burden ?? null;
        const myFairness = myResponse.likertRating?.fairness ?? null;
        
        const task = allTaskLookup[myResponse.taskId];
        const taskName =
          (task && 'title' in task) ? task.title :
          (task && 'task_name' in task) ? task.task_name :
          myResponse.taskId;

        // High responsibility + high burden (lowered threshold)
        if (myResp >= 0.6 && (myBurden ?? 0) >= 3.5) {
          console.log(`Debug - Found high burden+responsibility for me on ${taskName}: resp=${myResp}, burden=${myBurden}`);
          imbalances.push({
            taskId: myResponse.taskId,
            taskName,
            type: 'imbalance',
            imbalanceType: 'high-burden-responsibility',
            priority: myResp * 100 + (myBurden ?? 0) * 15,
            keyInsight: `You're carrying ${Math.round(myResp * 100)}% of this task and it feels burdensome (${myBurden}/5). This could lead to burnout without support.`,
            conversationPrompt: `What parts of ${taskName.toLowerCase()} feel most overwhelming? How could your partner help share this load?`,
            tags: ['High Solo Burden'],
            myResponsibility: myResp,
            partnerResponsibility: 1 - myResp,
            myBurden,
            partnerBurden: null,
            myFairness,
            partnerFairness: null,
            whoDoesMore: myResp > 0.6 ? 'You' : myResp < 0.4 ? 'Your partner' : 'Evenly shared',
          });
        }

        // High responsibility + low fairness (lowered threshold)
        if (myResp >= 0.5 && (myFairness ?? 5) <= 2.5) {
          console.log(`Debug - Found unfair distribution for me on ${taskName}: resp=${myResp}, fairness=${myFairness}`);
          imbalances.push({
            taskId: myResponse.taskId,
            taskName,
            type: 'imbalance',
            imbalanceType: 'fairness-disagreement',
            priority: myResp * 100 + (5 - (myFairness ?? 5)) * 15,
            keyInsight: `You handle ${Math.round(myResp * 100)}% of this task but feel it's unfairly distributed (${myFairness}/5). This suggests lack of recognition or support.`,
            conversationPrompt: `How could your partner better acknowledge or help with ${taskName.toLowerCase()}?`,
            tags: ['Unfair Distribution'],
            myResponsibility: myResp,
            partnerResponsibility: 1 - myResp,
            myBurden,
            partnerBurden: null,
            myFairness,
            partnerFairness: null,
            whoDoesMore: myResp > 0.6 ? 'You' : myResp < 0.4 ? 'Your partner' : 'Evenly shared',
          });
        }
        
        // NEW: Low responsibility but partner overwhelmed (imbalanced couple scenario)
        if (myResp <= 0.4 && (myBurden ?? 0) >= 2 && (myFairness ?? 5) <= 3.5) {
          console.log(`Debug - Found partner overwhelmed scenario for ${taskName}: myResp=${myResp}, burden=${myBurden}, fairness=${myFairness}`);
          imbalances.push({
            taskId: myResponse.taskId,
            taskName,
            type: 'imbalance',
            imbalanceType: 'responsibility-gap',
            priority: (1 - myResp) * 100 + (myBurden ?? 0) * 10,
            keyInsight: `Your partner handles ${Math.round((1 - myResp) * 100)}% of this task. Even though you do less, you still find it somewhat burdensome (${myBurden}/5), suggesting this area needs attention.`,
            conversationPrompt: `Could you take on more of ${taskName.toLowerCase()} to better support your partner?`,
            tags: ['Partner Overload'],
            myResponsibility: myResp,
            partnerResponsibility: 1 - myResp,
            myBurden,
            partnerBurden: null,
            myFairness,
            partnerFairness: null,
            whoDoesMore: myResp > 0.6 ? 'You' : myResp < 0.4 ? 'Your partner' : 'Evenly shared',
          });
        }
        
        // NEW: Any task with moderate burden but low fairness
        if ((myBurden ?? 0) >= 3 && (myFairness ?? 5) <= 2.5) {
          console.log(`Debug - Found moderate burden + unfairness for ${taskName}: burden=${myBurden}, fairness=${myFairness}`);
          imbalances.push({
            taskId: myResponse.taskId,
            taskName,
            type: 'imbalance',
            imbalanceType: 'fairness-disagreement',
            priority: (myBurden ?? 0) * 20 + (5 - (myFairness ?? 5)) * 15,
            keyInsight: `This task feels moderately burdensome (${myBurden}/5) and unfairly distributed (${myFairness}/5). The combination suggests need for better acknowledgment or redistribution.`,
            conversationPrompt: `What would make ${taskName.toLowerCase()} feel more fairly shared between you and your partner?`,
            tags: ['Burden + Unfairness'],
            myResponsibility: myResp,
            partnerResponsibility: 1 - myResp,
            myBurden,
            partnerBurden: null,
            myFairness,
            partnerFairness: null,
            whoDoesMore: myResp > 0.6 ? 'You' : myResp < 0.4 ? 'Your partner' : 'Evenly shared',
          });
        }
        
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
    console.log('Debug - Raw imbalances before sort:', imbalances);
    const sortedHotspots = imbalances.sort((a, b) => b.priority - a.priority).slice(0, 3);
    console.log('Debug - Final hotspots:', sortedHotspots);
    return sortedHotspots;
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
  console.log('Debug - Hotspots calculated:', {
    hotspotsCount: hotspots.length,
    hotspots: hotspots.map(h => ({ taskName: h.taskName, type: h.type, priority: h.priority }))
  });
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
                  // Single Adult - Show WMLI Breakdown
                  <div className="space-y-6">
                    {/* Big Numbers Display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Mental Load Intensity */}
                      <div className={`p-6 rounded-lg text-center ${
                        wmliResults.myWMLI_Intensity >= 75 ? 'bg-red-50 dark:bg-red-950/20 border border-red-200' :
                        wmliResults.myWMLI_Intensity >= 50 ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200' :
                        'bg-green-50 dark:bg-green-950/20 border border-green-200'
                      }`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Brain className="h-5 w-5" />
                          <span className="text-sm font-medium">Mental Load Intensity</span>
                        </div>
                        <div className={`text-4xl font-bold mb-2 ${
                          wmliResults.myWMLI_Intensity >= 75 ? 'text-red-600' :
                          wmliResults.myWMLI_Intensity >= 50 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {wmliResults.myWMLI_Intensity}/100
                        </div>
                        <div className={`text-sm ${
                          wmliResults.myWMLI_Intensity >= 75 ? 'text-red-700' :
                          wmliResults.myWMLI_Intensity >= 50 ? 'text-yellow-700' :
                          'text-green-700'
                        }`}>
                          {wmliResults.myWMLI_Intensity >= 75 ? 'Very high subjective workload' :
                           wmliResults.myWMLI_Intensity >= 50 ? 'Moderate subjective workload' :
                           'Light subjective workload'}
                        </div>
                      </div>
                      
                      {/* Mental Load Share */}
                      <div className="p-6 rounded-lg text-center bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <PieChart className="h-5 w-5" />
                          <span className="text-sm font-medium">Your Mental Load Share</span>
                        </div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {wmliResults.myWMLI_Share || 100}%
                        </div>
                        <div className="text-sm text-blue-700">
                          Individual household
                        </div>
                      </div>
                      
                      {/* Visible Work Share */}
                      <div className="p-6 rounded-lg text-center bg-purple-50 dark:bg-purple-950/20 border border-purple-200">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <BarChart3 className="h-5 w-5" />
                          <span className="text-sm font-medium">Visible Work Share</span>
                        </div>
                        <div className="text-4xl font-bold text-purple-600 mb-2">
                          {visibleResults.myVisiblePercentage}%
                        </div>
                        <div className="text-sm text-purple-700">
                          Time-based tasks
                        </div>
                      </div>
                    </div>

                    {/* Evidence Flags */}
                    {(wmliResults.myFlags.highSubjectiveStrain || wmliResults.myFlags.fairnessRisk || wmliResults.myFlags.equityPriority) && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Wellbeing Indicators</h4>
                            <div className="space-y-2">
                              {wmliResults.myFlags.highSubjectiveStrain && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive" className="text-xs">High Subjective Strain</Badge>
                                  <span className="text-sm text-amber-700 dark:text-amber-300">
                                    Multiple tasks feel burdensome - consider support or simplification
                                  </span>
                                </div>
                              )}
                              {wmliResults.myFlags.fairnessRisk && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">Fairness Risk</Badge>
                                  <span className="text-sm text-amber-700 dark:text-amber-300">
                                    Some tasks may feel unappreciated or unsupported
                                  </span>
                                </div>
                              )}
                              {wmliResults.myFlags.equityPriority && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="border-purple-500 text-purple-600 text-xs">Equity Priority</Badge>
                                  <span className="text-sm text-amber-700 dark:text-amber-300">
                                    Workload distribution may benefit from adjustment
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Couple View - Both Partners' Results Table
                  <div className="space-y-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead className="text-center">Partner 1</TableHead>
                          <TableHead className="text-center">Partner 2</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Mental Load Intensity
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className={`text-lg font-bold ${
                                (wmliResults.myWMLI_Intensity || 0) >= 75 ? 'text-red-600' :
                                (wmliResults.myWMLI_Intensity || 0) >= 50 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {wmliResults.myWMLI_Intensity || 0}/100
                              </div>
                              <Badge variant={(wmliResults.myWMLI_Intensity || 0) >= 75 ? "destructive" : (wmliResults.myWMLI_Intensity || 0) >= 50 ? "secondary" : "default"} className="text-xs">
                                {(wmliResults.myWMLI_Intensity || 0) >= 75 ? 'Very high' :
                                 (wmliResults.myWMLI_Intensity || 0) >= 50 ? 'Moderate' : 'Light'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className={`text-lg font-bold ${
                                (wmliResults.partnerWMLI_Intensity || 50) >= 75 ? 'text-red-600' :
                                (wmliResults.partnerWMLI_Intensity || 50) >= 50 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {wmliResults.partnerWMLI_Intensity || 50}/100
                              </div>
                              <Badge variant={(wmliResults.partnerWMLI_Intensity || 50) >= 75 ? "destructive" : (wmliResults.partnerWMLI_Intensity || 50) >= 50 ? "secondary" : "default"} className="text-xs">
                                {(wmliResults.partnerWMLI_Intensity || 50) >= 75 ? 'Very high' :
                                 (wmliResults.partnerWMLI_Intensity || 50) >= 50 ? 'Moderate' : 'Light'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <PieChart className="h-4 w-4" />
                              Mental Load Share
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className={`text-lg font-bold ${
                                (wmliResults.myWMLI_Share || 50) >= 65 ? 'text-red-600' :
                                (wmliResults.myWMLI_Share || 50) <= 35 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {wmliResults.myWMLI_Share || 50}%
                              </div>
                              <Badge variant={(wmliResults.myWMLI_Share || 50) >= 65 || (wmliResults.myWMLI_Share || 50) <= 35 ? "destructive" : "default"} className="text-xs">
                                {(wmliResults.myWMLI_Share || 50) >= 65 ? 'Higher share' :
                                 (wmliResults.myWMLI_Share || 50) <= 35 ? 'Lower share' : 'Balanced'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className={`text-lg font-bold ${
                                (wmliResults.partnerWMLI_Share || 50) >= 65 ? 'text-red-600' :
                                (wmliResults.partnerWMLI_Share || 50) <= 35 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {wmliResults.partnerWMLI_Share || 50}%
                              </div>
                              <Badge variant={(wmliResults.partnerWMLI_Share || 50) >= 65 || (wmliResults.partnerWMLI_Share || 50) <= 35 ? "destructive" : "default"} className="text-xs">
                                {(wmliResults.partnerWMLI_Share || 50) >= 65 ? 'Higher share' :
                                 (wmliResults.partnerWMLI_Share || 50) <= 35 ? 'Lower share' : 'Balanced'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Visible Work Share
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-primary">
                                {visibleResults.myVisiblePercentage}%
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Time-based tasks
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-primary">
                                {visibleResults.partnerVisiblePercentage}%
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Time-based tasks
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Household Wellbeing Indicators */}
                    {(wmliResults.myFlags.highSubjectiveStrain || wmliResults.myFlags.fairnessRisk || wmliResults.myFlags.equityPriority ||
                      wmliResults.partnerFlags?.highSubjectiveStrain || wmliResults.partnerFlags?.fairnessRisk || wmliResults.partnerFlags?.equityPriority) && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3">Household Wellbeing Indicators</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Partner 1 Flags */}
                              <div>
                                <div className="font-medium text-sm text-amber-700 dark:text-amber-300 mb-2">Partner 1</div>
                                <div className="space-y-2">
                                  {wmliResults.myFlags.highSubjectiveStrain && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="destructive" className="text-xs">High Subjective Strain</Badge>
                                      <span className="text-xs text-amber-600">Multiple burdensome tasks</span>
                                    </div>
                                  )}
                                  {wmliResults.myFlags.fairnessRisk && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">Fairness Risk</Badge>
                                      <span className="text-xs text-amber-600">Tasks feel unappreciated</span>
                                    </div>
                                  )}
                                  {wmliResults.myFlags.equityPriority && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="border-purple-500 text-purple-600 text-xs">Equity Priority</Badge>
                                      <span className="text-xs text-amber-600">Workload may need adjustment</span>
                                    </div>
                                  )}
                                  {!wmliResults.myFlags.highSubjectiveStrain && !wmliResults.myFlags.fairnessRisk && !wmliResults.myFlags.equityPriority && (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-xs text-green-600">No concerning indicators</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Partner 2 Flags */}
                              <div>
                                <div className="font-medium text-sm text-amber-700 dark:text-amber-300 mb-2">Partner 2</div>
                                <div className="space-y-2">
                                  {wmliResults.partnerFlags?.highSubjectiveStrain && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="destructive" className="text-xs">High Subjective Strain</Badge>
                                      <span className="text-xs text-amber-600">Multiple burdensome tasks</span>
                                    </div>
                                  )}
                                  {wmliResults.partnerFlags?.fairnessRisk && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">Fairness Risk</Badge>
                                      <span className="text-xs text-amber-600">Tasks feel unappreciated</span>
                                    </div>
                                  )}
                                  {wmliResults.partnerFlags?.equityPriority && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="border-purple-500 text-purple-600 text-xs">Equity Priority</Badge>
                                      <span className="text-xs text-amber-600">Workload may need adjustment</span>
                                    </div>
                                  )}
                                  {!wmliResults.partnerFlags?.highSubjectiveStrain && !wmliResults.partnerFlags?.fairnessRisk && !wmliResults.partnerFlags?.equityPriority && (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-xs text-green-600">No concerning indicators</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Chip */}
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
                    if (isSingleAdult) {
                      // For single adults, show hotspots from our calculated results
                      return hotspots.length > 0 ? (
                        hotspots.map((hotspot, index) => (
                          <div key={`${hotspot.taskId}-${index}`} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">#{index + 1} {hotspot.taskName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    Individual Strain
                                  </Badge>
                                </div>
                                
                                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                                  <div className="text-sm font-medium text-blue-900 mb-1">Mental Load Impact</div>
                                  <p className="text-sm text-blue-800">
                                    You handle {Math.round(hotspot.responsibility * 100)}% of this task, 
                                    with burden rating of {hotspot.burden.toFixed(1)}/5 and fairness rating of {hotspot.fairness.toFixed(1)}/5.
                                    Driver score: {hotspot.driverScore.toFixed(3)}
                                  </p>
                                </div>
                                
                                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                                  <div className="text-sm font-medium text-amber-900 mb-1">Reflection Prompt</div>
                                  <p className="text-sm text-amber-800 italic">
                                    "What aspects of {hotspot.taskName.toLowerCase()} feel most overwhelming? 
                                    What support or changes could help make this more manageable?"
                                  </p>
                                </div>

                                <ConversationPrompts 
                                  taskName={hotspot.taskName}
                                  isCouple={false}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                          <h3 className="text-lg font-medium text-green-700 mb-2">Well-Managed Tasks!</h3>
                          <p className="text-muted-foreground mb-4">
                            Your current task management appears well-balanced without major strain areas.
                          </p>
                          <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-200 max-w-md mx-auto">
                            <div className="text-sm font-medium text-blue-900 mb-1">Maintenance Prompt</div>
                            <p className="text-sm text-blue-800 italic">
                              "What's working well for you right now that you want to make sure you keep?"
                            </p>
                          </div>
                        </div>
                      );
                    }

                    // For couples, use the same hotspots array
                    return hotspots.length > 0 ? (
                      hotspots.map((hotspot, index) => (
                        <div key={`${hotspot.taskId}-${index}`} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">#{index + 1} {hotspot.taskName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {hotspot.type === 'imbalance' ? hotspot.imbalanceType?.replace('-', ' ') : 'Couple Imbalance'}
                                </Badge>
                              </div>
                              
                              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                                <div className="text-sm font-medium text-blue-900 mb-1">Key Insight</div>
                                <p className="text-sm text-blue-800">
                                  {hotspot.keyInsight || `This task shows imbalance with priority score: ${hotspot.priority?.toFixed(1)}`}
                                </p>
                              </div>
                              
                              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                                <div className="text-sm font-medium text-amber-900 mb-1">Conversation Starter</div>
                                <p className="text-sm text-amber-800 italic">
                                  "{hotspot.conversationPrompt || `How could we better share the responsibilities for ${hotspot.taskName.toLowerCase()}?`}"
                                </p>
                              </div>

                              <ConversationPrompts 
                                taskName={hotspot.taskName}
                                isCouple={true}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <h3 className="text-lg font-medium text-green-700 mb-2">Well-Balanced Partnership!</h3>
                        <p className="text-muted-foreground mb-4">
                          Your household shows good balance without major imbalance hotspots.
                        </p>
                        <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-200 max-w-md mx-auto">
                          <div className="text-sm font-medium text-blue-900 mb-1">Maintenance Prompt</div>
                          <p className="text-sm text-blue-800 italic">
                            "What systems are working well that we want to keep doing?"
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
                          <p>• Your household shows excellent balance in mental load distribution</p>
                        )}
                        {wmliResults.myWMLI_Intensity >= 15 && wmliResults.myWMLI_Intensity <= 33 && (
                          <p>• Your mental load intensity is at a healthy level ({wmliResults.myWMLI_Intensity.toFixed(0)}/100)</p>
                        )}
                        {wmliResults.myWMLI_Intensity > 33 && wmliResults.myWMLI_Intensity <= 66 && (
                          <p>• Your mental load intensity is moderate but manageable ({wmliResults.myWMLI_Intensity.toFixed(0)}/100)</p>
                        )}
                        {wmliResults.myWMLI_Intensity < 15 && !isSingleAdult && (
                          <p>• Your mental load intensity is very low ({wmliResults.myWMLI_Intensity.toFixed(0)}/100) - this may indicate your partner is carrying most of the household burden</p>
                        )}
                        {hotspots.length === 0 && (
                          <p>• No major imbalance hotspots detected in your household patterns</p>
                        )}
                        {hotspots.length > 0 && hotspots.length <= 2 && (
                          <p>• Only {hotspots.length} area{hotspots.length > 1 ? 's' : ''} need attention - most of your household runs smoothly</p>
                        )}
                        {!wmliResults.myFlags.highSubjectiveStrain && (
                          <p>• You're not experiencing excessive subjective strain from household work</p>
                        )}
                        {!wmliResults.myFlags.fairnessRisk && (
                          <p>• You feel the household work distribution is generally fair</p>
                        )}
                        {Math.abs(visibleResults.myVisiblePercentage - 50) <= 15 && !isSingleAdult && (
                          <p>• Visible task time is reasonably balanced ({visibleResults.myVisiblePercentage.toFixed(0)}% vs {(100-visibleResults.myVisiblePercentage).toFixed(0)}%)</p>
                        )}
                        {isSingleAdult && (
                          <p>• You're successfully managing your household independently</p>
                        )}
                        {!isSingleAdult && Math.abs((wmliResults.myWMLI_Share || 50) - 50) <= 10 && (
                          <p>• Mental load sharing is well-balanced ({(wmliResults.myWMLI_Share || 50).toFixed(0)}% vs {(100-(wmliResults.myWMLI_Share || 50)).toFixed(0)}%)</p>
                        )}
                        <p>• Taking this assessment demonstrates your commitment to household equity and awareness</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Recommendations based on actual results */}
                <div className="space-y-4">
                  <h4 className="font-medium">Recommended Actions</h4>
                  
                  {/* Priority recommendations based on assessment results */}
                  <div className="space-y-3">
                    {/* Hotspot-based recommendations */}
                    {hotspots.length > 0 && (
                      <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20 border-red-200">
                        <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                          Priority: Address Your {hotspots.length} Household Hotspot{hotspots.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                          {hotspots.map((hotspot, index) => (
                            <div key={index}>
                              • <strong>{hotspot.taskName}:</strong> {hotspot.keyInsight.split('.')[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* High mental load intensity */}
                    {wmliResults.myWMLI_Intensity > 66 && (
                      <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20 border-orange-200">
                        <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                          High Mental Load Alert
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">
                          • Your mental load intensity is {wmliResults.myWMLI_Intensity.toFixed(0)}/100 - consider reducing burden or seeking support
                        </div>
                      </div>
                    )}
                    
                    {/* Very low mental load intensity warning */}
                    {wmliResults.myWMLI_Intensity < 15 && !isSingleAdult && (
                      <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20 border-red-200">
                        <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                          Household Imbalance Alert
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300">
                          • Your mental load intensity is very low ({wmliResults.myWMLI_Intensity.toFixed(0)}/100), suggesting your partner may be overwhelmed with household responsibilities. Consider taking on more tasks to achieve better balance.
                        </div>
                      </div>
                    )}
                    
                    {/* Mental load share imbalance */}
                    {!isSingleAdult && (wmliResults.myWMLI_Share || 50) > 65 && (
                      <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                        <div className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">
                          Mental Load Imbalance
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                          • You carry {(wmliResults.myWMLI_Share || 50).toFixed(0)}% of mental load - consider redistributing planning and monitoring tasks
                        </div>
                      </div>
                    )}
                    
                    {/* Visible work imbalance */}
                    {!isSingleAdult && Math.abs(visibleResults.myVisiblePercentage - 50) > 20 && (
                      <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Visible Work Imbalance
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          • You do {visibleResults.myVisiblePercentage.toFixed(0)}% of visible tasks - consider rebalancing time-based responsibilities
                        </div>
                      </div>
                    )}
                    
                    {/* Fairness concerns */}
                    {wmliResults.myFlags.fairnessRisk && (
                      <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                        <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                          Recognition & Fairness
                        </div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                          • Address acknowledgment and appreciation for your household contributions
                        </div>
                      </div>
                    )}
                    
                    {/* When everything looks good */}
                    {hotspots.length === 0 && wmliResults.myWMLI_Intensity <= 50 && !wmliResults.myFlags.fairnessRisk && (
                      <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200">
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                          Maintenance Mode
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          • Schedule regular check-ins to maintain your current healthy balance
                          • Consider what systems are working well that you want to continue
                        </div>
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