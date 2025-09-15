import {Metadata} from 'next';
import Newsletter from '@/components/shared/Newsletter';
import Homepage from '@/components/Homepage';
import {getMainCategoriesForHomepage} from '@/actions/admin/admin.categories.actions';

export const metadata: Metadata = {
  title: 'E-commerce Next.js 2025',
  description: 'E-commerce Next.js 2025',
};

export default async function Page() {
  const result = await getMainCategoriesForHomepage();

  return (
    <div className='w-full h-full'>
      <Homepage mainCategories={result} />
      <Newsletter />
    </div>
  );
}
