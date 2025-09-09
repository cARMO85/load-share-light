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
    navigate('/questionnaire');
  };

  const steps = [
    { title: "Setup", description: "Household info" },
    { title: "Tasks", description: "Assign responsibilities" },
    { title: "Perspectives", description: "Share your views" },
    { title: "Results", description: "View calculations" },
    { title: "Visualize", description: "Charts & insights" }
  ];

  const updateSetup = (updates: Partial<HouseholdSetupType>) => {
    const newSetup = { ...setup, ...updates };
    
    // Auto-derive adults count from household type
    if (updates.householdType) {
      if (updates.householdType === 'single' || updates.householdType === 'single_parent') {
        newSetup.adults = 1;
        newSetup.partnerEmployed = undefined;
        newSetup.assessmentMode = 'solo';
      } else if (updates.householdType === 'couple' || updates.householdType === 'couple_with_children') {
        newSetup.adults = 2;
      } else {
        newSetup.adults = setup.adults; // Keep current for 'other'
      }
    }
    
    setSetup(newSetup);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={1} totalSteps={5} steps={steps} />
        
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
                <Label className="text-lg font-semibold">What best describes your household?</Label>
                <p className="text-sm text-muted-foreground mt-1">This helps us show you relevant tasks</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant={setup.householdType === 'single' ? "default" : "outline"}
                  onClick={() => updateSetup({ householdType: 'single' })}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <UserCheck className="h-6 w-6" />
                   <div className="text-center">
                     <div className="font-medium">Single Person</div>
                     <div className="text-xs text-muted-foreground">Track your mental load & optimize your time</div>
                   </div>
                </Button>
                
                <Button
                  variant={setup.householdType === 'single_parent' ? "default" : "outline"}
                  onClick={() => updateSetup({ householdType: 'single_parent' })}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Baby className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Single Parent</div>
                    <div className="text-xs text-muted-foreground">One adult with children</div>
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
                    <div className="text-xs text-muted-foreground">Two adults, no children</div>
                  </div>
                </Button>
                
                <Button
                  variant={setup.householdType === 'couple_with_children' ? "default" : "outline"}
                  onClick={() => updateSetup({ householdType: 'couple_with_children' })}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Home className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Family</div>
                    <div className="text-xs text-muted-foreground">Two adults with children</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Assessment Mode for Couples */}
            {(setup.householdType === 'couple' || setup.householdType === 'couple_with_children') && (
              <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-center">
                  <Label className="text-lg font-semibold text-primary">How would you like to take this assessment?</Label>
                  <p className="text-sm text-muted-foreground mt-1">Choose your preferred approach</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant={setup.assessmentMode === 'solo' ? "default" : "outline"}
                    onClick={() => updateSetup({ assessmentMode: 'solo' })}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <UserCheck className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-medium">Just Me</div>
                      <div className="text-xs text-muted-foreground">I'll complete this on my own</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={setup.assessmentMode === 'together' ? "default" : "outline"}
                    onClick={() => updateSetup({ assessmentMode: 'together' })}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Users className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-medium">Together</div>
                      <div className="text-xs text-muted-foreground">We'll work on this together</div>
                    </div>
                  </Button>
                </div>
                
                {setup.assessmentMode === 'together' && (
                  <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <p className="text-xs text-muted-foreground text-center">
                      💡 <strong>Together Mode:</strong> You'll work through tasks collaboratively, then capture insights and discuss differences together.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Children - Only show if not already specified by household type */}
            {(setup.householdType === 'single_parent' || setup.householdType === 'couple_with_children' || setup.householdType === 'other') && (
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

              {(setup.householdType === 'couple' || setup.householdType === 'couple_with_children') && (
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
                Continue to Task Assessment
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