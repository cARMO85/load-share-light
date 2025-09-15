import React, { useState, useEffect } from 'react';
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
  Lightbulb,
  Heart,
  Briefcase,
  Shield
} from 'lucide-react';

const Tutorial: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentStep } = useAssessment();
  const [currentSection, setCurrentSection] = useState(0);
  const [demoRatings, setDemoRatings] = useState({
    groceryBurden: 0,
    mealPlanBurden: 0
  });

  useEffect(() => {
    // Set current step when entering tutorial
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleNext = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setCurrentStep(2);
    navigate('/questionnaire');
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
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
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center space-y-4">
                <Brain className="h-10 w-10 text-primary mx-auto" />
                <h4 className="font-semibold text-foreground text-lg">Mental Load Intensity</h4>
                <p className="text-sm text-muted-foreground">How heavy does the work feel?</p>
                <div className="text-xs text-foreground bg-white/50 p-3 rounded border">
                  <strong>Example:</strong> Taking out trash (low burden: 2/5) vs Planning a family vacation (high burden: 5/5)
                </div>
                <p className="text-xs text-muted-foreground">Measures subjective stress and cognitive load on a 1-5 scale</p>
              </div>
            </Card>
            
            <Card className="p-6 border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
              <div className="text-center space-y-4">
                <BarChart3 className="h-10 w-10 text-secondary mx-auto" />
                <h4 className="font-semibold text-foreground text-lg">Mental Load Share</h4>
                <p className="text-sm text-muted-foreground">Who carries the invisible load?</p>
                <div className="text-xs text-foreground bg-white/50 p-3 rounded border">
                  <strong>Example:</strong> One partner does 75% of the mental work (remembering, planning, coordinating)
                </div>
                <p className="text-xs text-muted-foreground">Shows percentage of household mental work each person handles</p>
              </div>
            </Card>
            
            <Card className="p-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <div className="text-center space-y-4">
                <Eye className="h-10 w-10 text-accent mx-auto" />
                <h4 className="font-semibold text-foreground text-lg">Visible Work Share</h4>
                <p className="text-sm text-muted-foreground">Who does the actual tasks?</p>
                <div className="text-xs text-foreground bg-white/50 p-3 rounded border">
                  <strong>Example:</strong> Tasks split 50/50, but mental burden is 80/20
                </div>
                <p className="text-xs text-muted-foreground">Distribution of actual task completion and execution</p>
              </div>
            </Card>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <h4 className="font-semibold mb-4 text-center">Real Household Example</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-primary/5 p-4 rounded border border-primary/20">
                <h5 className="font-medium mb-2">The Visible Story</h5>
                <p className="text-sm text-muted-foreground">
                  "We split grocery shopping 50/50. I go on Tuesdays, my partner goes on Saturdays."
                </p>
              </div>
              <div className="bg-secondary/5 p-4 rounded border border-secondary/20">
                <h5 className="font-medium mb-2">The Mental Load Reality</h5>
                <p className="text-sm text-muted-foreground">
                  "But I'm the one who notices we're out of milk, checks what's in the fridge, plans meals for the week, makes the shopping list, and remembers we need party supplies for next weekend."
                </p>
              </div>
            </div>
            <div className="text-center mt-4 p-3 bg-accent/5 rounded border border-accent/20">
              <p className="text-sm text-foreground">
                <strong>Result:</strong> Visible Work = 50/50, Mental Load = 80/20
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Why Balancing Mental Load Matters",
      icon: <Heart className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <p className="text-lg text-muted-foreground">
              Research shows that addressing household imbalances isn't just about fairness — it has real effects on health, relationships, and work.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Here's what the science tells us:
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
              <div className="text-center space-y-4">
                <Shield className="h-10 w-10 text-red-600 mx-auto" />
                <h4 className="font-semibold text-foreground text-lg">Health Impact</h4>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <p>High and uneven mental load is linked to <strong>stress, burnout, and poorer wellbeing</strong>, especially for women who often carry the greater share of invisible household work.</p>
                  <p className="text-xs italic">Chronic stress from imbalance can spill over into sleep, mood, and physical health.</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-2 border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20">
              <div className="text-center space-y-4">
                <Heart className="h-10 w-10 text-pink-600 mx-auto" />
                <h4 className="font-semibold text-foreground text-lg">Relationships</h4>
                <div className="text-sm text-pink-700 dark:text-pink-300 space-y-2">
                  <p>When one partner feels overloaded, <strong>relationship quality suffers</strong>. Unequal household responsibility is tied to lower partner satisfaction and poorer communication.</p>
                  <p className="text-xs italic">Couples with fairer sharing report stronger satisfaction and resilience.</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <div className="text-center space-y-4">
                <Briefcase className="h-10 w-10 text-blue-600 mx-auto" />
                <h4 className="font-semibold text-foreground text-lg">Work & Economics</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p>After childbirth, <strong>women's lifetime earnings fall by 20–44%</strong> while men's remain stable. Unequal caregiving reduces workforce participation and widens the gender pay gap.</p>
                  <p className="text-xs italic">Balancing tasks more equitably can help both partners thrive at work and at home.</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                <h4 className="font-semibold text-lg">Key Takeaway</h4>
              </div>
              <p className="text-lg text-foreground font-medium">
                "Balancing visible and invisible household work isn't just about chores — it reduces stress, strengthens relationships, and supports both partners' careers and wellbeing."
              </p>
              <p className="text-sm text-muted-foreground">
                This assessment helps you see patterns that might be affecting your health, happiness, and success.
              </p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg">
            <h4 className="font-medium mb-3 text-center">Research Sources</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Cezar-Vaz et al. (2022) - Mental load and stress impacts</p>
              <p>• Ciciolla & Luthar (2019); Mary Omoboye et al. (2024) - Relationship satisfaction</p>
              <p>• Kleven et al. (2019); ILO (2024) - Economic impacts on women's careers</p>
            </div>
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
            Practice rating tasks just like you will in the real assessment:
          </p>
          
          <div className="space-y-4">
            <Card className="p-4 bg-muted/20">
              <div className="space-y-3">
                <h4 className="font-medium">Grocery Shopping</h4>
                <p className="text-sm text-muted-foreground">How burdensome is this task? (1-5 scale)</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <Button
                      key={value}
                      variant={demoRatings.groceryBurden === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDemoRatings(prev => ({ ...prev, groceryBurden: value }))}
                      className="w-12"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not burdensome</span>
                  <span>Very burdensome</span>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="bg-accent/5 p-5 rounded-lg border border-accent/20 space-y-4">
            <h4 className="font-medium text-center">What You'll Also See: The "Acknowledged" Slider</h4>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                For each task, you'll also use a slider to indicate: <strong>"How much does your partner acknowledge/appreciate the work that goes into this task?"</strong>
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Low Acknowledgment (0-30%)</p>
                  <p className="text-xs text-red-600 dark:text-red-400">"My partner doesn't realize how much mental effort this takes"</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">High Acknowledgment (70-100%)</p>
                  <p className="text-xs text-green-600 dark:text-green-400">"My partner sees and appreciates the invisible work I do"</p>
                </div>
              </div>
              <div className="bg-muted/30 p-3 rounded">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Why this matters:</strong> Tasks that feel burdensome AND unacknowledged create the highest stress and relationship tension
                </p>
              </div>
            </div>
          </div>
          
          {(demoRatings.groceryBurden > 0) && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="text-center space-y-2">
                <CheckCircle className="h-6 w-6 text-primary mx-auto" />
                <p className="text-sm text-foreground">
                  Perfect! You've experienced the rating system. The assessment will use burden ratings, acknowledgment levels, and task assignments to reveal your mental load patterns.
                </p>
              </div>
            </Card>
          )}
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
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="text-sm"
            >
              Skip Tutorial
            </Button>
          </div>
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