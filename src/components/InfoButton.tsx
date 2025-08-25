import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InfoButtonProps {
  variant?: 'default' | 'small' | 'tooltip';
  tooltipContent?: string;
  linkTo?: string;
  children?: React.ReactNode;
}

export const InfoButton: React.FC<InfoButtonProps> = ({ 
  variant = 'default', 
  tooltipContent,
  linkTo = '/advice',
  children = 'Learn More'
}) => {
  const navigate = useNavigate();

  if (variant === 'tooltip' && tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground p-1 h-auto"
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size={variant === 'small' ? 'sm' : 'default'}
      onClick={() => navigate(linkTo)}
      className="text-muted-foreground hover:text-foreground"
    >
      <Info className="h-4 w-4 mr-1" />
      {children}
    </Button>
  );
};