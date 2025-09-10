import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoButton } from '@/components/InfoButton';
import { WMLIResults } from '@/lib/calculationUtils';
import { allTaskLookup } from '@/data/allTasks';
import { TaskResponse } from '@/types/assessment';
import { 
  AlertTriangle, 
  Brain, 
  Users, 
  TrendingUp, 
  CheckCircle,
  XCircle 
} from 'lucide-react';

interface WMLIBreakdownProps {
  wmliResults: WMLIResults;
  taskResponses: TaskResponse[];
  isSingleAdult?: boolean;
}

export const WMLIBreakdown: React.FC<WMLIBreakdownProps> = ({
  wmliResults,
  taskResponses,
  isSingleAdult = false
}) => {
  // Get task details for flagged tasks
  const getTaskDetails = (taskIds: string[]) => {
    return taskIds.map(id => {
      const task = allTaskLookup[id];
      return {
        id,
        title: task ? ('title' in task ? task.title : task.task_name) : 'Unknown Task',
        category: task?.category || 'Other'
      };
    });
  };

  const strainTasks = getTaskDetails(wmliResults.myFlags.strainTasks);
  const unfairnessTasks = getTaskDetails(wmliResults.myFlags.unfairnessTasks);

  return (
    <div className="space-y-6">
      {/* WMLI Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Research-Based Mental Load Assessment
            <InfoButton 
              variant="tooltip"
              tooltipContent="WMLI combines burden and fairness ratings weighted by responsibility. Based on NASA-TLX subjective workload research and household labor equity studies."
            />
          </CardTitle>
          <CardDescription>
            Evidence-informed analysis using validated psychometric approaches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{wmliResults.myWMLI}</div>
              <p className="text-sm text-muted-foreground">Your WMLI Score</p>
            </div>
            
            {wmliResults.partnerWMLI && (
              <div className="text-center p-4 bg-secondary/5 rounded-lg">
                <div className="text-3xl font-bold text-secondary">{wmliResults.partnerWMLI}</div>
                <p className="text-sm text-muted-foreground">Partner's WMLI Score</p>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Interpretation:</strong> {wmliResults.interpretationContext}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Evidence-Based Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Evidence-Based Risk Indicators
          </CardTitle>
          <CardDescription>
            Flags based on research linking burden, fairness, and responsibility to emotional fatigue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {/* High Subjective Strain */}
            <div className={`p-3 rounded-lg border-l-4 ${
              wmliResults.myFlags.highSubjectiveStrain 
                ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                : 'border-green-500 bg-green-50 dark:bg-green-950/20'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {wmliResults.myFlags.highSubjectiveStrain ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium">High Subjective Strain</span>
                  <InfoButton 
                    variant="tooltip"
                    tooltipContent="Flagged when you have ≥60% responsibility AND ≥4/5 burden rating on any task. Research shows this pattern correlates with emotional overload (Cezar-Vaz et al., 2022)."
                  />
                </div>
                <Badge variant={wmliResults.myFlags.highSubjectiveStrain ? "destructive" : "secondary"}>
                  {wmliResults.myFlags.highSubjectiveStrain ? "DETECTED" : "Not Detected"}
                </Badge>
              </div>
              
              {wmliResults.myFlags.highSubjectiveStrain && strainTasks.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-medium mb-1">Flagged tasks:</p>
                  <div className="flex flex-wrap gap-1">
                    {strainTasks.map(task => (
                      <Badge key={task.id} variant="outline" className="text-xs">
                        {task.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fairness Risk */}
            <div className={`p-3 rounded-lg border-l-4 ${
              wmliResults.myFlags.fairnessRisk 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                : 'border-green-500 bg-green-50 dark:bg-green-950/20'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {wmliResults.myFlags.fairnessRisk ? (
                    <XCircle className="h-4 w-4 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium">Fairness Risk</span>
                  <InfoButton 
                    variant="tooltip"
                    tooltipContent="Flagged when weighted average unfairness ≥75%. Research links perceived unfairness to relationship strain and emotional fatigue (Barigozzi et al., 2025)."
                  />
                </div>
                <Badge variant={wmliResults.myFlags.fairnessRisk ? "outline" : "secondary"}>
                  {wmliResults.myFlags.fairnessRisk ? "DETECTED" : "Not Detected"}
                </Badge>
              </div>
              
              {wmliResults.myFlags.fairnessRisk && unfairnessTasks.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-medium mb-1">Tasks with fairness concerns:</p>
                  <div className="flex flex-wrap gap-1">
                    {unfairnessTasks.map(task => (
                      <Badge key={task.id} variant="outline" className="text-xs">
                        {task.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Equity Priority (for couples) */}
            {!isSingleAdult && (
              <div className={`p-3 rounded-lg border-l-4 ${
                wmliResults.myFlags.equityPriority 
                  ? 'border-red-600 bg-red-50 dark:bg-red-950/20' 
                  : 'border-green-500 bg-green-50 dark:bg-green-950/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {wmliResults.myFlags.equityPriority ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium">Equity Priority</span>
                    <InfoButton 
                      variant="tooltip"
                      tooltipContent="Flagged when you carry ≥60% household WMLI AND report unfairness ≥4/5. Indicates urgent need for renegotiation to prevent relationship strain."
                    />
                  </div>
                  <Badge variant={wmliResults.myFlags.equityPriority ? "destructive" : "secondary"}>
                    {wmliResults.myFlags.equityPriority ? "URGENT" : "Balanced"}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Disparity Analysis (for couples) */}
      {!isSingleAdult && wmliResults.disparity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Couple Disparity Analysis
            </CardTitle>
            <CardDescription>
              Within-couple equity analysis based on research-informed thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mental Load Gap</span>
                  <span className="text-sm">{wmliResults.disparity.mentalLoadGap.toFixed(1)}pp</span>
                </div>
                <Progress 
                  value={Math.min(wmliResults.disparity.mentalLoadGap, 50)} 
                  max={50}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {wmliResults.disparity.mentalLoadGap >= 20 ? "⚠️ Significant gap" : "✓ Manageable difference"}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Load Ratio</span>
                  <span className="text-sm">{wmliResults.disparity.mentalLoadRatio.toFixed(1)}:1</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {wmliResults.disparity.overburdened === 'me' && "You carry more mental load"}
                  {wmliResults.disparity.overburdened === 'partner' && "Partner carries more mental load"}
                  {wmliResults.disparity.overburdened === 'none' && "Reasonably balanced distribution"}
                </div>
              </div>
            </div>
            
            {wmliResults.disparity.highEquityRisk && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  🚨 High Equity Risk Detected
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Large disparity combined with fairness concerns. Priority for conversation and renegotiation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actionable Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Research-Informed Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wmliResults.myFlags.highSubjectiveStrain && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm font-medium">Address High-Strain Tasks</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Focus on redistributing or reducing burden for tasks where you have high responsibility and high burden ratings.
                </p>
              </div>
            )}
            
            {wmliResults.myFlags.fairnessRisk && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <p className="text-sm font-medium">Improve Recognition</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Discuss how household contributions can be better acknowledged and appreciated.
                </p>
              </div>
            )}
            
            {wmliResults.disparity?.highEquityRisk && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="text-sm font-medium">Urgent Renegotiation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Schedule dedicated time to redistribute household responsibilities and address fairness concerns.
                </p>
              </div>
            )}
            
            {!wmliResults.myFlags.highSubjectiveStrain && !wmliResults.myFlags.fairnessRisk && !wmliResults.disparity?.highEquityRisk && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm font-medium">Maintain Current Approach</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No major risk indicators detected. Continue regular check-ins to maintain balance.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};