import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";

interface ImbalanceCardProps {
  isOpen: boolean;
  onToggle: () => void;
  isSingleAdult: boolean;
  visibleResults: any;
  wmliResults: any;
}

export const ImbalanceCard: React.FC<ImbalanceCardProps> = ({
  isOpen,
  onToggle,
  isSingleAdult,
  visibleResults,
  wmliResults
}) => {
  const getImbalances = () => {
    const imbalances = [];
    
    if (!isSingleAdult) {
      // Use the calculated overall percentages to detect imbalances
      const visibleGap = Math.abs(visibleResults.myVisiblePercentage - 50);
      const mentalGap = Math.abs((wmliResults.myWMLI_Share || 50) - 50);
      
      // High visible work gap
      if (visibleGap >= 15) {
        const higherPartner = visibleResults.myVisiblePercentage > 50 ? 'You' : 'Your partner';
        const higherPct = Math.max(visibleResults.myVisiblePercentage, 100 - visibleResults.myVisiblePercentage);
        const lowerPct = Math.min(visibleResults.myVisiblePercentage, 100 - visibleResults.myVisiblePercentage);
        
        imbalances.push({
          taskName: 'Overall Visible Work Distribution',
          type: 'High Responsibility Gap',
          insight: `${higherPartner} handle ${Math.round(higherPct)}% of visible household work while the other partner handles ${Math.round(lowerPct)}%. This ${Math.round(visibleGap)}% gap creates significant imbalance.`,
          prompt: 'How could we redistribute some visible tasks to create a more balanced split?',
          priority: visibleGap
        });
      }
      
      // High mental load gap  
      if (mentalGap >= 15) {
        const higherPartner = (wmliResults.myWMLI_Share || 50) > 50 ? 'You' : 'Your partner';
        const higherPct = Math.max(wmliResults.myWMLI_Share || 50, 100 - (wmliResults.myWMLI_Share || 50));
        const lowerPct = Math.min(wmliResults.myWMLI_Share || 50, 100 - (wmliResults.myWMLI_Share || 50));
        
        imbalances.push({
          taskName: 'Overall Mental Load Distribution', 
          type: 'Mental Load Imbalance',
          insight: `${higherPartner} carry ${Math.round(higherPct)}% of the mental load while the other carries ${Math.round(lowerPct)}%. This invisible work imbalance can create stress.`,
          prompt: 'What planning and organizing tasks could be shared or redistributed?',
          priority: mentalGap
        });
      }
    }
    
    return imbalances;
  };

  const imbalances = getImbalances();

  return (
    <Card id="drivers" className="border-2">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {isSingleAdult ? 'Tasks adding most to your mental load' : 'Biggest imbalances between partners'}
                </CardTitle>
                <CardDescription>
                  {isSingleAdult 
                    ? 'Areas of highest burden that might need attention'
                    : 'Tasks where the workload distribution needs the most discussion'
                  }
                </CardDescription>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              {imbalances.length > 0 ? (
                imbalances.map((imbalance, index) => (
                  <div key={`${imbalance.taskName}-${index}`} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{index + 1} {imbalance.taskName}</span>
                          <Badge variant="outline" className="text-xs">
                            {imbalance.type}
                          </Badge>
                        </div>
                        
                        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-900 mb-1">Key Insight</div>
                          <p className="text-sm text-blue-800">{imbalance.insight}</p>
                        </div>
                        
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                          <div className="text-sm font-medium text-amber-900 mb-1">Conversation Starter</div>
                          <p className="text-sm text-amber-800 italic">"{imbalance.prompt}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium text-green-700 mb-2">
                    {isSingleAdult ? 'Well-Managed Tasks!' : 'Excellent Partnership Balance!'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isSingleAdult 
                      ? 'Your current task management appears well-balanced without major strain areas.'
                      : 'You and your partner show strong alignment on household responsibilities.'
                    }
                  </p>
                  <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-200 max-w-md mx-auto">
                    <div className="text-sm font-medium text-blue-900 mb-1">Maintenance Prompt</div>
                    <p className="text-sm text-blue-800 italic">
                      "What's working well for us right now that we want to make sure we keep?"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};