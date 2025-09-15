import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Brain, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/setup');
  };

  const handleLearnMore = () => {
    navigate('/learn-more');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight animate-fade-in">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Mental Load
                </span>
                <br />
                <span className="text-foreground">Assessment</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in">
                Discover how household work is really shared in your relationship
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Button 
                onClick={handleGetStarted} 
                variant="hero" 
                size="lg" 
                className="px-10 py-6 text-xl hover-scale"
              >
                Start Assessment <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              
              <Button 
                onClick={() => navigate('/tutorial')} 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg"
              >
                Take Tutorial
              </Button>
              
              <Button 
                onClick={handleLearnMore} 
                variant="ghost" 
                size="lg" 
                className="px-6 py-6 text-base"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-primary/5 hover-scale">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Understand Mental Load
              </h3>
              <p className="text-muted-foreground">
                Reveal the invisible work behind household tasks
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-secondary/5 hover-scale">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Partner Comparison
              </h3>
              <p className="text-muted-foreground">
                See how each partner experiences the same tasks
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-card to-accent/5 hover-scale">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Clear Insights
              </h3>
              <p className="text-muted-foreground">
                Get actionable data about your household balance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Ready to discover your mental load patterns?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take 10-15 minutes to complete the assessment and gain insights that could transform how you share household work.
            </p>
            <Button 
              onClick={handleGetStarted} 
              variant="hero" 
              size="lg" 
              className="px-12 py-6 text-xl hover-scale"
            >
              Start Your Assessment <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
