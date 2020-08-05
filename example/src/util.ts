function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}

function notEmpty<T>(x: T | null | undefined): T {
  if (!x) {
    throw new Error("Non empty value expected");
  }

  return x;
}

export { assertNever, notEmpty };
