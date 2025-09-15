import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { HouseholdSetup as HouseholdSetupType } from '@/types/assessment';
import { Users, Baby, Briefcase, Home, Heart, UserCheck } from 'lucide-react';

const HouseholdSetup: React.FC = () => {
  const navigate = useNavigate();
  const { state, setHouseholdSetup, setCurrentStep } = useAssessment();
  
  const [setup, setSetup] = useState<HouseholdSetupType>({
    ...state.householdSetup,
    householdType: 'couple' as const, // Default to couple
    adults: 2 // Always 2 for couples
  });

  const handleNext = () => {
    setHouseholdSetup(setup);
    setCurrentStep(2);
    navigate('/tutorial');
  };

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tutorial", description: "Learn how it works" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Results", description: "View calculations" }
  ];

  const updateSetup = (updates: Partial<HouseholdSetupType>) => {
    const newSetup: HouseholdSetupType = { 
      ...setup, 
      ...updates,
      householdType: 'couple' as const, // Always couple for this version
      adults: 2 // Always 2 adults for couples
    };
    
    setSetup(newSetup);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={1} totalSteps={4} steps={steps} />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Household Mental Load Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's start by understanding your household setup. This helps us show you the most relevant tasks and responsibilities.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Tell us about your household</CardTitle>
            <CardDescription className="text-muted-foreground">
              We'll customize the assessment based on your situation
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Welcome Message */}
            <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Welcome, Couples!
              </h3>
              <p className="text-muted-foreground">
                This assessment is designed for couples to understand how household mental load is shared between partners.
              </p>
              <div className="mt-4 p-3 rounded bg-background/50">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Best results:</strong> Complete this together as a pair, or share your results afterwards for meaningful discussion.
                </p>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Baby className="h-6 w-6 text-primary" />
                <div>
                  <Label className="text-base font-medium">Number of children</Label>
                  <p className="text-sm text-muted-foreground">Children living at home</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map(num => (
                  <Button
                    key={num}
                    variant={setup.children === num ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetup({ children: num })}
                  >
                    {num === 3 ? "3+" : num}
                  </Button>
                ))}
              </div>
            </div>


            {/* Employment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <div>
                    <Label className="text-base font-medium">Are you employed?</Label>
                    <p className="text-sm text-muted-foreground">Working outside the home</p>
                  </div>
                </div>
                <Switch
                  checked={setup.isEmployed}
                  onCheckedChange={(checked) => updateSetup({ isEmployed: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-secondary" />
                  <div>
                    <Label className="text-base font-medium">Is your partner employed?</Label>
                    <p className="text-sm text-muted-foreground">Partner working outside the home</p>
                  </div>
                </div>
                <Switch
                  checked={setup.partnerEmployed || false}
                  onCheckedChange={(checked) => updateSetup({ partnerEmployed: checked })}
                />
              </div>
            </div>

            <div className="pt-6">
              <Button 
                onClick={handleNext} 
                variant="hero" 
                size="lg" 
                className="w-full"
              >
                Continue to Tutorial
              </Button>
              
              {/* Future versions note */}
              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-muted">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Coming Soon:</strong> We're working on versions for single parents and other family types. 
                  This current version focuses on couples to ensure the best possible experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdSetup;