import { UploadCloud } from "lucide-react";

export function UploadIcon({message}: {message?: string}) {
  return (
    <div className='flex flex-col items-center justify-center w-full p-2.5 border-2 text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors duration-200 border-dashed rounded-lg'>
      <UploadCloud size={32} strokeWidth={1.25} />
      {message && <p className='text-[11px] mt-1 uppercase font-medium text-gray-600'>{message}</p>}
    </div>
  );
}