import type {Product} from '@/lib/types/db';

export type SortField = 'id' | 'price' | 'name';

export type SortOrder = 'asc' | 'desc';

export type SortParams = {
  sort: SortField;
  order: SortOrder;
};

export type PaymentInfo = {
  method: 'card' | 'swish' | 'klarna';
};

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
  isNewOnly?: boolean;
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

export type ActionResult = {
  success: boolean;
  data?: any;
  error?: string;
};
