import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssessment } from '@/context/AssessmentContext';
import { TaskResponse } from '@/types/assessment';
import { allTaskLookup } from '@/data/allTasks';
import { 
  Settings, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Scale,
  Heart,
  Zap
} from 'lucide-react';

// Define test profiles
export interface TestProfile {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  scenario: string;
  generateResponses: () => { myResponses: TaskResponse[], partnerResponses: TaskResponse[] };
}

export const testProfiles: TestProfile[] = [
  {
    id: 'balanced',
    name: 'Balanced Partnership',
    description: 'Equal distribution, both partners feel appreciated',
    icon: Scale,
    scenario: 'Both partners share responsibilities fairly with good recognition',
    generateResponses: () => {
      const tasks = Object.keys(allTaskLookup).slice(0, 20);
      
      const myResponses: TaskResponse[] = tasks.map(taskId => ({
        taskId,
        assignment: Math.random() > 0.5 ? 'shared' : (Math.random() > 0.5 ? 'me' : 'partner'),
        mySharePercentage: 45 + Math.random() * 10, // 45-55%
        measurementType: 'likert' as const,
        likertRating: {
          burden: 2 + Math.random() * 2, // 2-4 (moderate burden)
          fairness: 4 + Math.random() * 1  // 4-5 (good recognition)
        }
      }));

      const partnerResponses: TaskResponse[] = tasks.map(taskId => {
        const myResponse = myResponses.find(r => r.taskId === taskId)!;
        return {
          taskId,
          assignment: myResponse.assignment === 'me' ? 'partner' : 
                     myResponse.assignment === 'partner' ? 'me' : 'shared',
          mySharePercentage: 100 - (myResponse.mySharePercentage || 50),
          measurementType: 'likert' as const,
          likertRating: {
            burden: 2 + Math.random() * 2,
            fairness: 4 + Math.random() * 1
          }
        };
      });

      return { myResponses, partnerResponses };
    }
  },
  {
    id: 'overloaded_partner1',
    name: 'Partner 1 Overloaded',
    description: 'Partner 1 carries most load, feels overwhelmed and unrecognized',
    icon: AlertTriangle,
    scenario: 'Partner 1 is doing 70%+ of mental load and feeling stressed',
    generateResponses: () => {
      const tasks = Object.keys(allTaskLookup).slice(0, 20);
      
      const myResponses: TaskResponse[] = tasks.map(taskId => ({
        taskId,
        assignment: Math.random() > 0.3 ? 'me' : 'shared', // 70% me, 30% shared
        mySharePercentage: Math.random() > 0.5 ? 75 + Math.random() * 20 : 60 + Math.random() * 15, // 60-95%
        measurementType: 'likert' as const,
        likertRating: {
          burden: 4 + Math.random() * 1, // 4-5 (high burden)
          fairness: 1 + Math.random() * 2  // 1-3 (poor recognition)
        }
      }));

      const partnerResponses: TaskResponse[] = tasks.map(taskId => {
        const myResponse = myResponses.find(r => r.taskId === taskId)!;
        return {
          taskId,
          assignment: myResponse.assignment === 'me' ? 'partner' : 'shared',
          mySharePercentage: Math.min(100 - (myResponse.mySharePercentage || 70), 40),
          measurementType: 'likert' as const,
          likertRating: {
            burden: 1 + Math.random() * 2, // 1-3 (low burden)
            fairness: 3 + Math.random() * 2  // 3-5 (feels okay about recognition)
          }
        };
      });

      return { myResponses, partnerResponses };
    }
  },
  {
    id: 'overloaded_partner2',
    name: 'Partner 2 Overloaded',
    description: 'Partner 2 carries most load, feels overwhelmed',
    icon: AlertTriangle,
    scenario: 'Partner 2 is doing 70%+ of mental load and feeling stressed',
    generateResponses: () => {
      const tasks = Object.keys(allTaskLookup).slice(0, 20);
      
      const myResponses: TaskResponse[] = tasks.map(taskId => ({
        taskId,
        assignment: Math.random() > 0.3 ? 'partner' : 'shared', // 70% partner, 30% shared
        mySharePercentage: Math.random() > 0.5 ? 15 + Math.random() * 20 : 20 + Math.random() * 20, // 15-40%
        measurementType: 'likert' as const,
        likertRating: {
          burden: 1 + Math.random() * 2, // 1-3 (low burden)
          fairness: 3 + Math.random() * 2  // 3-5 (feels okay)
        }
      }));

      const partnerResponses: TaskResponse[] = tasks.map(taskId => {
        const myResponse = myResponses.find(r => r.taskId === taskId)!;
        return {
          taskId,
          assignment: myResponse.assignment === 'partner' ? 'me' : 'shared',
          mySharePercentage: 100 - (myResponse.mySharePercentage || 30),
          measurementType: 'likert' as const,
          likertRating: {
            burden: 4 + Math.random() * 1, // 4-5 (high burden)
            fairness: 1 + Math.random() * 2  // 1-3 (poor recognition)
          }
        };
      });

      return { myResponses, partnerResponses };
    }
  },
  {
    id: 'unfair_recognition',
    name: 'Recognition Issues',
    description: 'Fairly balanced workload but poor appreciation',
    icon: Heart,
    scenario: 'Both partners working but feeling unappreciated',
    generateResponses: () => {
      const tasks = Object.keys(allTaskLookup).slice(0, 20);
      
      const myResponses: TaskResponse[] = tasks.map(taskId => ({
        taskId,
        assignment: Math.random() > 0.5 ? 'shared' : (Math.random() > 0.5 ? 'me' : 'partner'),
        mySharePercentage: 40 + Math.random() * 20, // 40-60%
        measurementType: 'likert' as const,
        likertRating: {
          burden: 2 + Math.random() * 2, // 2-4 (moderate burden)
          fairness: 1 + Math.random() * 2  // 1-3 (poor recognition)
        }
      }));

      const partnerResponses: TaskResponse[] = tasks.map(taskId => {
        const myResponse = myResponses.find(r => r.taskId === taskId)!;
        return {
          taskId,
          assignment: myResponse.assignment === 'me' ? 'partner' : 
                     myResponse.assignment === 'partner' ? 'me' : 'shared',
          mySharePercentage: 100 - (myResponse.mySharePercentage || 50),
          measurementType: 'likert' as const,
          likertRating: {
            burden: 2 + Math.random() * 2,
            fairness: 1 + Math.random() * 2  // Also poor recognition
          }
        };
      });

      return { myResponses, partnerResponses };
    }
  },
  {
    id: 'high_intensity',
    name: 'High Intensity Household',
    description: 'Both partners overwhelmed by complex household',
    icon: Zap,
    scenario: 'Complex household with many demanding tasks',
    generateResponses: () => {
      const tasks = Object.keys(allTaskLookup).slice(0, 25); // More tasks
      
      const myResponses: TaskResponse[] = tasks.map(taskId => ({
        taskId,
        assignment: Math.random() > 0.5 ? 'shared' : (Math.random() > 0.5 ? 'me' : 'partner'),
        mySharePercentage: 45 + Math.random() * 10,
        measurementType: 'likert' as const,
        likertRating: {
          burden: 4 + Math.random() * 1, // 4-5 (high burden)
          fairness: 3 + Math.random() * 2  // 3-5 (variable recognition)
        }
      }));

      const partnerResponses: TaskResponse[] = tasks.map(taskId => {
        const myResponse = myResponses.find(r => r.taskId === taskId)!;
        return {
          taskId,
          assignment: myResponse.assignment === 'me' ? 'partner' : 
                     myResponse.assignment === 'partner' ? 'me' : 'shared',
          mySharePercentage: 100 - (myResponse.mySharePercentage || 50),
          measurementType: 'likert' as const,
          likertRating: {
            burden: 4 + Math.random() * 1, // Also high burden
            fairness: 3 + Math.random() * 2
          }
        };
      });

      return { myResponses, partnerResponses };
    }
  },
  {
    id: 'ideal_partnership',
    name: 'Ideal Partnership',
    description: 'Low burden, excellent recognition, perfect balance',
    icon: CheckCircle,
    scenario: 'Everything working smoothly with great communication',
    generateResponses: () => {
      const tasks = Object.keys(allTaskLookup).slice(0, 15); // Fewer tasks, well-managed
      
      const myResponses: TaskResponse[] = tasks.map(taskId => ({
        taskId,
        assignment: Math.random() > 0.5 ? 'shared' : (Math.random() > 0.5 ? 'me' : 'partner'),
        mySharePercentage: 48 + Math.random() * 4, // 48-52% (very balanced)
        measurementType: 'likert' as const,
        likertRating: {
          burden: 1 + Math.random() * 2, // 1-3 (low burden)
          fairness: 4.5 + Math.random() * 0.5  // 4.5-5 (excellent recognition)
        }
      }));

      const partnerResponses: TaskResponse[] = tasks.map(taskId => {
        const myResponse = myResponses.find(r => r.taskId === taskId)!;
        return {
          taskId,
          assignment: myResponse.assignment === 'me' ? 'partner' : 
                     myResponse.assignment === 'partner' ? 'me' : 'shared',
          mySharePercentage: 100 - (myResponse.mySharePercentage || 50),
          measurementType: 'likert' as const,
          likertRating: {
            burden: 1 + Math.random() * 2,
            fairness: 4.5 + Math.random() * 0.5
          }
        };
      });

      return { myResponses, partnerResponses };
    }
  }
];

