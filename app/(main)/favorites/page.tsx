import FavoritesPage from '@/components/favorites/FavoritesPage';
import {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Favoriter',
  description: 'Dina sparade favoriter',
};

export default function Favorites() {
  return (
    <div className='w-full flex justify-center max-w-[2000px] mx-auto py-8 pl-0 lg:pl-2'>
      <div className='w-full'>
        <FavoritesPage />
      </div>
    </div>
  );
}
