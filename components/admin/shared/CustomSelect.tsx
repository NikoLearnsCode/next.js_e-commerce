import React, {useState, useRef, useEffect, forwardRef} from 'react';
import {ChevronDown} from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
}

const CustomSelect = forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({options, placeholder = 'Välj...', className, ...props}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(props.value || '');
    const selectRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);

    const selectedOption = options.find((opt) => opt.value == selectedValue);

    useEffect(() => {
      if (props.value !== undefined) {
        setSelectedValue(props.value);
      }
    }, [props.value]);

    // Stäng när man klickar utanför
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (value: string | number) => {
      setSelectedValue(value);
      setIsOpen(false);

      // Trigga onChange på den dolda select:en
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = String(value);
        const event = new Event('change', {bubbles: true});
        hiddenSelectRef.current.dispatchEvent(event);
      }

      // Trigga props.onChange om det finns
      if (props.onChange) {
        const syntheticEvent = {
          target: {
            name: props.name,
            value: String(value),
          },
        } as React.ChangeEvent<HTMLSelectElement>;
        props.onChange(syntheticEvent);
      }
    };

    return (
      <div className='relative'>
        {/* Dold select för react-hook-form */}
        <select
          {...props}
          ref={(node) => {
            hiddenSelectRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className='sr-only'
          tabIndex={-1}
          value={selectedValue}
          onChange={() => {}} // Hanteras av custom UI
        >
          <option value=''>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom UI */}
        <div
          ref={selectRef}
          className={`${className} cursor-pointer group relative  text-[15px] ${props.disabled ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className='flex border  border-gray-400/70  rounded-xs items-center justify-between h-12 px-3 group-hover:border-gray-500'>
            <span
              className={`${selectedOption ? 'text-black' : 'text-gray-600'} group-hover:border-black `}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform group-hover:border-gray-500 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>

          {isOpen && (
            <div className='absolute  max-h-64 overflow-y-auto top-full left-0 right-0 z-50 -mt-1 border-t-0 bg-white border border-gray-400/70 group-hover:border-gray-500   shadow-sm'>
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-3 cursor-pointer hover:bg-gray-50 ${
                    option.value == selectedValue
                      ? 'bg-gray-100 font-medium'
                      : ''
                  }`}
                  onClick={() => handleOptionClick(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;
