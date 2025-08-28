import CategoryTable from '@/components/admin/categories/CategoryTable';
import {MainCategoryWithSub} from '@/lib/validators';

type CategoryManagerProps = {
  categories: MainCategoryWithSub[];
  
};

export default function CategoryManager({categories}: CategoryManagerProps) {
  return <CategoryTable categories={categories} />;
}
