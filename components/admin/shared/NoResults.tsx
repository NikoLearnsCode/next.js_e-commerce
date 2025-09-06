interface NoResultsProps {
  message: string;
}

export default function NoResults({message}: NoResultsProps) {
  return <div className='text-center pb-20 items-center justify-center min-h-screen text-gray-500'>{message}</div>;
}