import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Clock, Brain, BarChart3, AlertCircle, Shield } from 'lucide-react';

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
                      weighted by cognitive/emotional complexity using a multiplier centred on 1.0 (routine execution ≈ 0.8–1.0; planning/monitoring ≈ 1.1–1.3; high emotional/co‑ordination ≈ 1.4–1.6).
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
                    If both partners complete the assessment, we compare perceptions side-by-side to highlight any gaps. When both partners answer, we show two views: your perception and a normalised model that blends both answers with literature baselines to reduce guesswork.
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
                  <strong>For example:</strong> National averages might say lawn mowing takes 60 minutes per week — but your garden might take 15 minutes or 2 hours.
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                That is why you can edit the default time values to reflect your own experience.
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

          {/* Couple Mode Normalisation */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>6. Couple Mode — How We Reconcile Two Answers</CardTitle>
              <CardDescription>We separate perception from a normalised estimate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>We display two parallel views:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Perception view</strong> — what each person believes they contribute.</li>
                <li><strong>Normalised model</strong> — a blended estimate using literature baselines and both partners' shares.</li>
              </ul>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="mb-2"><strong>In plain English:</strong> we average your shares for each task and anchor the time to national/literature averages (unless you edited them). This reduces random over/under‑estimation.</p>
                <p className="font-mono text-xs">
                  normalised_share = average( your_share , 1 − partner_share ) <br/>
                  normalised_minutes = median( baseline , your_time/your_share? , partner_time/(1−partner_share)? )
                </p>
              </div>
              <p>We also flag tasks with a big disagreement badge (e.g., "You: 80% • Partner: 40%") to help you talk about those first.</p>
            </CardContent>
          </Card>

          {/* Weighting Explanation */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>7. How Mental Load Weights Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Each task has a <strong>weight multiplier</strong> that reflects invisible effort. It is centred on <strong>1.0</strong>:
              </p>
              <ul className="list-disc list-inside">
                <li><strong>0.8–1.0</strong>: mainly physical execution (e.g., routine tidying)</li>
                <li><strong>1.1–1.3</strong>: planning/monitoring/administration (e.g., bills, calendars)</li>
                <li><strong>1.4–1.6</strong>: high emotional/coordination complexity (e.g., child emotional support)</li>
              </ul>
              <p>
                Categories are grounded in Daminger's cognitive dimensions (anticipation, identification, decision‑making, monitoring) and emotional labour literature. You can see the default weight for each task in the questionnaire.
              </p>
            </CardContent>
          </Card>

          {/* Sources & Transparency */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>8. Sources & Transparency</CardTitle>
              <CardDescription>Exactly where our defaults come from</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <Accordion type="single" collapsible>
                <AccordionItem value="frameworks">
                  <AccordionTrigger>Frameworks</AccordionTrigger>
                  <AccordionContent>
                    Daminger (2019) — cognitive dimensions; Dean, Churchill &amp; Ruppanner (2022) — emotional/invisible labour; Hjálmsdóttir &amp; Bjarnadóttir (2021).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="baselines">
                  <AccordionTrigger>Baseline times</AccordionTrigger>
                  <AccordionContent>
                    National time‑use studies and peer‑reviewed sources (see Appendix Table in the report). Defaults are editable to reflect your context.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="weights">
                  <AccordionTrigger>Weighting policy</AccordionTrigger>
                  <AccordionContent>
                    Weight multipliers (0.8–1.6) are assigned by category complexity; they can be tuned for research sensitivity analysis.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                9. Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                We store your answers locally for this session unless you choose to save/export them. No personal identifiers are required. See the in‑app Privacy notice for details.
              </p>
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