import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, AlertTriangle, Heart, MessageCircle, Calendar, Filter, Star, Edit2, Save, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface InsightEntry {
  id: string;
  type: 'breakthrough' | 'disagreement' | 'surprise';
  taskId?: string;
  taskName?: string;
  description: string;
  timestamp: Date;
  starred?: boolean;
  followUpAction?: string;
}

interface DiscussionInsightsProps {
  insights: InsightEntry[];
  onInsightUpdate: (insight: InsightEntry) => void;
  onInsightDelete: (insightId: string) => void;
  isTogetherMode: boolean;
}

export const DiscussionInsights: React.FC<DiscussionInsightsProps> = ({
  insights,
  onInsightUpdate,
  onInsightDelete,
  isTogetherMode
}) => {
  const [filterType, setFilterType] = useState<'all' | 'breakthrough' | 'disagreement' | 'surprise'>('all');
  const [editingInsight, setEditingInsight] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedFollowUp, setEditedFollowUp] = useState('');

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

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'breakthrough': return 'A moment of understanding or realization';
      case 'disagreement': return 'A difference in perspective to work through';
      case 'surprise': return 'Something unexpected that was discovered';
      default: return 'Insight';
    }
  };

  const filteredInsights = insights.filter(insight => 
    filterType === 'all' || insight.type === filterType
  );

  const sortedInsights = filteredInsights.sort((a, b) => {
    // Starred insights first
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    // Then by timestamp (most recent first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const startEdit = (insight: InsightEntry) => {
    setEditingInsight(insight.id);
    setEditedDescription(insight.description);
    setEditedFollowUp(insight.followUpAction || '');
  };

  const saveEdit = (insight: InsightEntry) => {
    const updatedInsight = {
      ...insight,
      description: editedDescription,
      followUpAction: editedFollowUp || undefined
    };
    onInsightUpdate(updatedInsight);
    setEditingInsight(null);
    setEditedDescription('');
    setEditedFollowUp('');
  };

  const cancelEdit = () => {
    setEditingInsight(null);
    setEditedDescription('');
    setEditedFollowUp('');
  };

  const toggleStar = (insight: InsightEntry) => {
    onInsightUpdate({ ...insight, starred: !insight.starred });
  };

  const typeStats = {
    breakthrough: insights.filter(i => i.type === 'breakthrough').length,
    disagreement: insights.filter(i => i.type === 'disagreement').length,
    surprise: insights.filter(i => i.type === 'surprise').length
  };

  if (insights.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-secondary/5">
        <CardContent className="pt-6 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Insights Yet</h3>
          <p className="text-sm text-muted-foreground">
            {isTogetherMode 
              ? "As you work through the questionnaire together, capture your key insights and discoveries."
              : "Start a conversation with your partner and capture the insights you discover together."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-secondary" />
            Discussion Insights
            <Badge variant="secondary">{insights.length} captured</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'breakthrough' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('breakthrough')}
                className="gap-1"
              >
                <Lightbulb className="h-3 w-3" />
                {typeStats.breakthrough}
              </Button>
              <Button
                variant={filterType === 'disagreement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('disagreement')}
                className="gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                {typeStats.disagreement}
              </Button>
              <Button
                variant={filterType === 'surprise' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('surprise')}
                className="gap-1"
              >
                <Heart className="h-3 w-3" />
                {typeStats.surprise}
              </Button>
            </div>
          </div>
        </CardTitle>
        
        <p className="text-sm text-muted-foreground">
          Review and organize the insights from your mental load discussions. Star important ones and add follow-up actions.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {sortedInsights.map((insight) => (
          <Card 
            key={insight.id} 
            className={`transition-all ${insight.starred ? 'ring-2 ring-primary/50' : ''} hover:shadow-md`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStar(insight)}
                    className="p-1"
                  >
                    <Star className={`h-4 w-4 ${
                      insight.starred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                    }`} />
                  </Button>
                  
                  <div className={`p-2 rounded-full ${getTypeColor(insight.type)}`}>
                    {getTypeIcon(insight.type)}
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getTypeColor(insight.type)}>
                          <span className="capitalize">{insight.type}</span>
                        </Badge>
                        {insight.taskName && (
                          <Badge variant="outline" className="text-xs">
                            {insight.taskName}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(insight.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTypeDescription(insight.type)}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(insight)}
                        className="p-1"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onInsightDelete(insight.id)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingInsight === insight.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          className="mt-1 min-h-[60px]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Follow-up Action (optional)</label>
                        <Textarea
                          value={editedFollowUp}
                          onChange={(e) => setEditedFollowUp(e.target.value)}
                          placeholder="What action should you take based on this insight?"
                          className="mt-1 min-h-[50px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(insight)}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-foreground">
                        {insight.description}
                      </div>
                      
                      {insight.followUpAction && (
                        <div className="bg-accent/10 border border-accent/20 p-3 rounded-md">
                          <div className="text-xs font-medium text-accent mb-1">Follow-up Action:</div>
                          <div className="text-sm text-foreground">{insight.followUpAction}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Summary at the bottom */}
        <div className="pt-4 border-t">
          <div className="text-center">
            <div className="text-sm font-medium text-foreground mb-2">
              Insight Summary
            </div>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>{typeStats.breakthrough} breakthroughs</span>
              <span>{typeStats.disagreement} disagreements</span>
              <span>{typeStats.surprise} surprises</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {insights.filter(i => i.starred).length} starred • {insights.filter(i => i.followUpAction).length} with follow-up actions
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};