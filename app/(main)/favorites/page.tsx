import FavoritesPage from '@/components/favorites/FavoritesPage';
import {Metadata} from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dina favoriter',
    description: 'Dina sparade favoriter',
  };
}

export default async function Favorites() {
  return (
    <div className='w-full flex justify-center max-w-[2000px] mx-auto py-8 '>
      <div className='w-full'>
        <FavoritesPage />
      </div>
    </div>
  );
}