interface DevProfileSelectorProps {
  onProfileSelected?: (profile: TestProfile) => void;
}

export const DevProfileSelector: React.FC<DevProfileSelectorProps> = ({ 
  onProfileSelected 
}) => {
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const { setTaskResponse, setPartnerTaskResponse, setCurrentStep, setHouseholdSetup } = useAssessment();

  const handleApplyProfile = () => {
    const profile = testProfiles.find(p => p.id === selectedProfile);
    if (!profile) return;

    try {
      // Set up household for together mode
      setHouseholdSetup({
        householdType: 'couple',
        assessmentMode: 'together',
        adults: 2,
        children: 0,
        isEmployed: true,
        partnerEmployed: true
      });

      // Generate responses for the selected profile
      const { myResponses, partnerResponses } = profile.generateResponses();

      console.log('Generated responses:', { 
        myCount: myResponses.length, 
        partnerCount: partnerResponses.length,
        profileName: profile.name 
      });

      // Apply my responses
      myResponses.forEach(response => {
        setTaskResponse(response);
      });

      // Apply partner responses  
      partnerResponses.forEach(response => {
        setPartnerTaskResponse(response);
      });

      // Set step to results
      setCurrentStep(4);

      // Notify parent component
      onProfileSelected?.(profile);
      
    } catch (error) {
      console.error('Error applying profile:', error);
    }
  };

  const getProfileColor = (profileId: string) => {
    switch (profileId) {
      case 'balanced': return 'text-green-600';
      case 'overloaded_partner1': 
      case 'overloaded_partner2': return 'text-red-600';
      case 'unfair_recognition': return 'text-orange-600';
      case 'high_intensity': return 'text-purple-600';
      case 'ideal_partnership': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const selectedProfileData = testProfiles.find(p => p.id === selectedProfile);

  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Settings className="h-5 w-5" />
          Dev Profile Selector
          <Badge variant="secondary" className="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            DEVELOPMENT
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-400">
          Choose different household scenarios to test app behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Select Test Profile:
          </label>
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder="Choose a household scenario..." />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 z-50">
              {testProfiles.map(profile => {
                const IconComponent = profile.icon;
                return (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-4 w-4 ${getProfileColor(profile.id)}`} />
                      <span>{profile.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedProfileData && (
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
            <div className="flex items-start gap-3">
              <selectedProfileData.icon className={`h-5 w-5 mt-0.5 ${getProfileColor(selectedProfileData.id)}`} />
              <div className="space-y-1">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  {selectedProfileData.name}
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedProfileData.description}
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-500">
                  <strong>Scenario:</strong> {selectedProfileData.scenario}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleApplyProfile}
            disabled={!selectedProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Apply Profile & Go to Results
          </Button>
          
          {selectedProfile && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedProfile('')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Clear Selection
            </Button>
          )}
        </div>

        <div className="text-xs text-blue-500 dark:text-blue-400 space-y-1">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Profiles generate realistic task response patterns</li>
            <li>Data includes burden ratings, fairness scores, and responsibility shares</li>
            <li>Automatically sets up "together mode" assessment</li>
            <li>Redirects to Results page to see the scenario in action</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};