export const productConstraint = {
  variants: {
    maxVariants: 10,
    minVariants: 1,
  },
  name: {
    minProductNameLength: 3,
    maxProductNameLength: 100,
  },
  description: {
    minProductDescriptionLength: 10,
    maxProductDescriptionLength: 200,
  },
  category: {
    minCategoryLength: 3,
    maxCategoryLength: 50,
  },
} as const;
