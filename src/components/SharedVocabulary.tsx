import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  Eye, 
  Heart, 
  Clock, 
  Target,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { SHARED_VOCABULARY } from '@/lib/conversationEngine';

interface SharedVocabularyProps {
  highlightTerms?: string[];
  showExamples?: boolean;
}

export const SharedVocabulary: React.FC<SharedVocabularyProps> = ({
  highlightTerms = [],
  showExamples = true
}) => {
  const [openTerms, setOpenTerms] = useState<Set<string>>(new Set());

  const vocabularyEntries = Object.entries(SHARED_VOCABULARY);

  const toggleTerm = (termKey: string) => {
    const newOpenTerms = new Set(openTerms);
    if (newOpenTerms.has(termKey)) {
      newOpenTerms.delete(termKey);
    } else {
      newOpenTerms.add(termKey);
    }
    setOpenTerms(newOpenTerms);
  };

  const getTermIcon = (termKey: string) => {
    switch (termKey) {
      case 'mentalLoad': return <Brain className="h-4 w-4" />;
      case 'anticipationWork': return <Clock className="h-4 w-4" />;
      case 'emotionalLabour': return <Heart className="h-4 w-4" />;
      case 'invisibleWork': return <Eye className="h-4 w-4" />;
      case 'cognitiveLabour': return <Target className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const isHighlighted = (termKey: string) => {
    return highlightTerms.some(term => 
      term.toLowerCase().includes(termKey.toLowerCase()) ||
      SHARED_VOCABULARY[termKey as keyof typeof SHARED_VOCABULARY]?.term.toLowerCase().includes(term.toLowerCase())
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Shared Vocabulary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Understanding these concepts helps create a common language for discussing household work
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {vocabularyEntries.map(([termKey, entry]) => {
          const isOpen = openTerms.has(termKey);
          const highlighted = isHighlighted(termKey);

          return (
            <Collapsible key={termKey} open={isOpen} onOpenChange={() => toggleTerm(termKey)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-start p-3 h-auto ${
                    highlighted ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-1.5 rounded-full ${
                      highlighted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {getTermIcon(termKey)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.term}</span>
                        {highlighted && (
                          <Badge variant="outline" className="text-xs">
                            Key concept
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {entry.definition}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-3 pb-3">
                <div className="ml-12 space-y-3">
                  <p className="text-sm text-foreground">
                    {entry.definition}
                  </p>
                  
                  {showExamples && entry.examples && entry.examples.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Examples
                      </h5>
                      <ul className="space-y-1">
                        {entry.examples.map((example, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        <div className="mt-6 p-3 bg-muted/30 rounded border">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> These terms can help you and your partner discuss household work more clearly. 
            When one person says "I do more," you can ask "Do you mean visible work or mental load?" 
            to have a more specific conversation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};