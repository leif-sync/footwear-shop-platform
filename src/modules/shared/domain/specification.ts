// Definición base usando tipos funcionales
type FilterCondition<T> = (item: T) => boolean;

export class Specification<T> {
  private readonly evaluate: FilterCondition<T>;

  constructor(evaluate: FilterCondition<T>) {
    this.evaluate = evaluate;
  }

  isSatisfiedBy = (item: T): boolean => {
    const result = this.evaluate(item);
    return result;
  };

  and(other: Specification<T>): Specification<T> {
    return new Specification(
      (item: T) => this.evaluate(item) && other.isSatisfiedBy(item)
    );
  }

  or(other: Specification<T>): Specification<T> {
    return new Specification(
      (item: T) => this.evaluate(item) || other.isSatisfiedBy(item)
    );
  }

  not(): Specification<T> {
    return new Specification((item: T) => !this.isSatisfiedBy(item));
  }

  filter(items: T[]): T[] {
    return items.filter(this.isSatisfiedBy);
  }
}
