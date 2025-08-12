import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { EmotionalImpactResponse } from '@/types/assessment';
import { Zap, Scale, Smile, MessageCircle, Users, Heart, Lightbulb, AlertTriangle } from 'lucide-react';

const EmotionalImpact: React.FC = () => {
  const navigate = useNavigate();
  const { state, setEmotionalImpactResponses, setPartnerEmotionalImpactResponses, setCurrentStep, setCurrentResponder, addInsight } = useAssessment();
  
  const [responses, setResponses] = useState<EmotionalImpactResponse>({
    stressLevel: 3,
    fairnessLevel: 3,
    satisfactionLevel: 3,
    conversationFrequency: 3
  });

  const [insights, setInsights] = useState<string>('');
  const [showPerceptionGaps, setShowPerceptionGaps] = useState(false);

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

  // Check for perception gaps when both responses are available
  useEffect(() => {
    if (isTogetherMode && state.emotionalImpactResponses && isPartnerTurn) {
      setShowPerceptionGaps(true);
    }
  }, [isTogetherMode, state.emotionalImpactResponses, isPartnerTurn]);

  const getPerceptionGaps = () => {
    if (!state.emotionalImpactResponses || !isPartnerTurn) return [];
    
    const gaps = [];
    const myResponses = state.emotionalImpactResponses;
    const partnerResponses = responses;

    questions.forEach(q => {
      const myScore = myResponses[q.id as keyof EmotionalImpactResponse];
      const partnerScore = partnerResponses[q.id as keyof EmotionalImpactResponse];
      const difference = Math.abs(myScore - partnerScore);
      
      if (difference >= 2) {
        gaps.push({
          question: q.title,
          myScore,
          partnerScore,
          difference,
          icon: q.icon,
          color: q.color
        });
      }
    });
    
    return gaps;
  };

  const saveInsight = () => {
    if (insights.trim()) {
      addInsight({
        id: `emotional-${Date.now()}`,
        type: 'breakthrough',
        description: insights.trim(),
        timestamp: new Date()
      });
      setInsights('');
    }
  };

  const handleNext = () => {
    // Save any pending insights
    if (insights.trim()) {
      saveInsight();
    }

    if (isPartnerTurn) {
      setPartnerEmotionalImpactResponses(responses);
      
      // In together mode, check for perception gaps and generate insights
      if (isTogetherMode && state.emotionalImpactResponses) {
        const gaps = getPerceptionGaps();
        gaps.forEach(gap => {
          const gapType = gap.myScore > gap.partnerScore ? 'more stressed' : 'less stressed';
          addInsight({
            id: `gap-${gap.question.toLowerCase()}-${Date.now()}`,
            type: 'disagreement',
            description: `Perception gap in ${gap.question}: You rated ${gap.myScore}/5, partner rated ${gap.partnerScore}/5. You feel ${gapType} about this area.`,
            timestamp: new Date()
          });
        });
      }
      
      setCurrentStep(5);
      navigate('/results');
    } else if (isTogetherMode) {
      setEmotionalImpactResponses(responses);
      setCurrentResponder('partner');
      setShowPerceptionGaps(false);
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

            {/* Perception Gaps Display */}
            {showPerceptionGaps && getPerceptionGaps().length > 0 && (
              <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Perception Gaps Detected</h3>
                </div>
                <p className="text-sm text-amber-700 mb-4">
                  You and your partner have different stress levels about these areas - perfect conversation starters!
                </p>
                
                {getPerceptionGaps().map((gap, idx) => {
                  const GapIcon = gap.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <GapIcon className={`h-4 w-4 ${gap.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{gap.question}</p>
                        <p className="text-xs text-gray-600">
                          You: {gap.myScore}/5 • Partner: {gap.partnerScore}/5 • Difference: {gap.difference}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Insights & Comments Section */}
            {isTogetherMode && (
              <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Discussion Insights</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  As you discuss these questions together, capture any insights, agreements, or important realizations:
                </p>
                
                <Textarea
                  value={insights}
                  onChange={(e) => setInsights(e.target.value)}
                  placeholder="What did you discover in your discussion? Any surprises or important agreements?"
                  className="min-h-20 bg-white/70 border-blue-200 focus:border-blue-400"
                />
                
                {insights.trim() && (
                  <Button 
                    onClick={saveInsight}
                    variant="outline" 
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Save Insight
                  </Button>
                )}
              </div>
            )}

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