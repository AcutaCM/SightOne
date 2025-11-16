// Node Icon Component
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NodeIconProps {
  icon: LucideIcon;
  color?: string;
  size?: number;
  className?: string;
}

export const NodeIcon: React.FC<NodeIconProps> = ({ 
  icon: Icon, 
  color = '#64FFDA', 
  size = 20,
  className = ''
}) => {
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ color }}
    >
      <Icon size={size} />
    </div>
  );
};

export default NodeIcon;
