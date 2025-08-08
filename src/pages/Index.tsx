import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, BarChart3, Heart } from 'lucide-react';

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
                Understand and visualize the invisible work that keeps your household running. 
                Measure the mental load distribution and spark meaningful conversations about balance.
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
