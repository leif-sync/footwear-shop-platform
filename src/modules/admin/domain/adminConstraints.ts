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
