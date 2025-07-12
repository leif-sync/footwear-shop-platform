import { z } from "zod";
import { AppUrl } from "./modules/shared/domain/appUrl.js";
import { EmailAddress } from "./modules/shared/domain/emailAddress.js";
import { Phone } from "./modules/shared/domain/phone.js";
import { NonNegativeInteger } from "./modules/shared/domain/nonNegativeInteger.js";
import { AdminFirstName } from "./modules/admin/domain/adminFirstName.js";
import { AdminLastName } from "./modules/admin/domain/adminLastName.js";
import { validateCronExpression } from "cron";
import { EmailSenderOptions } from "./modules/shared/infrastructure/emailSenderProviders.js";
import { ImageStorageOptions } from "./modules/shared/infrastructure/imageStorageProviderFactory.js";
import { RepositoryEngineOptions } from "./modules/shared/infrastructure/repositoryProvider.js";
import { LoggerProviderOptions } from "./modules/shared/infrastructure/loggerProvider.js";
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
      "Input must contain only digits, operators (+, -, *, /), parentheses, and spaces."
    );
  }

  try {
    const resultado = eval(input);
    return resultado;
  } catch {
    throw new Error(
      "Error evaluating the mathematical expression. Ensure it is a valid expression."
    );
  }
}

/**
 * Reads an environment variable and validates it against a native enum.
 * @description This function retrieves the value of an environment variable,
 * validates it against a provided native enum, and returns the parsed value.
 * If the value is not valid, it throws a TypeError with a descriptive message.
 *
 * @param params The parameters for the function.
 * @param params.envVariableName The name of the environment variable to read.
 * @param params.nativeEnum The native enum to validate against.
 *
 * @returns The parsed value from the environment variable if valid.
 *
 * @throws {TypeError} If the environment variable value is not valid according to the enum.
 *
 * @template T The type of the native enum.
 */
function readFromEnvVariablesWithEnum<T extends z.EnumLike>(params: {
  envVariableName: string;
  nativeEnum: T;
}) {
  const { envVariableName, nativeEnum } = params;
  const envValue = process.env[envVariableName];

  const enumSchema = z.nativeEnum(nativeEnum);
  const parsedValue = enumSchema.safeParse(envValue);
  if (!parsedValue.success) {
    const allowedValues = Object.values(nativeEnum).join(" or ");
    throw new TypeError(
      `${envVariableName} must be ${allowedValues}, received: ${envValue}`
    );
  }
  return parsedValue.data;
}

/*
#####################
### SERVER CONFIG ###
#####################
*/

// * PORT
const portName = "PORT";
export const PORT = handleValueWithError({
  errorMessage: `${portName} must be a non-negative integer`,
  valueToReturn: () =>
    new NonNegativeInteger(process.env[portName] as any).getValue(),
});

// * ENVIRONMENT_MODE
export enum ServerEnvironmentOptions {
  DEVELOPMENT = "DEVELOPMENT",
  PRODUCTION = "PRODUCTION",
  APP_TEST = "APP_TEST",
}

export const ENVIRONMENT_MODE = readFromEnvVariablesWithEnum({
  envVariableName: "ENVIRONMENT_MODE",
  nativeEnum: ServerEnvironmentOptions,
});

// * IMAGE_STORAGE_ENGINE;

export const IMAGE_STORAGE_ENGINE = readFromEnvVariablesWithEnum({
  envVariableName: "IMAGE_STORAGE_ENGINE",
  nativeEnum: ImageStorageOptions,
});

// * SERVER_BASE_URL
const serverBaseUrlName = "SERVER_BASE_URL";
export const SERVER_BASE_URL = handleValueWithError({
  valueToReturn: () => new AppUrl(process.env[serverBaseUrlName] as any),
  errorMessage: `${serverBaseUrlName} must be a valid URL`,
});

// * EMAIL_SENDER
export const EMAIL_SENDER = readFromEnvVariablesWithEnum({
  envVariableName: "EMAIL_SENDER",
  nativeEnum: EmailSenderOptions,
});

// * REPOSITORY_ENGINE

export const REPOSITORY_ENGINE = readFromEnvVariablesWithEnum({
  envVariableName: "REPOSITORY_ENGINE",
  nativeEnum: RepositoryEngineOptions,
});

// * LOGGER_PROVIDER

export const LOGGER_PROVIDER = readFromEnvVariablesWithEnum({
  envVariableName: "LOGGER_PROVIDER",
  nativeEnum: LoggerProviderOptions,
});

/*
######################
### PAYMENT CONFIG ###
######################
*/

// * PAYMENT_TIMEOUT_SECONDS
const paymentTimeoutSecondsName = "PAYMENT_TIMEOUT_SECONDS";
export const PAYMENT_TIMEOUT_SECONDS = handleValueWithError({
  valueToReturn: () =>
    new NonNegativeInteger(
      calculateMathInput(process.env[paymentTimeoutSecondsName] as any)
    ).getValue(),
  errorMessage: `${paymentTimeoutSecondsName} must be a non-negative integer or a valid math expression`,
});

