
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  isVerified: boolean;
  verificationMethod?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ isVerified, verificationMethod, size = 'md' }: VerifiedBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="default" className={`bg-blue-600 hover:bg-blue-700 ${sizeClasses[size]}`}>
            <CheckCircle className={`${iconSizes[size]} mr-1`} />
            Verified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified {verificationMethod === 'csv_upload' ? 'via CSV upload' : 'by admin'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
