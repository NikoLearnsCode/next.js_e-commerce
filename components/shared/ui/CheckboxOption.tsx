'use client';

export function CheckboxOption({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onChange();
    }
  };

  return (
    <label htmlFor={id} className='flex items-center space-x-2 cursor-pointer'>
      <div className='relative'>
        <input
          type='checkbox'
          id={id}
          checked={checked}
          tabIndex={-1}
          onChange={onChange}
          className='sr-only'
        />
        <div
          className={`w-5 h-5 border ${checked ? 'border-black' : 'border-gray-300'} flex items-center justify-center`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role='checkbox'
          aria-checked={checked}
        >
          {checked && (
            <svg
              className='w-4 h-4 text-black'
              viewBox='0 0 20 20'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>
      </div>
      <span className='text-xs uppercase  cursor-pointer'>{label}</span>
    </label>
  );
}
