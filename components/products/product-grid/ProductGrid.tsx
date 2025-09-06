'use client';

import {Product} from '@/lib/types/db';
import Cards from '@/components/shared/cards/ProductCard';

type ProductGridProps = {
  products: Product[];
  title?: string;
  emptyMessage?: string;
  className?: string;
};

export default function ProductGrid({
  products,

  className = '',
}: ProductGridProps) {
  return (
    <div className={className}>
      <div className='full grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid gap-[1px]'>
        {products.map((product) => (
          <Cards key={product.id} product={product} priorityLoading={true} />
        ))}
      </div>
    </div>
  );
}
