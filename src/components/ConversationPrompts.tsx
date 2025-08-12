import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Lightbulb, Target, Clock, Brain, Heart, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConversationPrompt {
  id: string;
  category: 'workload' | 'perception' | 'emotion' | 'planning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  question: string;
  context: string;
  followUp?: string[];
  discussed?: boolean;
  notes?: string;
}

interface ConversationPromptsProps {
  prompts: ConversationPrompt[];
  onPromptDiscussed: (promptId: string, notes: string) => void;
  isTogetherMode: boolean;
}

export const ConversationPrompts: React.FC<ConversationPromptsProps> = ({
  prompts,
  onPromptDiscussed,
  isTogetherMode
}) => {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [discussionNotes, setDiscussionNotes] = useState<Record<string, string>>({});

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workload': return <Clock className="h-4 w-4" />;
      case 'perception': return <Brain className="h-4 w-4" />;
      case 'emotion': return <Heart className="h-4 w-4" />;
      case 'planning': return <Target className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workload': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'perception': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'emotion': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'planning': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  const handleMarkDiscussed = (promptId: string) => {
    const notes = discussionNotes[promptId] || '';
    onPromptDiscussed(promptId, notes);
    setActivePrompt(null);
    setDiscussionNotes(prev => ({ ...prev, [promptId]: '' }));
  };

  const priorityOrder = { high: 1, medium: 2, low: 3 };
  const sortedPrompts = prompts.sort((a, b) => {
    if (a.discussed !== b.discussed) {
      return a.discussed ? 1 : -1; // Undiscussed first
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const undiscussedCount = prompts.filter(p => !p.discussed).length;

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          {isTogetherMode ? 'Discussion Starters' : 'Conversation Points to Share'}
          {undiscussedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {undiscussedCount} to discuss
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isTogetherMode 
            ? "Use these prompts to guide your conversation about mental load distribution."
            : "Share these talking points with your partner to start meaningful discussions about household responsibilities."
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {sortedPrompts.map((prompt) => (
          <Card 
            key={prompt.id} 
            className={`transition-all ${getPriorityColor(prompt.priority)} ${
              prompt.discussed ? 'opacity-75 bg-muted/30' : 'hover:shadow-md'
            } ${activePrompt === prompt.id ? 'ring-2 ring-primary' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {prompt.discussed && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                  <Badge variant="outline" className={getCategoryColor(prompt.category)}>
                    {getCategoryIcon(prompt.category)}
                    <span className="ml-1 capitalize">{prompt.category}</span>
                  </Badge>
                  <Badge variant={prompt.priority === 'high' ? 'destructive' : prompt.priority === 'medium' ? 'default' : 'secondary'}>
                    {prompt.priority} priority
                  </Badge>
                </div>
                {!prompt.discussed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActivePrompt(activePrompt === prompt.id ? null : prompt.id)}
                    className="ml-2"
                  >
                    {activePrompt === prompt.id ? 'Close' : 'Discuss'}
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">{prompt.title}</h3>
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  <strong>Context:</strong> {prompt.context}
                </div>
                <div className="text-sm font-medium text-foreground">
                  <strong>Discussion Question:</strong> {prompt.question}
                </div>
              </div>
            </CardHeader>

            {activePrompt === prompt.id && (
              <CardContent className="pt-0 space-y-4">
                {prompt.followUp && prompt.followUp.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Follow-up questions:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {prompt.followUp.map((question, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Discussion Notes</label>
                  <Textarea
                    value={discussionNotes[prompt.id] || ''}
                    onChange={(e) => setDiscussionNotes(prev => ({ ...prev, [prompt.id]: e.target.value }))}
                    placeholder="Capture key points from your discussion..."
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleMarkDiscussed(prompt.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Discussed
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActivePrompt(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            )}

            {prompt.discussed && prompt.notes && (
              <CardContent className="pt-0">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Discussion Notes:</div>
                  <div className="text-sm text-green-700 dark:text-green-300">{prompt.notes}</div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        
        {undiscussedCount === 0 && prompts.length > 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-2">All Discussions Complete!</h3>
            <p className="text-sm text-muted-foreground">
              You've worked through all the conversation prompts. Great job communicating about mental load!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};