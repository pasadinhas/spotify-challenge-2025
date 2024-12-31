export function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === "development";
}

export const IS_DEV_ENV = isDevelopmentEnvironment();
