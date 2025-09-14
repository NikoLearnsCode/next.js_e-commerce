import {categories} from '@/drizzle/db/schema';

export interface NavLink {
  title: string;
  href: string;
  displayOrder: number;
  children?: NavLink[];
  isFolder?: boolean;
}

export type Category = typeof categories.$inferSelect;

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

export interface MainCategoryWithImages {
  id: number;
  name: string;
  slug: string;
  desktopImage?: string | null;
  mobileImage?: string | null;
  displayOrder: number;
}
