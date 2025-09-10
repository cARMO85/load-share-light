import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WMLIResults } from '@/lib/calculationUtils';
import { TaskResponse } from '@/types/assessment';
import { 
  Users, 
  TrendingUp, 
  Brain, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface HouseholdInsightsProps {
  wmliResults: WMLIResults;
  taskResponses: TaskResponse[];
  results: {
    myVisiblePercentage: number;
    partnerVisiblePercentage?: number;
    myMentalPercentage: number;
    partnerMentalPercentage?: number;
  };
  isSingleAdult?: boolean;
}

const HouseholdInsights: React.FC<HouseholdInsightsProps> = ({
  wmliResults,
  taskResponses,
  results,
  isSingleAdult = false
}) => {
  // Helper to get workload assessment for both partners
  const getWorkloadAssessment = (intensity: number, share: number, isPartner1: boolean) => {
    const partnerName = isPartner1 ? "Partner 1" : "Partner 2";
    const intensityLevel = intensity >= 70 ? "high" : intensity >= 40 ? "moderate" : "low";
    const shareLevel = share >= 60 ? "majority" : share >= 40 ? "balanced" : "minority";
    
    return {
      partnerName,
      intensityLevel,
      shareLevel,
      intensityColor: intensity >= 70 ? "text-red-600" : intensity >= 40 ? "text-orange-600" : "text-green-600",
      shareColor: share >= 60 ? "text-orange-600" : share >= 40 ? "text-green-600" : "text-blue-600"
    };
  };

  const partner1Assessment = getWorkloadAssessment(
    wmliResults.myWMLI_Intensity || 0, 
    wmliResults.myWMLI_Share || 100, 
    true
  );
  
  const partner2Assessment = getWorkloadAssessment(
    wmliResults.partnerWMLI_Intensity || 0, 
    wmliResults.partnerWMLI_Share || 0, 
    false
  );

  if (isSingleAdult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Your Individual Assessment
            </CardTitle>
            <CardDescription>
              Personal mental load and household work overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{wmliResults.myWMLI_Intensity || 0}/100</div>
                  <p className="text-sm text-muted-foreground">Mental Load Intensity</p>
                </div>
                <div className="text-center p-4 bg-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{results.myVisiblePercentage}%</div>
                  <p className="text-sm text-muted-foreground">Visible Work Share</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {wmliResults.interpretationContext}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Household Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Your Household at a Glance
          </CardTitle>
          <CardDescription>
            How mental load and visible work are distributed between you both
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partner 1 Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-primary">Partner 1</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mental Load Intensity:</span>
                  <span className={`font-medium ${partner1Assessment.intensityColor}`}>
                    {wmliResults.myWMLI_Intensity || 0}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mental Load Share:</span>
                  <span className={`font-medium ${partner1Assessment.shareColor}`}>
                    {wmliResults.myWMLI_Share || 100}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Visible Work Share:</span>
                  <span className="font-medium text-blue-600">
                    {results.myVisiblePercentage}%
                  </span>
                </div>
              </div>
              
              {/* Partner 1 Flags */}
              <div className="flex flex-wrap gap-1">
                {wmliResults.myFlags.highSubjectiveStrain && (
                  <Badge variant="destructive" className="text-xs">Feeling Overwhelmed</Badge>
                )}
                {wmliResults.myFlags.fairnessRisk && (
                  <Badge variant="outline" className="text-xs border-orange-500">Feels Unrecognized</Badge>
                )}
              </div>
            </div>

            {/* Partner 2 Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-secondary">Partner 2</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mental Load Intensity:</span>
                  <span className={`font-medium ${partner2Assessment.intensityColor}`}>
                    {wmliResults.partnerWMLI_Intensity || 0}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mental Load Share:</span>
                  <span className={`font-medium ${partner2Assessment.shareColor}`}>
                    {wmliResults.partnerWMLI_Share || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Visible Work Share:</span>
                  <span className="font-medium text-blue-600">
                    {results.partnerVisiblePercentage || 0}%
                  </span>
                </div>
              </div>
              
              {/* Partner 2 Flags */}
              <div className="flex flex-wrap gap-1">
                {wmliResults.partnerFlags?.highSubjectiveStrain && (
                  <Badge variant="destructive" className="text-xs">Feeling Overwhelmed</Badge>
                )}
                {wmliResults.partnerFlags?.fairnessRisk && (
                  <Badge variant="outline" className="text-xs border-orange-500">Feels Unrecognized</Badge>
                )}
                {(wmliResults.partnerWMLI_Intensity || 0) === 0 && (
                  <Badge variant="secondary" className="text-xs">Limited Data</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Household Balance Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            What This Means for Your Household
          </CardTitle>
          <CardDescription>
            Insights and observations for both partners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Balance */}
            {wmliResults.disparity && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Household Balance</h4>
                <p className="text-sm text-muted-foreground">
                  {wmliResults.disparity.mentalLoadGap < 20 ? (
                    <>
                      <CheckCircle className="inline h-4 w-4 text-green-500 mr-1" />
                      Your mental load distribution appears fairly balanced ({Math.round(wmliResults.disparity.mentalLoadGap)}% gap).
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="inline h-4 w-4 text-orange-500 mr-1" />
                      There's a noticeable gap in mental load distribution ({Math.round(wmliResults.disparity.mentalLoadGap)}% difference).
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Personalized Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-primary/5 rounded-lg">
                <h4 className="font-medium text-primary mb-1">For Partner 1</h4>
                <p className="text-xs text-muted-foreground">
                  You're experiencing {partner1Assessment.intensityLevel} subjective workload and carrying a {partner1Assessment.shareLevel} share of mental load.
                  {wmliResults.myFlags.highSubjectiveStrain && " Consider discussing which tasks feel most overwhelming."}
                  {wmliResults.myFlags.fairnessRisk && " Your contributions may need better recognition."}
                </p>
              </div>
              
              <div className="p-3 bg-secondary/5 rounded-lg">
                <h4 className="font-medium text-secondary mb-1">For Partner 2</h4>
                <p className="text-xs text-muted-foreground">
                  {wmliResults.partnerWMLI_Intensity ? (
                    <>
                      You're experiencing {partner2Assessment.intensityLevel} subjective workload and carrying a {partner2Assessment.shareLevel} share of mental load.
                      {wmliResults.partnerFlags?.highSubjectiveStrain && " Consider discussing which tasks feel most overwhelming."}
                      {wmliResults.partnerFlags?.fairnessRisk && " Your contributions may need better recognition."}
                    </>
                  ) : (
                    "Limited assessment data available. Consider completing a separate assessment for more personalized insights."
                  )}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                Next Steps for Your Household
              </h4>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                {wmliResults.disparity?.highEquityRisk && (
                  <li>• Schedule a household conversation about redistributing responsibilities</li>
                )}
                {(wmliResults.myFlags.highSubjectiveStrain || wmliResults.partnerFlags?.highSubjectiveStrain) && (
                  <li>• Identify the most stressful tasks and brainstorm solutions together</li>
                )}
                {(wmliResults.myFlags.fairnessRisk || wmliResults.partnerFlags?.fairnessRisk) && (
                  <li>• Practice expressing appreciation for each other's contributions</li>
                )}
                <li>• Use the conversation cards in the Discussion tab to facilitate dialogue</li>
                <li>• Check in regularly to maintain balance as life circumstances change</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HouseholdInsights;