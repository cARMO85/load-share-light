import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { EmotionalImpactResponse } from '@/types/assessment';
import { Zap, Scale, Smile, MessageCircle, Users, Heart } from 'lucide-react';

const EmotionalImpact: React.FC = () => {
  const navigate = useNavigate();
  const { state, setEmotionalImpactResponses, setPartnerEmotionalImpactResponses, setCurrentStep, setCurrentResponder } = useAssessment();
  
  const [responses, setResponses] = useState<EmotionalImpactResponse>({
    stressLevel: 3,
    fairnessLevel: 3,
    satisfactionLevel: 3,
    conversationFrequency: 3
  });

  const isPartnerTurn = state.currentResponder === 'partner';
  const isTogetherMode = state.householdSetup.assessmentMode === 'together';

  // Scroll to top when partner's turn begins
  useEffect(() => {
    if (isPartnerTurn) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isPartnerTurn]);

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Perspectives", description: "Share your views" },
    { title: "Impact", description: "Emotional insights" },
    { title: "Results", description: "View calculations" },
    { title: "Visualize", description: "Charts & insights" }
  ];

  const handleNext = () => {
    if (isPartnerTurn) {
      setPartnerEmotionalImpactResponses(responses);
      setCurrentStep(5);
      navigate('/results');
    } else if (isTogetherMode) {
      setEmotionalImpactResponses(responses);
      setCurrentResponder('partner');
      // Reset responses for partner
      setResponses({
        stressLevel: 3,
        fairnessLevel: 3,
        satisfactionLevel: 3,
        conversationFrequency: 3
      });
    } else {
      setEmotionalImpactResponses(responses);
      setCurrentStep(5);
      navigate('/results');
    }
  };

  const handleSkip = () => {
    setCurrentStep(5);
    navigate('/results');
  };

  const updateResponse = (field: keyof EmotionalImpactResponse, value: string) => {
    setResponses(prev => ({ ...prev, [field]: parseInt(value) }));
  };

  const getResponderTheme = () => {
    if (isPartnerTurn) {
      return {
        gradient: "from-secondary to-secondary/80",
        icon: Users,
        title: "Partner's Experience",
        subtitle: "How does your partner feel about the current household work distribution?"
      };
    }
    return {
      gradient: "from-primary to-primary/80",
      icon: Heart,
      title: "Your Experience",
      subtitle: "Share how you feel about the current household work distribution"
    };
  };

  const theme = getResponderTheme();
  const ThemeIcon = theme.icon;

  const likertLabels = [
    "Never/Very Low",
    "Rarely/Low", 
    "Sometimes/Moderate",
    "Often/High",
    "Always/Very High"
  ];

  const questions = [
    {
      id: 'stressLevel',
      icon: Zap,
      title: "Stress Level",
      question: "How often do you feel stressed about household responsibilities?",
      color: "text-orange-500"
    },
    {
      id: 'fairnessLevel',
      icon: Scale,
      title: "Fairness Perception",
      question: "How often do you feel there is an unfair division of work?",
      color: "text-blue-500"
    },
    {
      id: 'satisfactionLevel',
      icon: Smile,
      title: "Satisfaction Level",
      question: "How satisfied are you with the way household work is shared?",
      color: "text-green-500"
    },
    {
      id: 'conversationFrequency',
      icon: MessageCircle,
      title: "Communication",
      question: "How often do you have conversations with your partner about redistributing tasks?",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={4} totalSteps={6} steps={steps} />
        
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r ${theme.gradient} text-white`}>
            <ThemeIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{theme.title}</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {theme.subtitle}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Emotional & Cognitive Impact</CardTitle>
            <CardDescription className="text-muted-foreground">
              Rate each statement on a scale from 1-5
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {questions.map((q, index) => {
              const QuestionIcon = q.icon;
              return (
                <div key={q.id} className="space-y-4 p-4 rounded-lg bg-muted/30 border border-muted">
                  <div className="flex items-center gap-3 mb-4">
                    <QuestionIcon className={`h-5 w-5 ${q.color}`} />
                    <div>
                      <Label className="text-base font-semibold">{q.title}</Label>
                      <p className="text-sm text-muted-foreground mt-1">{q.question}</p>
                    </div>
                  </div>
                  
                  <RadioGroup
                    value={responses[q.id as keyof EmotionalImpactResponse].toString()}
                    onValueChange={(value) => updateResponse(q.id as keyof EmotionalImpactResponse, value)}
                    className="space-y-3"
                  >
                    {likertLabels.map((label, idx) => (
                      <div key={idx + 1} className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={(idx + 1).toString()} id={`${q.id}-${idx + 1}`} />
                        <Label 
                          htmlFor={`${q.id}-${idx + 1}`} 
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <span className="font-medium text-primary">{idx + 1}</span> - {label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              );
            })}

            <div className="pt-6 space-y-3">
              <Button 
                onClick={handleNext} 
                variant="hero" 
                size="lg" 
                className="w-full"
              >
                {isPartnerTurn 
                  ? "View Results" 
                  : isTogetherMode 
                    ? "Partner's Turn" 
                    : "View Results"
                }
              </Button>
              
              <Button 
                onClick={handleSkip}
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                Skip to Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmotionalImpact;