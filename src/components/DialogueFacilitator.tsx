import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Lightbulb, 
  Target, 
  Clock, 
  Brain, 
  Heart, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Users
} from 'lucide-react';
import { ConversationPrompt } from '@/lib/conversationEngine';

interface DialogueFacilitatorProps {
  prompts: ConversationPrompt[];
  onNotesUpdate: (promptId: string, notes: string) => void;
  onInsightCapture: (insight: string) => void;
  existingNotes: Record<string, string>;
  isTogetherMode: boolean;
  existingInsights: Array<{
    id: string;
    type: 'breakthrough' | 'disagreement' | 'surprise';
    taskId?: string;
    taskName?: string;
    description: string;
    timestamp: Date;
  }>;
}

export const DialogueFacilitator: React.FC<DialogueFacilitatorProps> = ({
  prompts,
  onNotesUpdate,
  onInsightCapture,
  existingNotes,
  isTogetherMode,
  existingInsights
}) => {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<Record<string, string>>(existingNotes);
  const [expandedVocabulary, setExpandedVocabulary] = useState<Set<string>>(new Set());

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invisible_work': return <Brain className="h-4 w-4" />;
      case 'imbalance': return <AlertTriangle className="h-4 w-4" />;
      case 'emotion': return <Heart className="h-4 w-4" />;
      case 'negotiation': return <Users className="h-4 w-4" />;
      case 'systems': return <Target className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'invisible_work': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300';
      case 'imbalance': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300';
      case 'emotion': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300';
      case 'negotiation': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300';
      case 'systems': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'important': return 'bg-yellow-500';
      case 'helpful': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSaveNotes = (promptId: string) => {
    onNotesUpdate(promptId, currentNotes[promptId] || '');
    setActivePrompt(null);
  };

  const toggleVocabulary = (promptId: string) => {
    const newExpanded = new Set(expandedVocabulary);
    if (newExpanded.has(promptId)) {
      newExpanded.delete(promptId);
    } else {
      newExpanded.add(promptId);
    }
    setExpandedVocabulary(newExpanded);
  };

  if (prompts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No conversation prompts generated yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Guided Conversation</h2>
        <p className="text-muted-foreground">
          {isTogetherMode 
            ? "Work through these discussion prompts together to understand your household work patterns"
            : "Use these prompts for self-reflection or future conversations"
          }
        </p>
      </div>

      {prompts.map((prompt, index) => (
        <Card key={prompt.id} className="shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getCategoryColor(prompt.category)}`}>
                  {getCategoryIcon(prompt.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(prompt.priority)}`} />
                    <Badge variant="outline" className={getCategoryColor(prompt.category)}>
                      {prompt.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{prompt.context}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Main Question */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Discussion Question
              </h4>
              <p className="text-foreground">{prompt.question}</p>
            </div>

            {/* Discussion Starters */}
            <div>
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Conversation Starters
              </h5>
              <ul className="space-y-2">
                {prompt.discussionStarters.map((starter, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    "{starter}"
                  </li>
                ))}
              </ul>
            </div>

            {/* Shared Vocabulary */}
            {prompt.sharedVocabulary && prompt.sharedVocabulary.length > 0 && (
              <div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleVocabulary(prompt.id)}
                  className="p-0 h-auto font-medium text-sm"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {expandedVocabulary.has(prompt.id) ? 'Hide' : 'Show'} Key Terms
                </Button>
                
                {expandedVocabulary.has(prompt.id) && (
                  <div className="mt-2 p-3 bg-muted/50 rounded border">
                    {prompt.sharedVocabulary.map((term, i) => (
                      <div key={i} className="text-sm mb-2 last:mb-0">
                        <strong>{term.split(':')[0]}:</strong> {term.split(':')[1]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Existing Insights from Questionnaire */}
            {existingInsights.length > 0 && (
              <div className="p-3 bg-accent/5 rounded border border-accent/20">
                <h6 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Your Previous Insights
                </h6>
                <div className="space-y-2">
                  {existingInsights.map((insight) => (
                    <div key={insight.id} className="text-sm p-2 bg-background/50 rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={
                            insight.type === 'surprise' ? 'border-blue-300 text-blue-700' :
                            insight.type === 'disagreement' ? 'border-orange-300 text-orange-700' :
                            'border-green-300 text-green-700'
                          }
                        >
                          {insight.type}
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

            {/* Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">Discussion Notes</h5>
                {existingNotes[prompt.id] && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Notes saved
                  </Badge>
                )}
              </div>
              
              {activePrompt === prompt.id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder={isTogetherMode 
                      ? "Record key points from your discussion..."
                      : "Record your thoughts and reflections..."
                    }
                    value={currentNotes[prompt.id] || ''}
                    onChange={(e) => setCurrentNotes({
                      ...currentNotes,
                      [prompt.id]: e.target.value
                    })}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveNotes(prompt.id)}>
                      Save Notes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActivePrompt(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {existingNotes[prompt.id] ? (
                    <div className="p-3 bg-muted/30 rounded border text-sm mb-2">
                      {existingNotes[prompt.id]}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-2">No notes yet</p>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setActivePrompt(prompt.id)}
                  >
                    {existingNotes[prompt.id] ? 'Edit Notes' : 'Add Notes'}
                  </Button>
                </div>
              )}
            </div>

            {/* Action Prompts */}
            {prompt.actionPrompts && prompt.actionPrompts.length > 0 && (
              <div className="p-3 bg-accent/10 rounded border border-accent/20">
                <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Action Ideas
                </h6>
                <ul className="space-y-1">
                  {prompt.actionPrompts.map((action, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-accent">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};