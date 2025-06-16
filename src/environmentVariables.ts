import { z } from "zod";
import { AppUrl } from "./modules/shared/domain/appUrl.js";
import { Email } from "./modules/shared/domain/email.js";
import { Phone } from "./modules/shared/domain/phone.js";
import { NonNegativeInteger } from "./modules/shared/domain/nonNegativeInteger.js";
import { AdminFirstName } from "./modules/admin/domain/adminFirstName.js";
import { AdminLastName } from "./modules/admin/domain/adminLastName.js";
import { validateCronExpression } from "cron";

/**
 * Handles a value that may throw an error, returning the value if successful,
 * or throwing a TypeError with a specified error message if an error occurs.
 * 
 * @description This function is useful for safely retrieving environment variables
 * or other values that may throw errors, ensuring that the error is handled gracefully
 * and providing a clear error message.
 * 
 * @param params The parameters for the function.
 * @param params.valueToReturn A function that returns the value to be handled.
 * @param params.errorMessage The error message to throw if an error occurs.
 * 
 * @returns The value returned by the `valueToReturn` function.
 * 
 * @throws {TypeError} If an error occurs while retrieving the value.
 * 
 * @template T The type of the value to be returned.
 * 
 * @example
 * const PORT = handleValueWithError({
 *   valueToReturn: () => new NonNegativeInteger(process.env.PORT as any).getValue(),
 *   errorMessage: "PORT must be a non-negative integer",
 * });
 * // This will return the PORT value if successful, or throw a TypeError with the specified message.
 */
function handleValueWithError<T>(params: {
  valueToReturn: () => T;
  errorMessage: string;
}): T {
  const { valueToReturn, errorMessage } = params;
  try {
    return valueToReturn();
  } catch {
    throw new TypeError(errorMessage);
  }
}

/**
 * Calculates a mathematical expression from a string input.
 * @description This function evaluates a mathematical expression provided as a string.
 * It uses the `eval` function to compute the result, but first checks if the input
 * contains only valid mathematical characters (digits, operators, parentheses, and spaces).
 * 
 * @param input The mathematical expression as a string.
 * @returns The result of the evaluated expression.
 * @throws {Error} If the input contains invalid characters or if the evaluation fails.
 * @example
 * const result = calculateMathInput("2 + 3 * (4 - 1)");
 * // This will return 11, which is the result of the expression.
 */
function calculateMathInput(input: string) {
  const regex = /^[\d+\-*/.()^ ]+$/;

  if (!regex.test(input)) {
    throw new Error(
      "Input must contain only digits, operators (+, -, *, /), parentheses, and spaces.",
    );
  }

  try {
    const resultado = eval(input);
    return resultado;
  } catch {
    throw new Error(
      "Error evaluating the mathematical expression. Ensure it is a valid expression.",
    );
  }
}

// * PORT
const PORT = handleValueWithError({
  errorMessage: "PORT must be a non-negative integer",
  valueToReturn: () =>
    new NonNegativeInteger(process.env.PORT as any).getValue(),
});

// * NODE_ENV
const serverEnvironmentOptions = {
  DEVELOPMENT: "DEVELOPMENT",
  PRODUCTION: "PRODUCTION",
  TEST: "TEST",
} as const;

const allowedServerEnvironments = new Set(
  Object.keys(serverEnvironmentOptions)
);

const environmentMode = process.env.ENVIRONMENT_MODE;
if (!environmentMode) throw new TypeError("ENVIRONMENT_MODE is required");
if (!allowedServerEnvironments.has(environmentMode as any)) {
  const allowedEnv = [...allowedServerEnvironments].join(" or ");
  throw new TypeError(`ENVIRONMENT_MODE must be ${allowedEnv}`);
}
const ENVIRONMENT_MODE =
  environmentMode as keyof typeof serverEnvironmentOptions;

// * IMAGE_STORAGE_ENGINE;
const imageStorageOptions = {
  DISK: "DISK",
  CLOUDINARY: "CLOUDINARY",
  FAKE: "FAKE",
} as const;

const allowedImageUploader = new Set(Object.keys(imageStorageOptions));

const imageStorageEngine = process.env.IMAGE_STORAGE_ENGINE;
if (!imageStorageEngine)
  throw new TypeError("IMAGE_STORAGE_ENGINE; is required");
if (!allowedImageUploader.has(imageStorageEngine as any)) {
  const allowedImgUploader = [...allowedImageUploader].join(" or ");
  throw new TypeError(`IMAGE_STORAGE_ENGINE; must be ${allowedImgUploader}`);
}
const IMAGE_STORAGE_ENGINE =
  imageStorageEngine as keyof typeof imageStorageOptions;

// * SERVER_BASE_URL
const SERVER_BASE_URL = handleValueWithError({
  valueToReturn: () =>
    new AppUrl(process.env.SERVER_BASE_URL as any).getValue(),
  errorMessage: "SERVER_BASE_URL must be a valid URL",
});

// * PAYMENT_TIMEOUT_SECONDS
const PAYMENT_TIMEOUT_SECONDS = handleValueWithError({
  valueToReturn: () =>
    new NonNegativeInteger(
      calculateMathInput(process.env.PAYMENT_TIMEOUT_SECONDS as any)
    ).getValue(),
  errorMessage:
    "PAYMENT_TIMEOUT_SECONDS must be a non-negative integer or a valid math expression",
});

