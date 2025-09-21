'use server';

import CategoryManager from '@/components/admin/categories/CategoryManager';

import {Metadata} from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kategorier',
  };
}

export default async function CategoriesPage() {
  return <CategoryManager />;
}
