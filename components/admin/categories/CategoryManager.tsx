import CategoryTable from '@/components/admin/categories/CategoryTable';
import {CategoryWithChildren} from '@/lib/types/category';
import AdminHeader from '../shared/AdminHeader';
type CategoryManagerProps = {
  categories: CategoryWithChildren[];
};

export default function CategoryManager({categories}: CategoryManagerProps) {
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
