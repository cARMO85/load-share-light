import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  FileText, 
  Clock, 
  AlertCircle
} from 'lucide-react';

interface DiscussionNotesProps {
  notes: Record<string, string>;
  isTogetherMode: boolean;
}

export const DiscussionNotes: React.FC<DiscussionNotesProps> = ({
  notes,
  isTogetherMode
}) => {
  const notesEntries = Object.entries(notes).filter(([_, content]) => content.trim());

  if (notesEntries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Discussion Notes Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isTogetherMode 
              ? "As you work through discussions together, your notes will appear here for future reference."
              : "Your reflection notes and insights will be displayed here as you add them."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Discussion Notes</h2>
        <p className="text-muted-foreground">
          {isTogetherMode 
            ? "Notes and insights from your conversations together"
            : "Your reflections and thoughts from the assessment"
          }
        </p>
        <Badge variant="secondary" className="mt-2">
          <FileText className="h-3 w-3 mr-1" />
          {notesEntries.length} note{notesEntries.length !== 1 ? 's' : ''} recorded
        </Badge>
      </div>

      <div className="space-y-4">
        {notesEntries.map(([promptId, content], index) => (
          <Card key={promptId} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {index + 1}
                </div>
                Discussion Point
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {content}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notesEntries.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">Your Discussion History</p>
                <p className="text-muted-foreground">
                  These notes capture important insights from your conversations. 
                  Consider revisiting them as you work on improving your household task distribution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};