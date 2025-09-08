import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MessageSquare, PenTool, BarChart3, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Mental Load
              </span>
              <br />
              <span className="text-foreground">Assessment Tool</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Understand household mental load through guided questions. Use alone or with your partner.
            </p>
            
            <Button 
              onClick={handleGetStarted} 
              variant="hero" 
              size="lg" 
              className="px-8 py-4 text-lg"
            >
              Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How to Use This Tool
          </h2>
          <p className="text-lg text-muted-foreground">
            Follow these simple steps to get the most out of your assessment
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center shadow-md border-0 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <CardTitle className="text-lg">Answer Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Rate each task on two scales: how much mental burden it creates (1-5) and how fairly it's shared (1-5)
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-md border-0 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-lg">Talk & Discuss</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Use with your partner to compare perspectives and have meaningful conversations about each task
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-md border-0 bg-gradient-to-br from-card to-accent/5">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <PenTool className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Add Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Capture insights, agreements, or action items in the notes section for each task category
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-md border-0 bg-gradient-to-br from-card to-success/5">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-lg">View Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                See visual charts of your mental load distribution and identified areas for improvement
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Understanding the Scales */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-muted/20 to-background">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Understanding the Rating Scales
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">Mental Burden Scale (1-5)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">1 - Very Low:</span>
                    <span className="text-muted-foreground">Requires minimal thinking</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">3 - Moderate:</span>
                    <span className="text-muted-foreground">Some planning needed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">5 - Very High:</span>
                    <span className="text-muted-foreground">Constant mental effort</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-secondary">Fairness Scale (1-5)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">1 - Very Unfair:</span>
                    <span className="text-muted-foreground">One person does it all</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">3 - Somewhat Fair:</span>
                    <span className="text-muted-foreground">Mostly shared</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">5 - Very Fair:</span>
                    <span className="text-muted-foreground">Equally distributed</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Tips for Best Results
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Take your time</p>
                    <p className="text-sm text-muted-foreground">Think about each task carefully before rating</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Be honest</p>
                    <p className="text-sm text-muted-foreground">Rate based on your actual experience, not ideals</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Use notes liberally</p>
                    <p className="text-sm text-muted-foreground">Capture specific examples and insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Compare with partner</p>
                    <p className="text-sm text-muted-foreground">Different perspectives reveal blind spots</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button 
                onClick={handleGetStarted} 
                variant="hero" 
                size="lg" 
                className="px-8 py-3"
              >
                Start Your Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
