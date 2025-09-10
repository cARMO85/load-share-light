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

  // Prepare chart data - always show both bars for comparison
  const comparisonData = [
    {
      name: 'You',
      mentalLoad: wmliResults.myWMLI,
      fill: 'hsl(var(--primary))'
    },
    {
      name: 'Partner',
      mentalLoad: wmliResults.partnerWMLI || 0,
      fill: 'hsl(var(--secondary))'
    }
  ];

  // Calculate load percentages from WMLI scores
  const myPercentage = wmliResults.partnerWMLI ? 
    Math.round((wmliResults.myWMLI / (wmliResults.myWMLI + wmliResults.partnerWMLI)) * 100) : 100;
  const partnerPercentage = wmliResults.partnerWMLI ? 
    Math.round((wmliResults.partnerWMLI / (wmliResults.myWMLI + wmliResults.partnerWMLI)) * 100) : 0;

  // Pie chart data for load distribution
  const pieData = wmliResults.partnerWMLI ? [
    { 
      name: 'Your Load', 
      value: myPercentage, 
      fill: 'hsl(var(--primary))' 
    },
    { 
      name: 'Partner Load', 
      value: partnerPercentage, 
      fill: 'hsl(var(--secondary))' 
    }
  ] : [];

  const getLoadDescription = (score: number) => {
    if (score >= 70) return { text: "High mental load", color: "text-red-600" };
    if (score >= 40) return { text: "Moderate mental load", color: "text-orange-600" };
    return { text: "Low mental load", color: "text-green-600" };
  };

  const hasAnyIssues = wmliResults.myFlags.highSubjectiveStrain || 
                      wmliResults.myFlags.fairnessRisk || 
                      wmliResults.myFlags.equityPriority;

  return (
    <div className="space-y-6">
      {/* Mental Load Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Your Mental Load at a Glance
          </CardTitle>
          <CardDescription>
            Higher scores mean you're feeling more overwhelmed by household tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}/100`, 'Mental Load Score']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="mentalLoad" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{wmliResults.myWMLI}/100</div>
              <p className={`text-sm ${getLoadDescription(wmliResults.myWMLI).color}`}>
                {getLoadDescription(wmliResults.myWMLI).text}
              </p>
            </div>
            
            {wmliResults.partnerWMLI && (
              <div className="text-center p-4 bg-secondary/5 rounded-lg">
                <div className="text-3xl font-bold text-secondary">{wmliResults.partnerWMLI}/100</div>
                <p className={`text-sm ${getLoadDescription(wmliResults.partnerWMLI).color}`}>
                  {getLoadDescription(wmliResults.partnerWMLI).text}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Load Distribution for Couples */}
      {!isSingleAdult && wmliResults.partnerWMLI && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Who's Carrying the Mental Load?
            </CardTitle>
            <CardDescription>
              A balanced relationship usually splits mental work 40-60%
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
                  <span>You carry:</span>
                  <span className="font-bold text-primary">
                    {myPercentage}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Partner carries:</span>
                  <span className="font-bold text-secondary">
                    {partnerPercentage}%
                  </span>
                </div>
                
                {wmliResults.disparity?.mentalLoadGap && wmliResults.disparity.mentalLoadGap > 20 && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      ⚠️ Big gap detected
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      One person is carrying {Math.round(wmliResults.disparity.mentalLoadGap)}% more mental load
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Issues Summary */}
      {hasAnyIssues && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Things to Watch Out For
            </CardTitle>
            <CardDescription>
              Based on your responses, here's what might need attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {wmliResults.myFlags.highSubjectiveStrain && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-700 dark:text-red-400">
                    You're feeling overwhelmed by some tasks
                  </span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">
                  You're doing most of the work AND finding it really stressful for: {strainTasks.map(t => t.title).join(', ')}
                </p>
              </div>
            )}
            
            {wmliResults.myFlags.fairnessRisk && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-orange-700 dark:text-orange-400">
                    Some tasks feel unfair
                  </span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  You feel your contributions aren't being recognized or appreciated enough
                </p>
              </div>
            )}
            
            {wmliResults.myFlags.equityPriority && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-700 dark:text-red-400">
                    Big imbalance in your relationship
                  </span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">
                  You're carrying most of the mental load AND it feels unfair - time for a conversation!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Simple Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            What Should You Do Next?
          </CardTitle>
          <CardDescription>
            Simple steps based on your results
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