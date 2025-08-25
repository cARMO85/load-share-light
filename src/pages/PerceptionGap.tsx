import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { PerceptionGapResponse } from '@/types/assessment';
import { Brain, Heart, Users, Eye } from 'lucide-react';
import { InfoButton } from '@/components/InfoButton';

const PerceptionGap: React.FC = () => {
  const navigate = useNavigate();
  const { state, setPerceptionGapResponses, setPartnerPerceptionGapResponses, setCurrentStep, setCurrentResponder } = useAssessment();
  
  const [responses, setResponses] = useState<PerceptionGapResponse>({
    workPercentageSelf: 50,
    workPercentagePartner: 50,
    mentalLoadPercentageSelf: 50,
    emotionalSupportPercentageSelf: 50
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
      setPartnerPerceptionGapResponses(responses);
      setCurrentStep(4);
      navigate('/emotional-impact');
    } else if (isTogetherMode) {
      setPerceptionGapResponses(responses);
      setCurrentResponder('partner');
      // Reset responses for partner
      setResponses({
        workPercentageSelf: 50,
        workPercentagePartner: 50,
        mentalLoadPercentageSelf: 50,
        emotionalSupportPercentageSelf: 50
      });
    } else {
      setPerceptionGapResponses(responses);
      setCurrentStep(4);
      navigate('/emotional-impact');
    }
  };

  const handleSkip = () => {
    setCurrentStep(5);
    navigate('/results');
  };

  const updateResponse = (field: keyof PerceptionGapResponse, value: number) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const getResponderTheme = () => {
    if (isPartnerTurn) {
      return {
        gradient: "from-secondary to-secondary/80",
        icon: Users,
        title: "Partner's Perspective",
        subtitle: "How does your partner see the household work distribution?"
      };
    }
    return {
      gradient: "from-primary to-primary/80",
      icon: Eye,
      title: "Your Perspective",
      subtitle: "Share your view on how household work is distributed"
    };
  };

  const theme = getResponderTheme();
  const ThemeIcon = theme.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={3} totalSteps={6} steps={steps} />
        
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
            <CardTitle className="text-2xl text-foreground">Perception Questions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Rate each area on a scale from 0-100%
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Total Household Work */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Total Household Work</Label>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    What percentage of total household work do you think you do?
                  </Label>
                  <div className="px-4">
                    <Slider
                      value={[responses.workPercentageSelf]}
                      onValueChange={(value) => updateResponse('workPercentageSelf', value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span className="font-medium text-primary">{responses.workPercentageSelf}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    What percentage of total household work do you think your partner does?
                  </Label>
                  <div className="px-4">
                    <Slider
                      value={[responses.workPercentagePartner]}
                      onValueChange={(value) => updateResponse('workPercentagePartner', value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span className="font-medium text-secondary">{responses.workPercentagePartner}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mental Load */}
            <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold text-primary">Mental Planning & Organization</Label>
                <InfoButton 
                  variant="tooltip" 
                  tooltipContent="Mental load includes invisible work like remembering what needs to be done, planning ahead, making decisions, and coordinating family schedules. Research shows this cognitive burden is often unequally distributed."
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  How much of the mental planning and organization do you think you do?
                </Label>
                <div className="px-4">
                  <Slider
                    value={[responses.mentalLoadPercentageSelf]}
                    onValueChange={(value) => updateResponse('mentalLoadPercentageSelf', value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span className="font-medium text-primary">{responses.mentalLoadPercentageSelf}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emotional Support */}
            <div className="space-y-4 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-5 w-5 text-secondary" />
                <Label className="text-base font-semibold text-secondary">Emotional Support Work</Label>
                <InfoButton 
                  variant="tooltip" 
                  tooltipContent="Emotional support work includes comforting family members, managing relationships, remembering important events, and maintaining family harmony. This invisible labor is often undervalued."
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  How much of the emotional support work do you think you do?
                </Label>
                <div className="px-4">
                  <Slider
                    value={[responses.emotionalSupportPercentageSelf]}
                    onValueChange={(value) => updateResponse('emotionalSupportPercentageSelf', value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span className="font-medium text-secondary">{responses.emotionalSupportPercentageSelf}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <Button 
                onClick={handleNext} 
                variant="hero" 
                size="lg" 
                className="w-full"
              >
                {isPartnerTurn 
                  ? "Continue to Emotional Impact" 
                  : isTogetherMode 
                    ? "Partner's Turn" 
                    : "Continue to Emotional Impact"
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

export default PerceptionGap;