import type {Product} from '@/lib/validators';

export type SortField = 'id' | 'price' | 'name';

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sort: SortField;
  order: SortOrder;
}

export interface PaymentInfo {
  method: 'card' | 'swish' | 'klarna';
}

export type Params = {
  limit?: number;
  query?: string;
  order?: 'asc' | 'desc';
  sort?: SortField;
  lastId?: string | null;
  lastValue?: number | string | null; 
  category?: string | null;
  gender?: string | null;
  color?: string[];
  sizes?: string[];
  metadata?: boolean;
};

export type Result = {
  products: Product[];
  hasMore: boolean;
  totalCount: number;
  metadata?: {
    availableColors: string[];
    availableSizes: string[];
    availableCategories: string[];
  };
};
