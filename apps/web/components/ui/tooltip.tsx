import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled) {
    return <>{children}</>;
  }

  const tooltipStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  const tooltipContentStyles: React.CSSProperties = {
    visibility: isVisible ? 'visible' : 'hidden',
    opacity: isVisible ? 1 : 0,
    position: 'absolute',
    zIndex: 1000,
    padding: '12px 16px',
    backgroundColor: '#2d3748',
    color: '#ffffff',
    border: '1px solid #4a5568',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.5',
    maxWidth: '320px',
    minWidth: '220px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25), 0 6px 12px rgba(0, 0, 0, 0.15)',
    transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
    whiteSpace: 'pre-wrap',
    ...getPositionStyles(position),
  };

  const arrowStyles: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    ...getArrowStyles(position),
  };

  return (
    <div 
      style={tooltipStyles}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div style={tooltipContentStyles}>
        <div style={arrowStyles} />
        {content}
      </div>
    </div>
  );
};

function getPositionStyles(position: string) {
  switch (position) {
    case 'top':
      return {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
      };
    case 'bottom':
      return {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '8px',
      };
    case 'left':
      return {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginRight: '8px',
      };
    case 'right':
      return {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: '8px',
      };
    default:
      return {};
  }
}

function getArrowStyles(position: string) {
  const borderSize = '6px';
  switch (position) {
    case 'top':
      return {
        top: '100%',
        left: '50%',
        marginLeft: `-${borderSize}`,
        borderLeft: `${borderSize} solid transparent`,
        borderRight: `${borderSize} solid transparent`,
        borderTop: `${borderSize} solid #2d3748`,
      };
    case 'bottom':
      return {
        bottom: '100%',
        left: '50%',
        marginLeft: `-${borderSize}`,
        borderLeft: `${borderSize} solid transparent`,
        borderRight: `${borderSize} solid transparent`,
        borderBottom: `${borderSize} solid #2d3748`,
      };
    case 'left':
      return {
        top: '50%',
        left: '100%',
        marginTop: `-${borderSize}`,
        borderTop: `${borderSize} solid transparent`,
        borderBottom: `${borderSize} solid transparent`,
        borderLeft: `${borderSize} solid #2d3748`,
      };
    case 'right':
      return {
        top: '50%',
        right: '100%',
        marginTop: `-${borderSize}`,
        borderTop: `${borderSize} solid transparent`,
        borderBottom: `${borderSize} solid transparent`,
        borderRight: `${borderSize} solid #2d3748`,
      };
    default:
      return {};
  }
}