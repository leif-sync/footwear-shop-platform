export abstract class TagValidationService {
  abstract checkTagUsage(params: { tagName: string }): Promise<boolean>;
}
