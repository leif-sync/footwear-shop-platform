import {
  EMAIL_PROVIDER_FROM,
  EMAIL_SENDER,
  EMAIL_SENDER_API_KEY,
  IMAGE_STORAGE_ENGINE,
  LOGGER_PROVIDER,
  REPOSITORY_ENGINE,
  SERVER_BASE_URL,
} from "../../../environmentVariables.js";
import { setupServiceContainer } from "./services/serviceContainer.js";
import { EmailSenderProviders } from "./emailSenderProviders.js";
import { ImageStorageProviderFactory } from "./imageStorageProviderFactory.js";
import { LoggerProvider } from "./loggerProvider.js";
import { RepositoryProvider } from "./repositoryProvider.js";

const repositoryContainer = RepositoryProvider[REPOSITORY_ENGINE];

export const emailSender = EmailSenderProviders.getEmailSender({
  provider: EMAIL_SENDER,
  from: EMAIL_PROVIDER_FROM,
  apiKey: EMAIL_SENDER_API_KEY,
});

export const logger = LoggerProvider[LOGGER_PROVIDER];

export const imageStorageEngine =
  await ImageStorageProviderFactory.initializeImageStorage({
    imageStorageEngine: IMAGE_STORAGE_ENGINE,
    serverBaseUrl: SERVER_BASE_URL,
  });

export const {
  adminRepository,
  categoryRepository,
  detailRepository,
  loginCodeRepository,
  orderRepository,
  paymentTransactionRepository,
  productRepository,
  refreshTokenRepository,
  sizeRepository,
  tagRepository,
  orderTransactionManager,
  emailRepository,
} = repositoryContainer;

export const ServiceContainer = setupServiceContainer({
  repositories: {
    productRepository,
    tagRepository,
    sizeRepository,
    categoryRepository,
    detailRepository,
    orderRepository,
    paymentTransactionRepository,
    adminRepository,
    loginCodeRepository,
    refreshTokenRepository,
    emailRepository,
  },
  utilityServices: {
    imageUploader: imageStorageEngine,
    emailSender,
  },
  transactionManagers: {
    orderTransactionManager,
  },
});