// * COMMERCE_NAME
const commerceName = process.env.COMMERCE_NAME;
if (!commerceName) throw new TypeError("COMMERCE_NAME is required");
const commerceNameResult = z.string().min(1).max(100).safeParse(commerceName);
if (!commerceNameResult.success) throw new TypeError("Invalid COMMERCE_NAME");
const COMMERCE_NAME = commerceNameResult.data;

// * SUPPORT_EMAIL
const SUPPORT_EMAIL = handleValueWithError({
  valueToReturn: () => new Email(process.env.SUPPORT_EMAIL as any).getValue(),
  errorMessage: "SUPPORT_EMAIL must be a valid email",
});

// * WHATSAPP_SUPPORT_CONTACT
const WHATSAPP_SUPPORT_CONTACT = handleValueWithError({
  valueToReturn: () =>
    new Phone(process.env.WHATSAPP_SUPPORT_CONTACT as any).getValue(),
  errorMessage: "WHATSAPP_SUPPORT_CONTACT must be a valid phone number",
});

// * ACCESS_TOKEN_JWT_EXPIRES_SECONDS
const ACCESS_TOKEN_JWT_EXPIRES_SECONDS = handleValueWithError({
  valueToReturn: () =>
    new NonNegativeInteger(
      calculateMathInput(process.env.ACCESS_TOKEN_JWT_EXPIRES_SECONDS as any)
    ).getValue(),
  errorMessage:
    "ACCESS_TOKEN_JWT_EXPIRES_SECONDS must be a non-negative integer or a valid math expression",
});

// * REFRESH_TOKEN_JWT_EXPIRES_SECONDS
const REFRESH_TOKEN_JWT_EXPIRES_SECONDS = handleValueWithError({
  valueToReturn: () =>
    new NonNegativeInteger(
      calculateMathInput(process.env.REFRESH_TOKEN_JWT_EXPIRES_SECONDS as any)
    ).getValue(),
  errorMessage:
    "REFRESH_TOKEN_JWT_EXPIRES_SECONDS must be a non-negative integer or a valid math expression",
});

// * JWT_SECRET
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new TypeError("JWT_SECRET is required");
const jwtSecretResult = z.string().min(1).max(100).safeParse(jwtSecret);
if (!jwtSecretResult.success) throw new TypeError("Invalid JWT_SECRET");
const JWT_SECRET = jwtSecretResult.data;

// * INITIAL_SUPER_ADMIN_USER
const initialSuperAdminUser = {
  email: handleValueWithError({
    valueToReturn: () =>
      new Email(process.env.INITIAL_SUPER_ADMIN_USER_EMAIL as any).getValue(),
    errorMessage: "INITIAL_SUPER_ADMIN_USER_EMAIL must be a valid email",
  }),
  firstName: handleValueWithError({
    valueToReturn: () =>
      new AdminFirstName(
        process.env.INITIAL_SUPER_ADMIN_USER_FIRST_NAME as any
      ).getValue(),
    errorMessage: "INITIAL_SUPER_ADMIN_USER_FIRST_NAME must be a valid name",
  }),
  lastName: handleValueWithError({
    valueToReturn: () =>
      new AdminLastName(
        process.env.INITIAL_SUPER_ADMIN_USER_LAST_NAME as any
      ).getValue(),
    errorMessage: "INITIAL_SUPER_ADMIN_USER_LAST_NAME must be a valid name",
  }),
  phoneNumber: handleValueWithError({
    valueToReturn: () =>
      new Phone(
        process.env.INITIAL_SUPER_ADMIN_USER_PHONE_NUMBER as any
      ).getValue(),
    errorMessage:
      "INITIAL_SUPER_ADMIN_USER_PHONE_NUMBER must be a valid phone number",
  }),
} as const;

// * RELEASE_PRODUCT_STOCK_EVERY_CRON
const PRODUCT_STOCK_RELEASE_CRON_EXPRESSION = handleValueWithError({
  valueToReturn: () => {
    const cron = process.env.PRODUCT_STOCK_RELEASE_CRON_EXPRESSION as string;
    const validation = validateCronExpression(cron);
    if (!validation.valid) throw validation.error;
    return cron;
  },
  errorMessage:
    "PRODUCT_STOCK_RELEASE_CRON_EXPRESSION must be a valid cron expression",
});

// * Export
const isDevelopment = ENVIRONMENT_MODE === serverEnvironmentOptions.DEVELOPMENT;
const isProduction = ENVIRONMENT_MODE === serverEnvironmentOptions.PRODUCTION;
const isDiskImageUploader = IMAGE_STORAGE_ENGINE === imageStorageOptions.DISK;
const isCloudinaryImageUploader =
  IMAGE_STORAGE_ENGINE === imageStorageOptions.CLOUDINARY;

export {
  ENVIRONMENT_MODE,
  PORT,
  SERVER_BASE_URL,
  IMAGE_STORAGE_ENGINE,
  isDevelopment,
  isProduction,
  isDiskImageUploader,
  isCloudinaryImageUploader,
  imageStorageOptions,
  serverEnvironmentOptions,
  PAYMENT_TIMEOUT_SECONDS,
  COMMERCE_NAME,
  SUPPORT_EMAIL,
  WHATSAPP_SUPPORT_CONTACT,
  ACCESS_TOKEN_JWT_EXPIRES_SECONDS,
  REFRESH_TOKEN_JWT_EXPIRES_SECONDS,
  JWT_SECRET,
  initialSuperAdminUser,
  PRODUCT_STOCK_RELEASE_CRON_EXPRESSION,
};
