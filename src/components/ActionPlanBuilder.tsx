import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Calendar, User, CheckCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  owner: 'me' | 'partner' | 'both';
  timeline: 'immediate' | 'week' | 'month' | 'ongoing';
  category: 'redistribute' | 'system' | 'conversation' | 'experiment';
  completed?: boolean;
  createdAt: Date;
}

interface ActionPlanBuilderProps {
  initialActions?: ActionItem[];
  onActionsChange: (actions: ActionItem[]) => void;
  isTogetherMode: boolean;
}

export const ActionPlanBuilder: React.FC<ActionPlanBuilderProps> = ({
  initialActions = [],
  onActionsChange,
  isTogetherMode
}) => {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    owner: 'both' as 'me' | 'partner' | 'both',
    timeline: 'week' as 'immediate' | 'week' | 'month' | 'ongoing',
    category: 'redistribute' as 'redistribute' | 'system' | 'conversation' | 'experiment'
  });

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'redistribute':
        return { label: 'Redistribute Tasks', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '⚖️' };
      case 'system':
        return { label: 'Create Systems', color: 'bg-green-100 text-green-800 border-green-200', icon: '🔧' };
      case 'conversation':
        return { label: 'Communication', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '💬' };
      case 'experiment':
        return { label: 'Trial Period', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🧪' };
      default:
        return { label: category, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📝' };
    }
  };

  const getTimelineInfo = (timeline: string) => {
    switch (timeline) {
      case 'immediate':
        return { label: 'This Week', color: 'bg-red-100 text-red-800', icon: '🔥' };
      case 'week':
        return { label: 'Next 2 Weeks', color: 'bg-yellow-100 text-yellow-800', icon: '📅' };
      case 'month':
        return { label: 'This Month', color: 'bg-blue-100 text-blue-800', icon: '📆' };
      case 'ongoing':
        return { label: 'Ongoing', color: 'bg-purple-100 text-purple-800', icon: '♻️' };
      default:
        return { label: timeline, color: 'bg-gray-100 text-gray-800', icon: '⏰' };
    }
  };

  const getOwnerInfo = (owner: string) => {
    switch (owner) {
      case 'me':
        return { label: 'Me', color: 'bg-primary/10 text-primary' };
      case 'partner':
        return { label: 'Partner', color: 'bg-secondary/10 text-secondary' };
      case 'both':
        return { label: 'Together', color: 'bg-accent/10 text-accent' };
      default:
        return { label: owner, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const addAction = () => {
    if (!newAction.title.trim()) return;

    const action: ActionItem = {
      id: Date.now().toString(),
      ...newAction,
      completed: false,
      createdAt: new Date()
    };

    const updatedActions = [...actions, action];
    setActions(updatedActions);
    onActionsChange(updatedActions);
    
    setNewAction({
      title: '',
      description: '',
      owner: 'both',
      timeline: 'week',
      category: 'redistribute'
    });
    setShowAddForm(false);
  };

  const toggleComplete = (actionId: string) => {
    const updatedActions = actions.map(action =>
      action.id === actionId ? { ...action, completed: !action.completed } : action
    );
    setActions(updatedActions);
    onActionsChange(updatedActions);
  };

  const deleteAction = (actionId: string) => {
    const updatedActions = actions.filter(action => action.id !== actionId);
    setActions(updatedActions);
    onActionsChange(updatedActions);
  };

  const completedCount = actions.filter(a => a.completed).length;
  const totalCount = actions.length;

  // Sample action suggestions
  const actionSuggestions = [
    {
      title: "Partner takes full ownership of meal planning",
      description: "Including creating weekly menus, shopping lists, and grocery shopping",
      category: 'redistribute' as const,
      timeline: 'week' as const,
      owner: 'partner' as const
    },
    {
      title: "Create shared digital calendar system",
      description: "Set up Google Calendar or similar for appointments, deadlines, and household tasks",
      category: 'system' as const,
      timeline: 'immediate' as const,
      owner: 'both' as const
    },
    {
      title: "Weekly 15-minute mental load check-in",
      description: "Schedule regular conversations about what's working and what needs adjustment",
      category: 'conversation' as const,
      timeline: 'ongoing' as const,
      owner: 'both' as const
    },
    {
      title: "Trial period: Switch who handles morning routines",
      description: "Experiment with different arrangements for 2 weeks to find what works best",
      category: 'experiment' as const,
      timeline: 'month' as const,
      owner: 'both' as const
    }
  ];

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-accent" />
            Action Plan
            {totalCount > 0 && (
              <Badge variant="secondary">
                {completedCount}/{totalCount} completed
              </Badge>
            )}
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            variant={showAddForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-1" />
            {showAddForm ? 'Cancel' : 'Add Action'}
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isTogetherMode 
            ? "Create concrete next steps based on your discussion. These become your household mental load improvement plan."
            : "Plan specific actions to discuss with your partner. This gives structure to your mental load conversation."
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Action Form */}
        {showAddForm && (
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Action Title</label>
                <Input
                  value={newAction.title}
                  onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Partner takes ownership of dinner planning"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Details</label>
                <Textarea
                  value={newAction.description}
                  onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this involves and any specific expectations..."
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Who's responsible</label>
                  <Select
                    value={newAction.owner}
                    onValueChange={(value: 'me' | 'partner' | 'both') => 
                      setNewAction(prev => ({ ...prev, owner: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Me</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="both">Both/Together</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeline</label>
                  <Select
                    value={newAction.timeline}
                    onValueChange={(value: 'immediate' | 'week' | 'month' | 'ongoing') => 
                      setNewAction(prev => ({ ...prev, timeline: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">This Week</SelectItem>
                      <SelectItem value="week">Next 2 Weeks</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newAction.category}
                    onValueChange={(value: 'redistribute' | 'system' | 'conversation' | 'experiment') => 
                      setNewAction(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="redistribute">Redistribute</SelectItem>
                      <SelectItem value="system">Create System</SelectItem>
                      <SelectItem value="conversation">Communication</SelectItem>
                      <SelectItem value="experiment">Experiment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addAction} disabled={!newAction.title.trim()}>
                  Add Action
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Suggestions */}
        {actions.length === 0 && !showAddForm && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Action Suggestions</h3>
            <div className="grid gap-3">
              {actionSuggestions.map((suggestion, index) => (
                <Card key={index} className="border border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground mb-1">{suggestion.title}</div>
                        <div className="text-xs text-muted-foreground mb-2">{suggestion.description}</div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className={getCategoryInfo(suggestion.category).color}>
                            {getCategoryInfo(suggestion.category).icon} {getCategoryInfo(suggestion.category).label}
                          </Badge>
                          <Badge variant="outline" className={getTimelineInfo(suggestion.timeline).color}>
                            {getTimelineInfo(suggestion.timeline).icon} {getTimelineInfo(suggestion.timeline).label}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewAction(suggestion);
                          setShowAddForm(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Items List */}
        {actions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Your Action Items</h3>
            {actions.map((action) => (
              <Card key={action.id} className={`transition-all ${
                action.completed ? 'opacity-75 bg-muted/30' : 'hover:shadow-md'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComplete(action.id)}
                      className="p-1 mt-1"
                    >
                      <CheckCircle className={`h-4 w-4 ${
                        action.completed ? 'text-green-600' : 'text-muted-foreground'
                      }`} />
                    </Button>
                    
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        action.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {action.title}
                      </div>
                      {action.description && (
                        <div className="text-xs text-muted-foreground mt-1 mb-2">
                          {action.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className={getOwnerInfo(action.owner).color}>
                          <User className="h-3 w-3 mr-1" />
                          {getOwnerInfo(action.owner).label}
                        </Badge>
                        <Badge variant="outline" className={getTimelineInfo(action.timeline).color}>
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimelineInfo(action.timeline).label}
                        </Badge>
                        <Badge variant="outline" className={getCategoryInfo(action.category).color}>
                          {getCategoryInfo(action.category).icon} {getCategoryInfo(action.category).label}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAction(action.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {actions.length > 0 && completedCount === totalCount && (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-800">All actions completed! 🎉</div>
            <div className="text-xs text-muted-foreground">Consider scheduling a follow-up to assess how things are going.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};