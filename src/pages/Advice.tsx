import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lightbulb, Brain, Scale, Users, Heart, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react';

const Advice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Understanding Mental Load</h1>
            <p className="text-muted-foreground">Detailed explanations, research insights, and actionable advice</p>
          </div>
        </div>

        {/* Mental Load Categories Explanation */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                The 5 Types of Mental Load
              </CardTitle>
              <CardDescription>
                Understanding the cognitive work behind household management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h5 className="font-medium text-primary mb-2">Anticipation</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Planning ahead and thinking about future needs - meal planning, scheduling appointments, 
                    anticipating seasonal requirements, and preparing for upcoming events.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> Planning weekly meals, coordinating family schedules, thinking ahead about school supplies
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <h5 className="font-medium text-secondary mb-2">Identification</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Noticing what needs to be done - seeing when something is dirty, broken, or running low, 
                    and recognizing when household standards aren't being met.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> Noticing when supplies are low, seeing mess that needs cleaning, spotting repairs needed
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <h5 className="font-medium text-accent mb-2">Decision-making</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choosing how, when, and what to do - making decisions about priorities, methods, 
                    standards, and resource allocation for household tasks.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> Choosing service providers, deciding budget priorities, selecting gifts
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <h5 className="font-medium text-success mb-2">Monitoring</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Keeping track of progress and quality - ensuring tasks are completed properly, 
                    following up on delegated work, and maintaining household standards.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> Tracking appointments, following up on tasks, monitoring children's progress
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <h5 className="font-medium text-warning mb-2">Emotional Labour</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Managing feelings and relationships - providing emotional support, managing family conflicts, 
                    maintaining relationships with extended family, and ensuring everyone's emotional well-being.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> Mediating conflicts, providing emotional support, maintaining social relationships
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mental Load Points Explanation */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-info" />
                Understanding Mental Load Points
              </CardTitle>
              <CardDescription>
                How we calculate the cognitive burden of household tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Mental load points are calculated by multiplying the time spent on each task by its "cognitive weight" - 
                  how much mental energy that task requires beyond just the visible time.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded bg-success/10">
                      <span>Light mental load:</span>
                      <span className="text-success font-medium">&lt; 300 points</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-warning/10">
                      <span>Moderate mental load:</span>
                      <span className="text-warning font-medium">300-600 points</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded bg-destructive/10">
                      <span>High mental load:</span>
                      <span className="text-destructive font-medium">600-1000 points</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-destructive/20">
                      <span>Very high mental load:</span>
                      <span className="text-destructive font-medium">&gt; 1000 points</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-blue/5 border border-blue/20">
                  <p className="text-xs text-muted-foreground italic">
                    <strong>Example:</strong> Grocery shopping might take 1 hour of visible time, but planning meals, checking inventory, 
                    and making the list could add 2-3x more cognitive effort.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research-Based Insights */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-purple" />
                Why Balance Matters: Research Insights
              </CardTitle>
              <CardDescription>
                Scientific evidence on the impact of mental load imbalance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <h5 className="font-medium text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Health Impact
                </h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Research shows that excessive mental load can lead to chronic stress, anxiety, and burnout. 
                  <span className="font-medium"> Daminger (2019)</span> found that the cognitive demands of household management 
                  create a "second shift" of invisible work that can be mentally exhausting.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  "The mental work of running a household... requires sustained attention and creates cognitive fatigue" - Daminger, 2019
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <h5 className="font-medium text-warning mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Relationship Impact
                </h5>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Dean, Churchill, & Ruppanner (2022)</span> found that unequal distribution 
                  of mental load can create relationship tension and feelings of resentment. When one partner carries 
                  the majority of cognitive burden, it can affect relationship satisfaction and intimacy.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  "Invisible work imbalances contribute to relationship strain and reduced partnership satisfaction"
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                <h5 className="font-medium text-info mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Economic Impact
                </h5>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Holten (2025)</span> calculated that unpaid care work represents a significant 
                  economic burden, with the mental load component often undervalued but crucial for household functioning. 
                  The <span className="font-medium">International Labour Organization (2024)</span> estimates care work at 24% of global GDP.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* General Advice Section */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-accent" />
                Strategies for Better Balance
              </CardTitle>
              <CardDescription>
                Practical approaches to redistribute mental load
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h5 className="font-medium text-primary mb-2">Start with Awareness</h5>
                  <p className="text-sm text-muted-foreground">
                    Share your assessment results with your partner. Many people don't realize how much cognitive work 
                    goes into household management. Use this as a starting point for discussion, not blame.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <h5 className="font-medium text-secondary mb-2">Transfer Ownership, Not Just Tasks</h5>
                  <p className="text-sm text-muted-foreground">
                    Instead of asking your partner to "help" with your tasks, transfer complete ownership of specific areas. 
                    For example, one person owns all pet care (feeding, vet appointments, supplies) from start to finish.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <h5 className="font-medium text-accent mb-2">Create Systems and Routines</h5>
                  <p className="text-sm text-muted-foreground">
                    Reduce mental load through automation and systems. Use shared calendars, meal planning apps, 
                    automatic bill payments, and regular household schedules to minimize decision fatigue.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <h5 className="font-medium text-success mb-2">Practice Parallel Processing</h5>
                  <p className="text-sm text-muted-foreground">
                    Work on different household areas simultaneously rather than one person managing everything. 
                    This prevents bottlenecks and reduces the feeling that one person is "in charge" of the household.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Button onClick={() => navigate('/dashboard')} size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Your Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Advice;