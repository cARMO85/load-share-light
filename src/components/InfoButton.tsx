import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InfoButtonProps {
  variant?: 'default' | 'small';
}

export const InfoButton: React.FC<InfoButtonProps> = ({ variant = 'default' }) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      size={variant === 'small' ? 'sm' : 'default'}
      onClick={() => navigate('/advice')}
      className="text-muted-foreground hover:text-foreground"
    >
      <Info className="h-4 w-4 mr-1" />
      Learn More
    </Button>
  );
};