export const variantConstraint = {
  image: {
    maxImages: 8,
    minImages: 2,
    maxFileSizeBytes: 2 * 1024 * 1024,
  },
  tag: {
    minTags: 1,
    maxTags: 15,
    minTagLength: 3,
    maxTagLength: 50,
  },
  imageAlt: {
    minImageAltLength: 1,
    maxImageAltLength: 50,
  },
  detail: {
    minDetails: 1,
    maxDetails: 20,
    title: {
      minTitleLength: 3,
      maxTitleLength: 50,
    },
    content: {
      minContentLength: 3,
      maxContentLength: 150,
    },
  },
  size: {
    minSizes: 1,
    maxSizes: 10,
    maxStock: 100,
  },
} as const;
