import React from 'react';
import { Badge } from './ui/badge';
import { Tag } from 'lucide-react';

interface LabelBadgeProps {
  label: string;
  color?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'default';
}

export const LabelBadge: React.FC<LabelBadgeProps> = ({
  label,
  color = '#007bff',
  variant = 'secondary',
  size = 'sm',
}) => {
  return (
    <Badge
      variant={variant}
      className="flex items-center gap-1 text-xs"
      style={{
        backgroundColor: variant === 'secondary' ? `${color}20` : undefined,
        borderColor: color,
        color: variant === 'secondary' ? color : undefined,
      }}
    >
      <Tag className="h-2.5 w-2.5" />
      {label}
    </Badge>
  );
};