/*
########################
### RELEASE PRODUCTS ###
########################
*/

// * PRODUCT_STOCK_RELEASE_CRON_EXPRESSION
const productStockReleaseCronExpressionName =
  "PRODUCT_STOCK_RELEASE_CRON_EXPRESSION";
export const PRODUCT_STOCK_RELEASE_CRON_EXPRESSION = handleValueWithError({
  valueToReturn: () => {
    const cron = process.env[productStockReleaseCronExpressionName] as string;
    const validation = validateCronExpression(cron);
    if (!validation.valid) throw validation.error;
    return cron;
  },
  errorMessage: `${productStockReleaseCronExpressionName} must be a valid cron expression`,
});

/*
#######################
### COMMERCE CONFIG ###
#######################
*/

// * COMMERCE_NAME
const commerceNameVariable = "COMMERCE_NAME";
export const COMMERCE_NAME = handleValueWithError({
  valueToReturn: () =>
    z.string().min(1).max(100).parse(process.env[commerceNameVariable]),
  errorMessage: `${commerceNameVariable} must be a valid string between 1 and 100 characters`,
});

// * SUPPORT_EMAIL
const supportEmailName = "SUPPORT_EMAIL";
export const SUPPORT_EMAIL = handleValueWithError({
  valueToReturn: () =>
    new EmailAddress(process.env[supportEmailName] as any).getValue(),
  errorMessage: `${supportEmailName} must be a valid email`,
});

// * WHATSAPP_SUPPORT_CONTACT
const WHATSAPP_SUPPORT_CONTACT_NAME = "WHATSAPP_SUPPORT_CONTACT";
export const WHATSAPP_SUPPORT_CONTACT = handleValueWithError({
  valueToReturn: () =>
    new Phone(process.env[WHATSAPP_SUPPORT_CONTACT_NAME] as any).getValue(),
  errorMessage: `${WHATSAPP_SUPPORT_CONTACT_NAME} must be a valid phone number`,
});

/*
###################
### AUTH CONFIG ###
###################
*/

// * ACCESS_TOKEN_JWT_EXPIRES_SECONDS
const ACCESS_TOKEN_JWT_EXPIRES_SECONDS_NAME =
  "ACCESS_TOKEN_JWT_EXPIRES_SECONDS";
export const ACCESS_TOKEN_JWT_EXPIRES_SECONDS = handleValueWithError({
  valueToReturn: () =>
    new NonNegativeInteger(
      calculateMathInput(
        process.env[ACCESS_TOKEN_JWT_EXPIRES_SECONDS_NAME] as any
      )
    ).getValue(),
  errorMessage: `${ACCESS_TOKEN_JWT_EXPIRES_SECONDS_NAME} must be a non-negative integer or a valid math expression`,
});

// * REFRESH_TOKEN_JWT_EXPIRES_SECONDS
const REFRESH_TOKEN_JWT_EXPIRES_SECONDS_NAME =
  "REFRESH_TOKEN_JWT_EXPIRES_SECONDS";
export const REFRESH_TOKEN_JWT_EXPIRES_SECONDS = handleValueWithError({
  valueToReturn: () =>
    new NonNegativeInteger(
      calculateMathInput(
        process.env[REFRESH_TOKEN_JWT_EXPIRES_SECONDS_NAME] as any
      )
    ).getValue(),
  errorMessage: `${REFRESH_TOKEN_JWT_EXPIRES_SECONDS_NAME} must be a non-negative integer or a valid math expression`,
});

// * JWT_SECRET
const jwtSecretName = "JWT_SECRET";
export const JWT_SECRET = handleValueWithError({
  valueToReturn: () =>
    z.string().min(1).max(100).parse(process.env[jwtSecretName]),
  errorMessage: `${jwtSecretName} must be a valid string between 1 and 100 characters`,
});

/*
#######################################
### INITIAL SUPER ADMIN USER CONFIG ###
#######################################
*/

// * INITIAL_SUPER_ADMIN_USER
export const initialSuperAdminUser = {
  email: handleValueWithError({
    valueToReturn: () =>
      new EmailAddress(
        process.env.INITIAL_SUPER_ADMIN_USER_EMAIL as any
      ).getValue(),
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

/*
#############################
### EXPORTS AND UTILITIES ###
#############################
*/
export const isDevelopment =
  ENVIRONMENT_MODE === ServerEnvironmentOptions.DEVELOPMENT;
export const isProduction =
  ENVIRONMENT_MODE === ServerEnvironmentOptions.PRODUCTION;
export const isDiskImageUploader =
  IMAGE_STORAGE_ENGINE === ImageStorageOptions.DISK;
export const isAppTest = ENVIRONMENT_MODE === ServerEnvironmentOptions.APP_TEST;
