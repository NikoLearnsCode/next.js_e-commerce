// app/admin/categories/page.tsx

'use server';

import {getMainCategoriesWithSub} from '@/actions/admin';
import CategoryManager from '@/components/admin/categories/CategoryManager';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {redirect} from 'next/navigation';
import NoResults from '@/components/admin/shared/NoResults';
import {Metadata} from 'next';
// Importera den nya, centrala UI-typen


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kategorier',
  };
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 1) {
    return redirect('/denied');
  }

  const rawCategories = await getMainCategoriesWithSub();



  if (!rawCategories || rawCategories.length === 0) {
    return <NoResults message='Inga kategorier hittades.' />;
  }

  return <CategoryManager categories={rawCategories} />;
}
