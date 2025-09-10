import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  const { state } = useAssessment();
  
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

  // Top 3 hotspots calculation
  const getHotspots = () => {
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
          tags: [
            ...(burden >= 4 && responsibility >= 0.6 ? ['High burden'] : []),
            ...(fairness <= 2 && responsibility >= 0.6 ? ['Unfairness concern'] : [])
          ]
        };
      })
      .sort((a, b) => b.driverScore - a.driverScore)
      .slice(0, 3);

    return taskScores;
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (section: string) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const statusInfo = getStatusInfo();
  const hotspots = getHotspots();

  const ConversationPrompts = ({ taskName }: { taskName: string }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-1" />
          Talk about this
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conversation Prompts: {taskName}</DialogTitle>
          <DialogDescription>
            Use these prompts to discuss this task with your partner
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">"How do you feel about how we currently handle {taskName}?"</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">"What would make {taskName} feel more balanced between us?"</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">"Are there specific aspects of {taskName} that feel overwhelming or underappreciated?"</p>
          </div>
          <Button 
            onClick={() => setSummary(prev => prev + `\n• Discussed ${taskName} - [Add your notes here]`)}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add to Summary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <button onClick={() => scrollToSection('overview')} className="hover:text-primary transition-colors">
                Overview
              </button>
              <button onClick={() => scrollToSection('drivers')} className="hover:text-primary transition-colors">
                Drivers
              </button>
              <button onClick={() => scrollToSection('comparison')} className="hover:text-primary transition-colors">
                Visible vs Mental
              </button>
              <button onClick={() => scrollToSection('intensity')} className="hover:text-primary transition-colors">
                Intensity
              </button>
              <button onClick={() => scrollToSection('next-steps')} className="hover:text-primary transition-colors">
                Next Steps
              </button>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export Report
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
                {/* Big Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{visibleResults.myVisiblePercentage}%</div>
                    <div className="text-sm font-medium">Visible Share (%)</div>
                    {!isSingleAdult && (
                      <div className="text-xs text-muted-foreground mt-1">
                        You {visibleResults.myVisiblePercentage}% • Partner {visibleResults.partnerVisiblePercentage}%
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{wmliResults.myWMLI_Intensity}/100</div>
                    <div className="text-sm font-medium">WMLI Intensity (0-100)</div>
                    {!isSingleAdult && wmliResults.partnerWMLI_Intensity !== undefined && (
                      <div className="text-xs text-muted-foreground mt-1">
                        You {wmliResults.myWMLI_Intensity} • Partner {wmliResults.partnerWMLI_Intensity}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{wmliResults.myWMLI_Share || 50}%</div>
                    <div className="text-sm font-medium">WMLI Share (%)</div>
                    {!isSingleAdult && (
                      <div className="text-xs text-muted-foreground mt-1">
                        You {wmliResults.myWMLI_Share}% • Partner {wmliResults.partnerWMLI_Share}%
                      </div>
                    )}
                  </div>
                </div>

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

        {/* 2. Top 3 Hotspots */}
        <Card id="drivers" className="border-2">
          <Collapsible open={openSections.drivers} onOpenChange={() => toggleSection('drivers')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      What's Driving Your Score
                    </CardTitle>
                    <CardDescription>Top 3 tasks needing attention</CardDescription>
                  </div>
                  {openSections.drivers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {hotspots.map((hotspot, index) => (
                    <div key={hotspot.taskId} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{index + 1} {hotspot.taskName}</span>
                            {hotspot.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            High {hotspot.burden >= 4 ? 'burden' : 'responsibility'} ({hotspot.burden}/5) on you; 
                            Responsibility: {Math.round(hotspot.responsibility * 100)}%
                            {hotspot.fairness <= 2 && '; feels unacknowledged'}
                          </p>
                        </div>
                        <ConversationPrompts taskName={hotspot.taskName} />
                      </div>
                    </div>
                  ))}
                  {hotspots.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No significant hotspots detected. Your workload appears well-managed!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 3. Visible vs Mental */}
        <Card id="comparison" className="border-2">
          <Collapsible open={openSections.comparison} onOpenChange={() => toggleSection('comparison')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Visible vs Mental Load
                    </CardTitle>
                    <CardDescription>How time and cognitive work compare</CardDescription>
                  </div>
                  {openSections.comparison ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visible Time */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Visible Time Share</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>You: {visibleResults.myVisiblePercentage}%</span>
                        {!isSingleAdult && <span>Partner: {visibleResults.partnerVisiblePercentage}%</span>}
                      </div>
                      <Progress value={visibleResults.myVisiblePercentage} className="h-3" />
                    </div>
                  </div>

                  {/* Mental Load */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span className="font-medium">Mental Load Share</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>You: {wmliResults.myWMLI_Share || 50}%</span>
                        {!isSingleAdult && <span>Partner: {wmliResults.partnerWMLI_Share || 50}%</span>}
                      </div>
                      <Progress value={wmliResults.myWMLI_Share || 50} className="h-3" />
                    </div>
                  </div>
                </div>

                {/* Pattern Analysis */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <strong>Pattern: </strong>
                    {(() => {
                      const visibleShare = visibleResults.myVisiblePercentage;
                      const mentalShare = wmliResults.myWMLI_Share || 50;
                      const diff = Math.abs(visibleShare - mentalShare);
                      
                      if (diff <= 10) {
                        return `Aligned - You carry ${visibleShare}% of time and ${mentalShare}% of mental load.`;
                      } else if (mentalShare > visibleShare) {
                        return `Cognitive load exceeds time - You carry ${visibleShare}% time but ${mentalShare}% mental load (planning/monitoring).`;
                      } else {
                        return `Time exceeds cognitive load - You carry ${visibleShare}% time but ${mentalShare}% mental load.`;
                      }
                    })()}
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 4. WMLI Intensity */}
        <Card id="intensity" className="border-2">
          <Collapsible open={openSections.intensity} onOpenChange={() => toggleSection('intensity')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      WMLI Intensity Explanation
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
                {/* Gauge */}
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

                {/* Interpretation */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <strong>WMLI (0–100):</strong> Average subjective workload across tasks (burden + unfairness, weighted by responsibility). 
                      Higher = heavier mental load.
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
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Interpretation bands (provisional). Will be replaced by pilot percentiles.
                  </p>
                </div>

                {/* Evidence Flags */}
                {(wmliResults.myFlags.highSubjectiveStrain || wmliResults.myFlags.fairnessRisk) && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Evidence Flags</h4>
                    <div className="flex flex-wrap gap-2">
                      {wmliResults.myFlags.highSubjectiveStrain && (
                        <Badge variant="destructive">High subjective strain</Badge>
                      )}
                      {wmliResults.myFlags.fairnessRisk && (
                        <Badge variant="outline" className="border-orange-500 text-orange-600">Fairness risk</Badge>
                      )}
                      {wmliResults.myFlags.equityPriority && (
                        <Badge variant="outline" className="border-purple-500 text-purple-600">Equity priority</Badge>
                      )}
                    </div>
                  </div>
                )}
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
                    </CardTitle>
                    <CardDescription>Action planning and follow-up</CardDescription>
                  </div>
                  {openSections.nextSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Action Items */}
                <div className="space-y-4">
                  <h4 className="font-medium">Action Items</h4>
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

                <Separator />

                {/* Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium">Discussion Summary</h4>
                  <Textarea 
                    placeholder="Add notes from your conversation, key insights, or agreements..."
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