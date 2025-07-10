import { RepositoryContainer } from "./repositoryContainer.js";
import { setupInMemoryRepositories } from "./setupInMemoryRepositories.js";
import { setupPostgreSqlRepositories } from "./setupPostgreSqlRepositories.js";

export enum RepositoryEngineOptions {
  IN_MEMORY = "IN_MEMORY",
  POSTGRESQL = "POSTGRESQL",
}

export const RepositoryProvider: Record<
  RepositoryEngineOptions,
  RepositoryContainer
> = {
  [RepositoryEngineOptions.IN_MEMORY]: setupInMemoryRepositories(),
  [RepositoryEngineOptions.POSTGRESQL]: setupPostgreSqlRepositories(),
};
