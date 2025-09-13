// app/admin/categories/page.tsx

'use server';

import CategoryManager from '@/components/admin/categories/CategoryManager';
// import {getServerSession} from 'next-auth';
// import {authOptions} from '@/lib/auth';
// import {redirect} from 'next/navigation';

import {Metadata} from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kategorier',
  };
}

export default async function CategoriesPage() {
  // const session = await getServerSession(authOptions);

  // if (session?.user.role !== 1) {
  //   return redirect('/denied');
  // }

  return <CategoryManager />;
}
