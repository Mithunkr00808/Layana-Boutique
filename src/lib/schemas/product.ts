import { z } from 'zod';
import { PRODUCT_CATEGORY_OPTIONS } from '@/lib/catalog/categories';

const validCategories = PRODUCT_CATEGORY_OPTIONS.map((c) => c.value);

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required').refine((val) => /[\d.,]+/.test(val), {
    message: 'Price must be a valid number format',
  }),
  discountPrice: z.string().optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  category: z.string().refine((val) => validCategories.includes(val), {
    message: 'Invalid collection category selected',
  }),
  sustainability: z.string().max(300).optional(),
  sizes: z.string().optional(),
  options: z.string().max(200).optional(),
  enableSizes: z.string().optional(),
});
