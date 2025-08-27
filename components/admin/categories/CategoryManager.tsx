import CategoryTable from '@/components/admin/categories/CategoryTable';
import {MainCategory} from '@/lib/validators';

type CategoryManagerProps = {
  categories: MainCategory[];
};

export default function CategoryManager({categories}: CategoryManagerProps) {
  return <CategoryTable categories={categories} />;
}
