export type UseCase<I, O, C = undefined> = {
  execute(input: I, context: C): Promise<O>;
};
