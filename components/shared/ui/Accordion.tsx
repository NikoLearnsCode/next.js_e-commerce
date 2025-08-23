'use client';

import React, {createContext, useContext, useState, useId} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {ChevronDown} from 'lucide-react';
import {twMerge} from 'tailwind-merge';

type AccordionContextProps = {
  openValues: string[];
  toggleValue: (value: string) => void;
  type: 'single' | 'multiple';
  collapsible: boolean;
};

const AccordionContext = createContext<AccordionContextProps | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an <Accordion.Root>');
  }
  return context;
};

// --- Huvudkomponent  ---
type AccordionRootProps = {
  children: React.ReactNode;
  type?: 'single' | 'multiple';

  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
};

function AccordionRoot({
  children,
  type = 'single',
  collapsible = true,
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
}: AccordionRootProps) {
  const [internalValue, setInternalValue] = useState<string[]>(() => {
    if (valueProp !== undefined) return []; // Controlled mode
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const isControlled = valueProp !== undefined;
  const openValues = isControlled
    ? Array.isArray(valueProp)
      ? valueProp
      : valueProp
        ? [valueProp]
        : []
    : internalValue;

  const toggleValue = (toggledItemValue: string) => {
    if (type === 'multiple') {
      const newValue = openValues.includes(toggledItemValue)
        ? openValues.filter((v) => v !== toggledItemValue)
        : [...openValues, toggledItemValue];

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
      return;
    }

    // type === 'single'
    const isAlreadyOpen = openValues.includes(toggledItemValue);
    if (isAlreadyOpen && !collapsible) {
      return;
    }

    const newValue = isAlreadyOpen ? '' : toggledItemValue;

    if (!isControlled) {
      setInternalValue([newValue]);
    }
    onValueChange?.(newValue);
  };

  return (
    <AccordionContext.Provider
      value={{openValues, toggleValue, type, collapsible}}
    >
      <div className={twMerge('flex flex-col gap-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// --- Item-komponent ---
type AccordionItemProps = {
  children: React.ReactNode;
  value: string; 
  className?: string;
};


const AccordionItemContext = createContext<{isOpen: boolean} | null>(null);

function AccordionItem({children, value, className = ''}: AccordionItemProps) {
  const {openValues} = useAccordion();
  const isOpen = openValues.includes(value);
  const headerId = useId();
  const contentId = useId();

  return (
    <AccordionItemContext.Provider value={{isOpen}}>
      <div
        className={twMerge('', className)}
        data-state={isOpen ? 'open' : 'closed'}
      >

        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              value,
              headerId,
              contentId,
            } as any);
          }
          return child;
        })}
      </div>
    </AccordionItemContext.Provider>
  );
}

// --- Trigger-komponent (Header) ---
type AccordionTriggerProps = {
  children: React.ReactNode;
  className?: string;
  value?: string;
  headerId?: string;
  contentId?: string;
  showChevron?: boolean;
};

function AccordionTrigger({
  children,
  className,
  value,
  headerId,
  contentId,
  showChevron = true,
}: AccordionTriggerProps) {
  const {toggleValue} = useAccordion();
  const itemContext = useContext(AccordionItemContext);
  const isOpen = itemContext?.isOpen ?? false;

  if (!value) return null;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleValue(value);
    }
  };

  return (
    <motion.header
      id={headerId}
      role='button'
      aria-expanded={isOpen}
      aria-controls={contentId}
      tabIndex={0}
      className={twMerge(
        'flex w-full justify-between py-3 cursor-pointer',
        className
      )}
      onClick={() => toggleValue(value)}
      onKeyDown={handleKeyDown}
      initial={false}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {children}
      {showChevron && (
        <ChevronDown
          className={` transition-transform duration-300 mr-1  ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={22}
          strokeWidth={isOpen ? 1.5 : 1}
        />
      )}
    </motion.header>
  );
}

// --- Content-komponent ---
type AccordionContentProps = {
  children: React.ReactNode;
  className?: string;
  value?: string;
  headerId?: string;
  contentId?: string;
};

function AccordionContent({
  children,
  className,
  headerId,
  contentId,
}: AccordionContentProps) {
  const itemContext = useContext(AccordionItemContext);
  const isOpen = itemContext?.isOpen ?? false;

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.section
          id={contentId}
          role='region'
          aria-labelledby={headerId}
          key='content'
          initial='collapsed'
          animate='open'
          exit='collapsed'
          variants={{
            open: {opacity: 1, height: 'auto', marginBottom: '1rem'},
            collapsed: {opacity: 0, height: 0, marginBottom: 0},
          }}
          transition={{duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98]}}
        >
          <div className={twMerge('flex flex-col gap-1 ', className)}>
            {children}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
