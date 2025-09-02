'use client';
import CategoryTable from '@/components/admin/categories/CategoryTable';
import AdminHeader from '../shared/AdminHeader';
import {useAdmin} from '@/context/AdminContextProvider';

export default function CategoryManager() {
  const {categories} = useAdmin();
  const count = categories.reduce((a, c) => a + (c.children?.length || 0), 0);

  return (
    <div>
      <AdminHeader
        title='Kategorihantering'
        count={count}
        buttonShow
        formType='category'
      />
      <CategoryTable categories={categories} />
    </div>
  );
}
