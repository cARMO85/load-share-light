import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, BarChart3, Heart, MessageCircle, CheckCircle, Target } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Mental Load
                </span>
                <br />
                <span className="text-foreground">Assessment Tool</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A thoughtful assessment tool designed to spark meaningful conversations about household mental load. 
                Use it solo for self-reflection or with your partner to build understanding and create positive change together.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted} 
                variant="hero" 
                size="lg" 
                className="px-8 py-4 text-lg"
              >
                Start Assessment
              </Button>
              <Button 
                variant="soft" 
                size="lg" 
                className="px-8 py-4 text-lg"
                onClick={() => navigate('/learn-more')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Mental Load Matters
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The invisible cognitive burden of managing a household often goes unnoticed. 
            Our tool helps make it visible and measurable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-primary/5 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">Cognitive Load</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Measure the mental effort behind household tasks, not just the time spent doing them.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-secondary/5 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
              <CardTitle className="text-xl">Fair Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Understand how responsibilities are shared and identify opportunities for better balance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-accent/5 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-xl">Data Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize your household workload through interactive charts and meaningful metrics.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-success/5 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <Heart className="h-12 w-12 text-success mx-auto mb-4" />
              <CardTitle className="text-xl">Better Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Foster understanding and communication about invisible work in your partnership.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A guided process to help you reflect on, discuss, and improve how mental load is shared in your household.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-primary/5 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">Reflect & Discuss</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Answer thoughtful questions about household tasks and responsibilities. Use it for personal insight or as conversation starters with your partner.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-secondary/5 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-secondary mx-auto mb-4" />
              <CardTitle className="text-xl">Capture Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Record your thoughts, observations, and discussion notes throughout the assessment to build understanding together.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-accent/5 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <Target className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-xl">Create Change</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Use your insights and visualizations to identify specific areas for improvement and create actionable plans together.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-8 border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Perfect for Solo Reflection or Partner Conversations
            </h3>
            <p className="text-muted-foreground">
              Whether you're looking to understand your own mental load patterns or create a safe space for discussing household responsibilities with your partner, this tool adapts to your needs. Take it individually first, then use your results as a starting point for meaningful conversations about creating better balance together.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Ready to Understand Your Mental Load?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take the assessment and discover insights about how mental labor is distributed 
              in your household. The assessment takes about 10-15 minutes to complete.
            </p>
            <Button 
              onClick={handleGetStarted} 
              variant="hero" 
              size="lg" 
              className="px-12 py-4 text-lg"
            >
              Begin Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
