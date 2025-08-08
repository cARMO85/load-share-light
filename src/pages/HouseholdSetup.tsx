import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAssessment } from '@/context/AssessmentContext';
import { HouseholdSetup as HouseholdSetupType } from '@/types/assessment';
import { Users, Baby, Dog, TreePine, Briefcase } from 'lucide-react';

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
    { title: "Results", description: "View calculations" },
    { title: "Visualize", description: "Charts & insights" }
  ];

  const updateSetup = (updates: Partial<HouseholdSetupType>) => {
    setSetup(prev => ({ ...prev, ...updates }));
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
            {/* Adults */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <Label className="text-base font-medium">Number of adults</Label>
                  <p className="text-sm text-muted-foreground">How many adults live in your household?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={setup.adults === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetup({ adults: 1, partnerEmployed: undefined })}
                >
                  1
                </Button>
                <Button
                  variant={setup.adults === 2 ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetup({ adults: 2 })}
                >
                  2
                </Button>
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

            {/* Pets */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Dog className="h-6 w-6 text-primary" />
                <div>
                  <Label className="text-base font-medium">Do you have pets?</Label>
                  <p className="text-sm text-muted-foreground">Dogs, cats, or other pets requiring care</p>
                </div>
              </div>
              <Switch
                checked={setup.hasPets}
                onCheckedChange={(checked) => updateSetup({ hasPets: checked })}
              />
            </div>

            {/* Garden */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <TreePine className="h-6 w-6 text-primary" />
                <div>
                  <Label className="text-base font-medium">Do you have a garden?</Label>
                  <p className="text-sm text-muted-foreground">Yard, garden, or outdoor space requiring maintenance</p>
                </div>
              </div>
              <Switch
                checked={setup.hasGarden}
                onCheckedChange={(checked) => updateSetup({ hasGarden: checked })}
              />
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

              {setup.adults === 2 && (
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
              >
                Continue to Task Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdSetup;