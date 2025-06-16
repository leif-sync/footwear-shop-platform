
/**
 * Admin constraints for validation.
 * These constraints define the minimum and maximum lengths for various admin fields.
 */
export const adminConstraints = {
  firstName: {
    minLength: 2,
    maxLength: 50,
  },
  lastName: {
    minLength: 2,
    maxLength: 50,
  },
  permission: {
    minLength: 2,
    maxLength: 50,
  }
} as const;
