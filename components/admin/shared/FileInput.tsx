// src/components/ui/FileInput.tsx

import React, {useRef, type ChangeEvent, type ReactNode} from 'react';

// Definiera props-typerna för komponenten
interface FileInputProps {
  id: string;
  label?: string;
  multiple?: boolean;
  accept?: string;
  onFilesSelected: (files: File[]) => void;
  children: ReactNode; // För att kunna skicka in en egen design för knappen/ytan
  className?: string;
  }

const FileInput: React.FC<FileInputProps> = ({
  id,
  label = '',
  multiple = false,
  accept,
  onFilesSelected,
  children,
  className = '',
}) => {
  // En ref för att kunna komma åt den gömda input-taggen
  const inputRef = useRef<HTMLInputElement>(null);

  // Funktion som triggas när användaren valt filer
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Konvertera FileList till en vanlig array och skicka upp till föräldern
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
    }
  };

  // Funktion för att programmatiskt klicka på den gömda input-taggen
  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className='block uppercase font-syne ml-2 text-base text-black font-medium mb-4'
      >
        {label}
      </label>

      {/* Denna div är den synliga, klickbara ytan */}
      <div onClick={handleClick} className='cursor-pointer'>
        {children}
      </div>

      {/* Den faktiska fil-inputen, som är helt gömd */}
      <input
        id={id}
        ref={inputRef}
        type='file'
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className='hidden' // Tailwind-klass för att gömma elementet
      />
    </div>
  );
};

export default FileInput;
