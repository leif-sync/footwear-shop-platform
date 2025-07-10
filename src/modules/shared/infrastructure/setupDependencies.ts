import {
  EMAIL_SENDER,
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
export const emailSender = EmailSenderProviders[EMAIL_SENDER];
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
  },
  utilityServices: {
    imageUploader: imageStorageEngine,
    emailSender,
  },
  transactionManagers: {
    orderTransactionManager,
  },
});
