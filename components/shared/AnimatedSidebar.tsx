'use client';
import React, {ReactNode} from 'react';
import {motion, Variants} from 'framer-motion';
import {X} from 'lucide-react';

// ==================== 1. Stängningsknapp (X) ====================
interface MotionCloseXProps {
  onClick: () => void;
  className?: string;
  size?: number;
  strokeWidth?: number;
  withTranslate?: boolean;
}

export const MotionCloseX = ({
  onClick,
  className = '',
  size = 15,
  strokeWidth = 1.5,
  withTranslate = false,
}: MotionCloseXProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`cursor-pointer z-50 ${className}`}
      aria-label='Stäng meny'
      initial={withTranslate ? {opacity: 0, rotate: 0, translateX: -200} : {}}
      animate={withTranslate ? {opacity: 1, rotate: 0, translateX: 0} : {}}
      transition={{delay: 0.15, duration: 0.3}}
    >
      <X size={size} strokeWidth={strokeWidth} />
    </motion.button>
  );
};

// ==================== 2. Dropdown Motion Div ====================
interface MotionDropdownProps {
  children: ReactNode;
  onMouseLeave?: () => void;
  className?: string;
  id?: string;
  isMobile?: boolean;
  position?: 'left' | 'right' | 'top' | 'newLeft';
  style?: React.CSSProperties;
}

export const MotionDropdown = ({
  children,
  onMouseLeave,
  className = '',
  isMobile = false,
  id = 'dropdown',
  position = 'left',
  style,
}: MotionDropdownProps) => {
  const leftVariants: Variants = {
    hidden: {x: -100, opacity: 0, width: 0},
    visible: {
      x: 0,
      opacity: 1,
      width: isMobile ? '100%' : 'auto',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        duration: 0.3,
      },
    },
    exit: {x: -100, opacity: 0, width: 0, transition: {duration: 0.2}},
  };

  const rightVariants: Variants = {
    hidden: {x: 150, opacity: 0, width: 0},
    visible: {
      x: 0,
      opacity: 1,
      width: 'auto',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        duration: 0.3,
      },
    },
    exit: {x: 150, opacity: 0, width: 0, transition: {duration: 0.2}},
  };

  const topVariants: Variants = {
    hidden: {
      clipPath: 'inset(0% 0% 100% 0%)',
      opacity: 0,
    },

    visible: {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      transition: {
        type: 'tween',
        ease: 'easeOut',
        duration: 0.2,
      },
    },

    exit: {
      clipPath: 'inset(0% 0% 100% 0%)',
      opacity: 1,
      transition: {
        type: 'tween',
        ease: 'easeIn',
        duration: 0.1,
        delay: 0.2,
      },
    },
  };

  const newLeftVariants: Variants = {
    hidden: {
      clipPath: 'inset(0% 100% 0% 0%)',
      opacity: 1,
    },

    visible: {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      transition: {
        type: 'tween',
        ease: 'easeOut',
        duration: 0.3,
        delay: 0.1,
      },
    },

    exit: {
      clipPath: 'inset(0% 100% 0% 0%)',
      opacity: 1,
      transition: {
        type: 'tween',
        ease: 'easeIn',
        duration: 0.2,
        delay: 0.1,
      },
    },
  };

  // Funktion för att dynamiskt välja animationsvarianter baserat på 'position'-prop.
  const getVariants = () => {
    switch (position) {
      case 'left':
        return leftVariants;
      case 'right':
        return rightVariants;
      case 'top':
        return topVariants;
      case 'newLeft':
        return newLeftVariants;
      default:
        return leftVariants;
    }
  };

  // funktion för att dynamiskt välja CSS-klasser för position och storlek.
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return `left-0 top-0 h-full ${isMobile ? 'w-full' : ''}`;
      case 'right':
        return `right-0 top-0 h-full`;
      case 'top':
        return 'w-full';
      case 'newLeft':
        return `left-0 top-0 h-full ${isMobile ? 'w-full' : ''}`;
      default:
        return 'left-0 top-0 h-full';
    }
  };

  return (
    <motion.div
      className={`fixed ${getPositionClasses()} bg-white z-40 shadow-md ${className}`}
      variants={getVariants()}
      initial='hidden'
      animate='visible'
      exit='exit'
      key={id}
      onMouseLeave={onMouseLeave}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// ==================== 3. Overlay/Backdrop Motion Div ====================
interface MotionOverlayProps {
  onMouseEnter?: () => void;
  className?: string;
  isMobile?: boolean;
  id?: string;
  onClick?: () => void;
  ariaHidden?: boolean;
  withDelay?: boolean;
}

export const MotionOverlay = ({
  onMouseEnter,
  onClick,
  className = '',
  id = 'overlay',
  ariaHidden = true,
  withDelay = false,
}: MotionOverlayProps) => {
  const backdropVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 0.2,
      transition: {duration: 0.3, delay: withDelay ? 0.15 : 0},
    },
    exit: {
      opacity: 0,
      transition: {duration: 0.1, delay: withDelay ? 0.2 : 0},
    },
  };

  return (
    <motion.div
      className={`fixed inset-0 h-full cursor-pointer w-full bg-black z-30 ${className}`}
      variants={backdropVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      key={id}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      aria-hidden={ariaHidden}
    />
  );
};
