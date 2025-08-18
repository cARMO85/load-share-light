import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  FileText, 
  Share, 
  Copy, 
  MessageCircle, 
  Lightbulb,
  Target,
  Users,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CalculatedResults, AssessmentData } from '@/types/assessment';
import { generateConversationReport } from '@/lib/conversationEngine';

interface ConversationReportProps {
  results: CalculatedResults;
  assessmentData: AssessmentData;
  insights: Array<{ type: string; description: string; taskName?: string }>;
  discussionNotes: Record<string, string>;
  onAddNextSteps?: (nextSteps: string) => void;
}

export const ConversationReport: React.FC<ConversationReportProps> = ({
  results,
  assessmentData,
  insights,
  discussionNotes,
  onAddNextSteps
}) => {
  const [nextSteps, setNextSteps] = useState('');
  const [showFullReport, setShowFullReport] = useState(false);
  const { toast } = useToast();

  const isTogetherMode = assessmentData.householdSetup.assessmentMode === 'together';
  const hasInsights = insights.length > 0;
  const hasNotes = Object.values(discussionNotes).some(note => note.trim().length > 0);

  const handleCopyReport = async () => {
    const reportText = generateConversationReport(results, assessmentData, insights, discussionNotes);
    try {
      await navigator.clipboard.writeText(reportText);
      toast({
        title: "Report copied!",
        description: "The conversation report has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try downloading instead.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReport = () => {
    const reportText = generateConversationReport(results, assessmentData, insights, discussionNotes);
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `household-conversation-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report downloaded!",
      description: "Your conversation report has been saved as a Markdown file.",
    });
  };

  const handleSaveNextSteps = () => {
    if (onAddNextSteps && nextSteps.trim()) {
      onAddNextSteps(nextSteps);
      toast({
        title: "Next steps saved!",
        description: "Your action items have been recorded.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Conversation Summary & Report
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isTogetherMode 
              ? "A summary of your discussion and insights to support ongoing conversations"
              : "A record of your reflections to guide future conversations"
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Work Distribution
                </h4>
                <div className="space-y-1 text-sm">
                  <div>Visible work: You {results.myVisiblePercentage}%{results.partnerVisiblePercentage ? `, Partner ${results.partnerVisiblePercentage}%` : ''}</div>
                  <div>Mental load: You {results.myMentalPercentage}%{results.partnerMentalPercentage ? `, Partner ${results.partnerMentalPercentage}%` : ''}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Discussion Progress
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={hasInsights ? "default" : "secondary"} className="text-xs">
                      {insights.length} insights
                    </Badge>
                    <Badge variant={hasNotes ? "default" : "secondary"} className="text-xs">
                      {Object.keys(discussionNotes).length} topics discussed
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          {hasInsights && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Key Insights from Your Assessment
              </h4>
              <div className="space-y-2">
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="p-3 bg-accent/10 rounded border border-accent/20">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {insight.type.replace('_', ' ')}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm">{insight.description}</p>
                        {insight.taskName && (
                          <p className="text-xs text-muted-foreground mt-1">Related to: {insight.taskName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {insights.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    + {insights.length - 3} more insights in full report
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Next Steps & Action Items
            </h4>
            <Textarea
              placeholder={isTogetherMode 
                ? "What did you agree to try? What will you do differently? When will you revisit this conversation?"
                : "What changes do you want to make? What conversations do you want to have? When will you revisit this?"
              }
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              rows={4}
              className="mb-3"
            />
            {nextSteps.trim() && (
              <Button size="sm" onClick={handleSaveNextSteps}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Save Action Items
              </Button>
            )}
          </div>

          <Separator />

          {/* Export Options */}
          <div>
            <h4 className="font-medium mb-3">Share & Export</h4>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCopyReport} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Report
              </Button>
              <Button onClick={handleDownloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download as File
              </Button>
              <Button 
                onClick={() => setShowFullReport(!showFullReport)} 
                variant="ghost" 
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                {showFullReport ? 'Hide' : 'Preview'} Full Report
              </Button>
            </div>
          </div>

          {/* Full Report Preview */}
          {showFullReport && (
            <div className="border rounded-lg p-4 bg-muted/20 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generateConversationReport(results, assessmentData, insights, discussionNotes)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ongoing Conversation Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Using This Report for Ongoing Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Regular Check-ins:</strong> Revisit this report monthly to see how things are changing.</p>
            <p><strong>Share with Others:</strong> Use this as a starting point for conversations with friends, family, or counselors.</p>
            <p><strong>Track Progress:</strong> Note what changes work and what doesn't to refine your approach.</p>
            <p><strong>Stay Curious:</strong> Household work patterns change with life circumstances - stay open to adjusting.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};