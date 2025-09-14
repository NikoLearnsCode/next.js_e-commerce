import {Metadata} from 'next';
import Newsletter from '@/components/shared/Newsletter';
import Homepage from '@/components/Homepage';
import {getNavigationData} from '@/actions/navigation.actions';
import {getMainCategoriesForHomepage} from '@/actions/admin/admin.categories.actions';

export const metadata: Metadata = {
  title: 'E-commerce Next.js 2025',
  description: 'E-commerce Next.js 2025',
};

export default async function Page() {
  const [navLinks, mainCategories] = await Promise.all([
    getNavigationData(),
    getMainCategoriesForHomepage(),
  ]);

  return (
    <div className='w-full h-full'>
      <Homepage navLinks={navLinks} mainCategories={mainCategories} />
      <Newsletter />
    </div>
  );
}
