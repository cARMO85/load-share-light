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
  
  const [setup, setSetup] = useState<HouseholdSetupType>(state.householdSetup);

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
    const newSetup = { ...setup, ...updates };
    
    // Auto-derive adults count from household type
    if (updates.householdType) {
      if (updates.householdType === 'single') {
        newSetup.adults = 1;
        newSetup.partnerEmployed = undefined;
        newSetup.children = 0; // Individual has no children
      } else if (updates.householdType === 'couple') {
        newSetup.adults = 2;
        // Don't auto-set children for couple - they can have children or not
      }
    }
    
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
            {/* Household Type */}
            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-lg font-semibold">What best describes your situation?</Label>
                <p className="text-sm text-muted-foreground mt-1">This helps us show you relevant tasks and comparisons</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant={setup.householdType === 'single' ? "default" : "outline"}
                  onClick={() => updateSetup({ householdType: 'single' })}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <UserCheck className="h-6 w-6" />
                   <div className="text-center">
                     <div className="font-medium">Individual</div>
                     <div className="text-xs text-muted-foreground">Living alone</div>
                   </div>
                </Button>
                
                <Button
                  variant={setup.householdType === 'couple' ? "default" : "outline"}
                  onClick={() => updateSetup({ householdType: 'couple' })}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Heart className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Couple</div>
                    <div className="text-xs text-muted-foreground">Two adults together</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Tip for couples */}
            {setup.householdType === 'couple' && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground text-center">
                  💡 <strong>Tip:</strong> For the best results, try completing this assessment together as a pair. If you do it alone, you can still share your results afterwards.
                </p>
              </div>
            )}

            {/* Children - Show for Couples only */}
            {setup.householdType === 'couple' && (
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
            )}


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

              {setup.householdType === 'couple' && (
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
              )}
            </div>

            <div className="pt-6">
              <Button 
                onClick={handleNext} 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={!setup.householdType}
              >
                Continue to Tutorial
              </Button>
              {!setup.householdType && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Please select your household type to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdSetup;