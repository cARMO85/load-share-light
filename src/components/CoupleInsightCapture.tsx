import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Lightbulb, MessageCircle, AlertTriangle, Heart, CheckCircle } from 'lucide-react';

interface InsightEntry {
  id: string;
  type: 'breakthrough' | 'disagreement' | 'surprise';
  taskId?: string;
  taskName?: string;
  description: string;
  timestamp: Date;
}

interface CoupleInsightCaptureProps {
  onInsightAdded: (insight: InsightEntry) => void;
  onContinue: () => void;
  insights: InsightEntry[];
  currentTask?: { id: string; name: string } | null;
}

export const CoupleInsightCapture: React.FC<CoupleInsightCaptureProps> = ({
  onInsightAdded,
  onContinue,
  insights,
  currentTask
}) => {
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<'breakthrough' | 'disagreement' | 'surprise'>('breakthrough');

  const handleAddInsight = () => {
    if (!description.trim()) return;

    const insight: InsightEntry = {
      id: Date.now().toString(),
      type: selectedType,
      taskId: currentTask?.id,
      taskName: currentTask?.name,
      description: description.trim(),
      timestamp: new Date()
    };

    onInsightAdded(insight);
    setDescription('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breakthrough': return <Lightbulb className="h-4 w-4" />;
      case 'disagreement': return <AlertTriangle className="h-4 w-4" />;
      case 'surprise': return <Heart className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'breakthrough': return 'bg-primary/10 text-primary border-primary/20';
      case 'disagreement': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'surprise': return 'bg-secondary/10 text-secondary border-secondary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Capture Your Discussion Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          As you discuss each task, note any "aha!" moments, disagreements, or surprises. This becomes your action plan.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current task context */}
        {currentTask && (
          <div className="bg-muted/30 p-3 rounded-md">
            <div className="text-xs text-muted-foreground">Currently discussing:</div>
            <div className="font-medium">{currentTask.name}</div>
          </div>
        )}

        {/* Insight type selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">What did you discover?</Label>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'breakthrough' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('breakthrough')}
              className="flex-1"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Breakthrough
            </Button>
            <Button
              variant={selectedType === 'disagreement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('disagreement')}
              className="flex-1"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Disagreement
            </Button>
            <Button
              variant={selectedType === 'surprise' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('surprise')}
              className="flex-1"
            >
              <Heart className="h-4 w-4 mr-1" />
              Surprise
            </Button>
          </div>
        </div>

        {/* Description input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Describe the insight</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              selectedType === 'breakthrough' 
                ? "e.g., 'I never realized my partner spends 2 hours coordinating birthday parties - I thought it was just 30 minutes!'"
                : selectedType === 'disagreement'
                ? "e.g., 'We disagree on how much time meal planning actually takes - need to track this together'"
                : "e.g., 'Surprised that we both thought the other person was handling appointment scheduling!'"
            }
            className="min-h-[80px]"
          />
          <Button
            onClick={handleAddInsight}
            disabled={!description.trim()}
            size="sm"
            className="w-full"
          >
            Add Insight
          </Button>
        </div>

        {/* Captured insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Discussion Notes ({insights.length})</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {insights.map((insight) => (
                <div key={insight.id} className="bg-muted/50 p-3 rounded-md text-sm">
                  <div className="flex items-start gap-2 mb-1">
                    <Badge variant="outline" className={getTypeColor(insight.type)}>
                      {getTypeIcon(insight.type)}
                      <span className="ml-1 capitalize">{insight.type}</span>
                    </Badge>
                    {insight.taskName && (
                      <span className="text-xs text-muted-foreground">
                        {insight.taskName}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue button */}
        <div className="pt-4 border-t">
          <Button
            onClick={onContinue}
            className="w-full"
            variant={insights.length > 0 ? 'default' : 'outline'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {insights.length > 0 
              ? `Continue with ${insights.length} insights captured` 
              : 'Continue without capturing insights'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};