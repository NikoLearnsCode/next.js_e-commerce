interface NoResultsProps {
  message: string;
}

export default function NoResults({message}: NoResultsProps) {
  return <div className='text-center items-center justify-center h-full text-gray-500'>{message}</div>;
}