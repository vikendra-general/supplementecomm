import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { Category } from '@/types';

/**
 * Calculate the actual product count for each category based on the products array
 */
export function getCategoriesWithDynamicCounts(): Category[] {
  return categories.map(category => {
    const productCount = products.filter(product => 
      product.category.toLowerCase() === category.name.toLowerCase()
    ).length;
    
    return {
      ...category,
      productCount
    };
  });
}

/**
 * Get product count for a specific category
 */
export function getProductCountByCategory(categoryName: string): number {
  return products.filter(product => 
    product.category.toLowerCase() === categoryName.toLowerCase()
  ).length;
}