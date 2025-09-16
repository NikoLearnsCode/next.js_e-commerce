import {categories} from '@/drizzle/db/schema';

export interface NavLink {
  title: string;
  href: string | null;
  displayOrder: number;
  children?: NavLink[];
  isFolder?: boolean;
}

export type Category = typeof categories.$inferSelect;

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

