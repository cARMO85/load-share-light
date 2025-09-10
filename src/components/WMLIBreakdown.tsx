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
  XCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

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

  // Debug partner data
  console.log('WMLIBreakdown Debug:', {
    myWMLI_Intensity: wmliResults.myWMLI_Intensity,
    partnerWMLI_Intensity: wmliResults.partnerWMLI_Intensity,
    myWMLI_Share: wmliResults.myWMLI_Share,
    partnerWMLI_Share: wmliResults.partnerWMLI_Share,
    isSingleAdult
  });

  // Prepare intensity comparison data (0-100 scale) - always show both partners
  const intensityData = [
    {
      name: 'Partner 1',
      intensity: wmliResults.myWMLI_Intensity || 0,
      fill: 'hsl(var(--primary))'
    },
    {
      name: 'Partner 2', 
      intensity: wmliResults.partnerWMLI_Intensity || 0,
      fill: 'hsl(var(--secondary))'
    }
  ];

  // Use the proper share percentages from WMLI calculation
  const partner1Percentage = wmliResults.myWMLI_Share || (isSingleAdult ? 100 : 50);
  const partner2Percentage = wmliResults.partnerWMLI_Share || (isSingleAdult ? 0 : 50);

  // Pie chart data for load distribution (equity view) - show if not single adult
  const pieData = !isSingleAdult ? [
    { 
      name: 'Partner 1 Share', 
      value: partner1Percentage, 
      fill: 'hsl(var(--primary))' 
    },
    { 
      name: 'Partner 2 Share', 
      value: partner2Percentage, 
      fill: 'hsl(var(--secondary))' 
    }
  ] : [];

  const getIntensityDescription = (score: number) => {
    if (score >= 75) return { text: "Very high subjective workload", color: "text-red-600" };
    if (score >= 50) return { text: "Moderate subjective workload", color: "text-orange-600" };
    if (score >= 25) return { text: "Light subjective workload", color: "text-yellow-600" };
    return { text: "Minimal subjective workload", color: "text-green-600" };
  };

  const getEquityDescription = (percentage: number) => {
    if (percentage >= 70) return { text: "Carrying most of the load", color: "text-red-600" };
    if (percentage >= 60) return { text: "Carrying more than fair share", color: "text-orange-600" };
    if (percentage >= 40) return { text: "Balanced share", color: "text-green-600" };
    return { text: "Carrying less of the load", color: "text-blue-600" };
  };

  const hasAnyIssues = wmliResults.myFlags.highSubjectiveStrain || 
                      wmliResults.myFlags.fairnessRisk || 
                      wmliResults.myFlags.equityPriority;

  return (
    <div className="space-y-6">
      {/* WMLI Intensity Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            WMLI Intensity: Average Subjective Workload
            <InfoButton variant="tooltip" tooltipContent="WMLI Intensity (0-100) shows the average subjective workload across all tasks each partner handles. This reflects how heavy the mental load feels on average." />
          </CardTitle>
          <CardDescription>
            How heavy does the mental load feel across your tasks? (0 = no strain, 100 = very high strain)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intensityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}/100`, 'WMLI Intensity']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="intensity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{wmliResults.myWMLI_Intensity || 0}/100</div>
              <p className={`text-sm ${getIntensityDescription(wmliResults.myWMLI_Intensity || 0).color}`}>
                Partner 1: {getIntensityDescription(wmliResults.myWMLI_Intensity || 0).text}
              </p>
            </div>
            
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <div className="text-3xl font-bold text-secondary">{wmliResults.partnerWMLI_Intensity || 0}/100</div>
              <p className={`text-sm ${getIntensityDescription(wmliResults.partnerWMLI_Intensity || 0).color}`}>
                Partner 2: {getIntensityDescription(wmliResults.partnerWMLI_Intensity || 0).text}
              </p>
              {(wmliResults.partnerWMLI_Intensity || 0) === 0 && !isSingleAdult && (
                <p className="text-xs text-muted-foreground mt-1">No partner data available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WMLI Share - Equity View */}
      {!isSingleAdult && (
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            WMLI Share: Household Equity Distribution
            <InfoButton variant="tooltip" tooltipContent="WMLI Share shows what percentage of your household's total invisible mental load each partner carries. 40-60% is generally considered balanced." />
          </CardTitle>
            <CardDescription>
              Who carries what percentage of the household's total invisible load? (Target: 40-60% each)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${Math.round(value)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${Math.round(value as number)}%`, 'Mental Load Share']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Partner 1 carries:</span>
                  <div className="text-right">
                    <span className="font-bold text-primary text-lg">
                      {partner1Percentage}%
                    </span>
                    <p className={`text-xs ${getEquityDescription(partner1Percentage).color}`}>
                      {getEquityDescription(partner1Percentage).text}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Partner 2 carries:</span>
                  <div className="text-right">
                    <span className="font-bold text-secondary text-lg">
                      {partner2Percentage}%
                    </span>
                    <p className={`text-xs ${getEquityDescription(partner2Percentage).color}`}>
                      {getEquityDescription(partner2Percentage).text}
                    </p>
                  </div>
                </div>
                
                {wmliResults.disparity?.mentalLoadGap && wmliResults.disparity.mentalLoadGap >= 20 && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      {wmliResults.disparity.highEquityRisk ? '🚨 High equity risk' : '⚠️ Significant imbalance'}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      {Math.round(wmliResults.disparity.mentalLoadGap)}pp gap in mental load share{wmliResults.disparity.highEquityRisk ? ' with fairness concerns' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Household Wellbeing Indicators */}
      {hasAnyIssues && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Areas for Your Household to Address
            </CardTitle>
            <CardDescription>
              Based on both partners' responses, here's what might need attention in your household
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {wmliResults.myFlags.highSubjectiveStrain && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-700 dark:text-red-400">
                    One partner is feeling overwhelmed by some tasks
                  </span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Partner 1 is handling most of the work AND finding it really stressful for: {strainTasks.map(t => t.title).join(', ')}
                </p>
              </div>
            )}
            
            {wmliResults.myFlags.fairnessRisk && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-orange-700 dark:text-orange-400">
                    Some contributions feel unrecognized
                  </span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  One partner feels their household contributions aren't being recognized or appreciated enough
                </p>
              </div>
            )}
            
            {wmliResults.myFlags.equityPriority && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-700 dark:text-red-400">
                    Significant household imbalance
                  </span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">
                  One partner is carrying most of the mental load AND it feels unfair - time for a household conversation!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Household Action Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Next Steps for Your Household
          </CardTitle>
          <CardDescription>
            Actionable steps based on your household's results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wmliResults.myFlags.highSubjectiveStrain && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="font-medium mb-2">🎯 Focus on your most stressful tasks</p>
                <p className="text-sm text-muted-foreground">
                  Start with {strainTasks.slice(0, 2).map(t => t.title).join(' and ')}. 
                  Can you share these with your partner or find ways to make them easier?
                </p>
              </div>
            )}
            
            {wmliResults.myFlags.fairnessRisk && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <p className="font-medium mb-2">💬 Have a conversation about appreciation</p>
                <p className="text-sm text-muted-foreground">
                  Talk about how you can both better recognize and appreciate each other's contributions
                </p>
              </div>
            )}
            
            {wmliResults.disparity?.highEquityRisk && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="font-medium mb-2">⚠️ Time for a household reset</p>
                <p className="text-sm text-muted-foreground">
                  The mental load imbalance is significant. Schedule a dedicated time to redistribute responsibilities fairly
                </p>
              </div>
            )}
            
            {!hasAnyIssues && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="font-medium mb-2">✅ Things look pretty balanced!</p>
                <p className="text-sm text-muted-foreground">
                  No major issues detected. Keep checking in with each other regularly to maintain this balance
                </p>
              </div>
            )}
            
            <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
              <p className="font-medium mb-2">📋 Use the conversation cards</p>
              <p className="text-sm text-muted-foreground">
                Check out the "Conversation" tab above for structured discussion prompts to help you talk through any issues
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};