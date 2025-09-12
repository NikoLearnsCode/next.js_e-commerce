'use client';

import React, {useEffect, useRef, useState} from 'react';
import {FiX} from 'react-icons/fi';

interface ConfirmDialogProps {
  isOpen: boolean; // Kontrollerar om dialogen ska visas
  title: string; // Titel för dialogen
  message: string; // Huvudmeddelandet som visas
  confirmText?: string; // Text för bekräfta-knappen (standard: "Bekräfta")
  cancelText?: string; // Text för avbryt-knappen (standard: "Avbryt")
  onConfirm: () => void; // Funktion som körs när användaren bekräftar
  onCancel: () => void; // Funktion som körs när användaren avbryter
  variant?: 'danger' | 'warning' | 'info'; // Färgschema för dialogen
  isLoading?: boolean; // Visar loading-tillstånd på bekräfta-knappen
  description?: string; // Extra beskrivning under huvudmeddelandet
  triggerElement?: HTMLElement | null; // Element som triggade dialogen (för positionering)
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Bekräfta',
  cancelText = 'Avbryt',
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false,
  description,
  triggerElement,
}: ConfirmDialogProps) {
  // Referens till dialogen för direktmanipulation
  const dialogRef = useRef<HTMLDivElement>(null);
  // Position för dialogen när den ska visas nära trigger-elementet
  const [position, setPosition] = useState({x: 0, y: 0});
  // Kontrollerar synlighet för smooth animationer
  const [isVisible, setIsVisible] = useState(false);

  // Beräknar position relativt till trigger-elementet
  useEffect(() => {
    if (isOpen && triggerElement) {
      // Hämta trigger-elementets position och storlek
      const rect = triggerElement.getBoundingClientRect();
      const dialogWidth = 365; // Ungefärlig bredd på dialogen
      const dialogHeight = 180; // Ungefärlig höjd på dialogen

      // Centrera dialogen horisontellt över trigger-elementet
      let x = rect.left + rect.width / 2 - dialogWidth / 2;
      // Placera dialogen ovanför trigger-elementet med lite marginal
      let y = rect.top - dialogHeight - 30;

      // Se till att dialogen stannar inom viewport (horisontellt)
      if (x < 5) x = 5;
      if (x + dialogWidth > window.innerWidth - 5) {
        x = window.innerWidth - dialogWidth - 5;
      }

      // Om det inte finns plats ovanför, placera under istället
      if (y < 5) {
        y = rect.bottom + 5;
      }

      // Uppdatera positionen
      setPosition({x, y});

      // Liten fördröjning för smooth animation
      setTimeout(() => setIsVisible(true), 50);
    } else if (isOpen && !triggerElement) {
      // Fallback till centrerad position om inget trigger-element
      setIsVisible(true);
    } else {
      // Dölj dialogen när den stängs
      setIsVisible(false);
    }
  }, [isOpen, triggerElement]);

  // Hantera Escape-tangent för att stänga dialogen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onCancel]);

  // Enter-tangent för att bekräfta
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen && !isLoading) {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [isOpen, isLoading, onConfirm]);

  // Tab-tangent för att fokusera på bekräfta-knappen

  // Rendera ingenting om dialogen inte ska visas
  if (!isOpen) return null;

  // Färgscheman för olika varianter av dialogen
  const variantStyles = {
    danger: {
      confirmBtn: 'bg-red-800 hover:bg-red-700 focus:ring-red-700',
    },
    warning: {
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-200',
    },
    info: {
      confirmBtn: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-200',
    },
  };

  const styles = variantStyles[variant];

  // Bestäm styling baserat på om det finns ett trigger-element eller inte
  const dialogStyle = triggerElement
    ? {
        // Absolut positionering nära trigger-elementet
        position: 'fixed' as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isVisible ? 'scale(1)' : 'scale(0.1)',
        opacity: isVisible ? 1 : 0,
      }
    : {
        // Centrerad positionering som fallback
      };

  return (
    <div className='fixed inset-0 z-50 '>
      {/* Dialog container */}
      <div
        ref={dialogRef}
        className={`
          ${triggerElement ? 'fixed' : 'fixed inset-0 flex items-center justify-center p-4'}
          transition-all duration-200 ease-out
        `}
        style={dialogStyle}
      >
        {/* Själva dialog-boxen */}
        <div
          className={`
            relative bg-white rounded-sm shadow-xl border 
            ${triggerElement ? 'w-[280px]' : 'w-full max-w-sm'}
            transform transition-all duration-200
          `}
        >
          {/* Stäng-knapp (X) i övre högra hörnet */}
          <button
            type='button'
            onClick={!isLoading ? onCancel : undefined}
            disabled={isLoading}
            className='absolute right-3 top-3 cursor-pointer text-gray-800 hover:text-gray-600 transition-colors disabled:opacity-50 z-10'
          >
            <FiX className='h-4 w-4' />
          </button>

          {/* Huvudinnehåll */}
          <div className='p-5'>
            {/* Titel och meddelande */}
            <div className='flex items-start gap-4 mb-4'>
              <div className='flex-1 pt-1'>
                <h3 className='text-base font-semibold text-gray-900 mb-2'>
                  {title}
                </h3>
                <p className=' text-xs sm:text-sm text-gray-600 leading-relaxed'>
                  {message}
                </p>
                {/* Extra beskrivning om den finns */}
                {description && (
                  <p className='text-xs text-red-600 mt-2'>{description}</p>
                )}
              </div>
            </div>

            {/* Knappar */}
            <div className='flex flex-col gap-2 justify-end mt-6'>
              <button
                type='button'
                onClick={onConfirm}
                disabled={isLoading}
                className={`
                  px-4 py-2 text-xs w-full cursor-pointer font-medium text-white rounded-sm uppercase
                  focus:outline-none focus:ring-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${styles.confirmBtn}
                  ${isLoading ? 'cursor-wait' : ''}
                `}
              >
                {isLoading ? (
                  <div className='flex items-center gap-2 justify-center'>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    <span>Laddar...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>

              <button
                type='button'
                onClick={onCancel}
                disabled={isLoading}
                className='px-4 py-2 text-xs w-full cursor-pointer font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 uppercase'
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
