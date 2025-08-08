import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Brain, BarChart3, AlertCircle } from 'lucide-react';

const LearnMore: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Learn More — How This Assessment Works
          </h1>
          <p className="text-lg text-muted-foreground">
            Understanding the methodology behind our mental load assessment tool
          </p>
        </div>

        <div className="space-y-8">
          {/* What This Tool Measures */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                1. What This Tool Measures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This tool estimates how household responsibilities are divided between partners.
                It looks at two main types of work:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-primary">Visible Work</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The time spent physically doing tasks (e.g., cooking, cleaning, mowing the lawn).
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-secondary" />
                    <h4 className="font-semibold text-secondary">Invisible Work</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The mental, emotional, and organisational effort required to anticipate, plan, monitor, and make decisions about those tasks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Where Numbers Come From */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>2. Where the Numbers Come From</CardTitle>
              <CardDescription>
                Our approach is grounded in peer-reviewed research and reputable statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-sm">
                    <strong>Daminger (2019)</strong> — Four cognitive dimensions of household mental load: Anticipation, Identification, Decision-making, and Monitoring.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-sm">
                    <strong>Dean, Churchill, & Ruppanner (2022)</strong> — Emotional and invisible aspects of household work.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-sm">
                    <strong>Holten (2025)</strong> — Economic cost of unpaid care work.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-sm">
                    <strong>International Labour Organization (2024)</strong> — Global care work distribution statistics.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">For each task, we've assigned:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-primary/5">
                    <h5 className="font-medium text-primary mb-1">Baseline time per week</h5>
                    <p className="text-sm text-muted-foreground">
                      Taken from studies, national time-use surveys, and where necessary, averaged from multiple sources.
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-secondary/5">
                    <h5 className="font-medium text-secondary mb-1">Mental load weight</h5>
                    <p className="text-sm text-muted-foreground">
                      Based on how much anticipation, organisation, decision-making, and emotional labour the task typically requires (scaled from 1–5).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Calculate */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>3. How We Calculate Your Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border">
                  <h4 className="font-semibold mb-2">Step 1: You Tell Us</h4>
                  <p className="text-sm text-muted-foreground">
                    Who does each task ("Me", "Shared", or "Partner") and how much of it.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-r from-secondary/5 to-accent/5 border">
                  <h4 className="font-semibold mb-2">Step 2: We Multiply</h4>
                  <div className="space-y-2 text-sm">
                    <p><code className="bg-muted px-2 py-1 rounded">Time × Share %</code> → Visible workload</p>
                    <p><code className="bg-muted px-2 py-1 rounded">Time × Mental load weight × Share %</code> → Invisible workload</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 border">
                  <h4 className="font-semibold mb-2">Step 3: We Compare</h4>
                  <p className="text-sm text-muted-foreground">
                    If both partners complete the assessment, we compare perceptions side-by-side to highlight any gaps.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Your results are displayed in clear charts, so you can see:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Time and mental load share</li>
                  <li>Which categories (planning, monitoring, etc.) are most imbalanced</li>
                  <li>How each partner's perception differs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Why Edit Times */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>4. Why We Include the Ability to Edit Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">We know every household is different.</p>
              
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-sm">
                  <strong>For example:</strong> National averages might say lawn mowing takes 60 minutes/week — but your garden might take 15 minutes or 2 hours.
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                That's why you can edit the default time values to reflect your own experience.
              </p>
            </CardContent>
          </Card>

          {/* What Tool Can Do */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>5. What This Tool Can (and Can't) Do</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-success mb-3">✅ It can:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Help you see both the physical and invisible sides of household work</li>
                  <li>• Reveal differences in how you and your partner see the division of labour</li>
                  <li>• Start conversations about fairness and balance</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-destructive mb-3">❌ It can't:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Prove exactly how much time or effort you personally spend — it's still an estimate based on averages and your inputs</li>
                  <li>• Replace honest, ongoing discussion between partners</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                📌 Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This tool is for personal insight and discussion purposes only. It is not a clinical or legal assessment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button onClick={() => navigate('/setup')} size="lg" className="px-8">
            Start Your Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;