import CategoryTable from '@/components/admin/categories/CategoryTable';
import {MainCategoryWithSub} from '@/lib/validators';
import AdminHeader from '../shared/AdminHeader';
type CategoryManagerProps = {
  categories: MainCategoryWithSub[];
};

export default function CategoryManager({categories}: CategoryManagerProps) {
  const count = categories.reduce(
    (a, c) => a + (c.subCategories?.length || 0),

    0
  );

  return (
    <div>
      <AdminHeader title='Kategorihantering' count={count} buttonShow />
      <CategoryTable categories={categories} />
    </div>
  );
}
