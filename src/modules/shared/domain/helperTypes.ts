export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type BuildTuple<
  T,
  LENGTH extends number,
  R extends T[] = []
> = R["length"] extends LENGTH ? R : BuildTuple<T, LENGTH, [...R, T]>;

export type AtLeast<T, LENGTH extends number> = [
  ...BuildTuple<T, LENGTH>,
  ...T[]
];

export type MinMaxArray<T, MIN extends number, MAX extends number> = T[] & {
  length: NumericRange<MIN, MAX>;
};

export type RangeFromZeroToN<
  N extends number,
  R extends number[] = []
> = R["length"] extends N
  ? R[number] | N
  : RangeFromZeroToN<N, [...R, R["length"]]>;

export type NumericRange<MIN extends number, MAX extends number> =
  | Exclude<RangeFromZeroToN<MAX>, RangeFromZeroToN<MIN>>
  | MIN
  | MAX;

export type SmartOmit<T extends object, K extends keyof T> = Omit<T, K>;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
