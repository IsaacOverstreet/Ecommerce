export function appError(status: number, message: string) {
  return {
    status,
    message,
    isAppError: true, // helps the handler know it's a custom error
  };
}
