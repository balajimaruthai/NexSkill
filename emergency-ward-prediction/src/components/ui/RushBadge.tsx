import React from 'react';
import type { RushLevel } from '../../types';

interface RushBadgeProps {
  level: RushLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RushBadge: React.FC<RushBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const config = {
    'Low Rush': { class: 'badge-low', icon: '🟢', label: 'Low Rush' },
    'Medium Rush': { class: 'badge-medium', icon: '🟡', label: 'Medium Rush' },
    'High Rush': { class: 'badge-high', icon: '🔴', label: 'High Rush' },
  };

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const { class: cls, icon, label } = config[level];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg font-semibold ${cls} ${sizeClass[size]}`}>
      {showIcon && <span>{icon}</span>}
      {label}
    </span>
  );
};
