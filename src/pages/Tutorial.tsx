import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { 
  Brain, 
  BarChart3, 
  Eye, 
  ArrowRight, 
  Play, 
  CheckCircle,
  Users,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';

const Tutorial: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentStep } = useAssessment();
  const [currentSection, setCurrentSection] = useState(0);
  const [demoRatings, setDemoRatings] = useState({
    groceryBurden: 0,
    mealPlanBurden: 0
  });

  const handleNext = () => {
    setCurrentStep(2);
    navigate('/questionnaire');
  };

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tutorial", description: "Learn how it works" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Results", description: "View calculations" }
  ];

  const sections = [
    {
      title: "Welcome to Your Mental Load Discovery",
      icon: <Brain className="h-12 w-12 text-primary" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            You're about to discover hidden patterns in how household work is distributed and experienced.
          </p>
          <p className="text-muted-foreground">
            Most couples are surprised by what they learn about their invisible labor patterns.
          </p>
        </div>
      )
    },
    {
      title: "The 3 Key Insights You'll Discover",
      icon: <Target className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center space-y-3">
                <Brain className="h-8 w-8 text-primary mx-auto" />
                <h4 className="font-semibold text-foreground">Mental Load Intensity</h4>
                <p className="text-sm text-muted-foreground">How heavy does the work feel?</p>
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  0-100 scale measuring subjective burden and stress
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
              <div className="text-center space-y-3">
                <BarChart3 className="h-8 w-8 text-secondary mx-auto" />
                <h4 className="font-semibold text-foreground">Mental Load Share</h4>
                <p className="text-sm text-muted-foreground">Who's carrying the invisible load?</p>
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Percentage of household mental work each person handles
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <div className="text-center space-y-3">
                <Eye className="h-8 w-8 text-accent mx-auto" />
                <h4 className="font-semibold text-foreground">Visible Work Share</h4>
                <p className="text-sm text-muted-foreground">Who's doing the actual tasks?</p>
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Distribution of visible task completion
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Try It Out - Mini Demo",
      icon: <Play className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Practice rating tasks to see how your input creates insights:
          </p>
          
          <div className="space-y-4">
            <Card className="p-4 bg-muted/20">
              <div className="space-y-3">
                <h4 className="font-medium">Grocery Shopping</h4>
                <p className="text-sm text-muted-foreground">Rate how burdensome this feels (0-100):</p>
                <div className="flex gap-2">
                  {[20, 40, 60, 80].map(value => (
                    <Button
                      key={value}
                      variant={demoRatings.groceryBurden === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDemoRatings(prev => ({ ...prev, groceryBurden: value }))}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-muted/20">
              <div className="space-y-3">
                <h4 className="font-medium">Planning Weekly Meals</h4>
                <p className="text-sm text-muted-foreground">Rate how burdensome this feels (0-100):</p>
                <div className="flex gap-2">
                  {[30, 50, 70, 90].map(value => (
                    <Button
                      key={value}
                      variant={demoRatings.mealPlanBurden === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDemoRatings(prev => ({ ...prev, mealPlanBurden: value }))}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          {(demoRatings.groceryBurden > 0 && demoRatings.mealPlanBurden > 0) && (
            <Card className="p-4 bg-success/10 border-success/30">
              <div className="text-center space-y-2">
                <CheckCircle className="h-6 w-6 text-success mx-auto" />
                <p className="text-sm text-success-foreground">
                  Great! Your ratings show meal planning feels more burdensome than grocery shopping.
                  This is exactly how the assessment captures your mental load patterns.
                </p>
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      title: "What Makes This Different",
      icon: <Lightbulb className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 bg-muted/20">
              <h4 className="font-medium mb-2 text-center">Traditional View</h4>
              <p className="text-sm text-muted-foreground text-center">
                "Who does the dishes?"
              </p>
            </Card>
            <Card className="p-4 bg-primary/10 border-primary/30">
              <h4 className="font-medium mb-2 text-center">Mental Load View</h4>
              <p className="text-sm text-muted-foreground text-center">
                "Who notices when dishes need doing, remembers the dish soap is running low, and feels responsible for kitchen cleanliness?"
              </p>
            </Card>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              <strong>Most couples are surprised by what they discover</strong> about their invisible labor patterns.
            </p>
            <p className="text-sm text-muted-foreground">
              This assessment creates better conversations and understanding, not blame.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start Your Assessment?",
      icon: <Users className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Time Estimate</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                10-15 minutes for thoughtful completion
              </p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Best Results</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Be honest about how tasks actually feel, not how you think they should feel
              </p>
            </Card>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2 text-center">💡 Pro Tip</h4>
            <p className="text-sm text-muted-foreground text-center">
              You'll rate tasks across different categories like childcare, household management, social coordination, and more.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={2} totalSteps={4} steps={steps} />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Understanding Your Mental Load
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's walk through what you'll discover and how the assessment works
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {sections[currentSection].icon}
            </div>
            <CardTitle className="text-2xl text-foreground">
              {sections[currentSection].title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {sections[currentSection].content}
            
            <div className="flex justify-between items-center pt-6">
              <div className="flex gap-2">
                {sections.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-all ${
                      index === currentSection 
                        ? 'bg-primary' 
                        : index < currentSection 
                        ? 'bg-primary/40' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-3">
                {currentSection > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(currentSection - 1)}
                  >
                    Back
                  </Button>
                )}
                
                {currentSection < sections.length - 1 ? (
                  <Button
                    onClick={() => setCurrentSection(currentSection + 1)}
                    className="gap-2"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext} 
                    variant="hero" 
                    size="lg" 
                    className="gap-2"
                  >
                    Start Assessment <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tutorial;