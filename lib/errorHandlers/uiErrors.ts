// utils/handleApiError.ts
import { ZodError } from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { logger } from "@/utils/logger";

export function handleUiError(error: unknown): string {
  if (error instanceof ZodError) {
    console.log("zod", error);
    const firstError = error.issues[0];
    const message = firstError?.message || "Validation failed";
    console.log(message);
    toast.error(message);
    return message;
  }
  console.log("zodbscnns", error);

  if (axios.isAxiosError(error)) {
    console.log("🚀 ~ handleUiError ~ error:", error);
    const status = error.response?.status;
    const data = error.response?.data;
    let message = data?.error || error.message || "Request failed";

    switch (status) {
      case 401:
        message = "Unauthorized. Please log in.";
        break;
      case 403:
        message = "Forbidden";
        break;
      case 404:
        message = "Resource not found";
        break;
      case 422:
        message = "Validation error";
        break;
      case 429:
        message = "Too many requests";
        break;
      case 500:
        message = "Server error";
        break;
      case 503:
        message = "Service unavailable";
        break;
    }

    toast.error(message);
    console.log(message);
    logger.error(message);
    return message;
  }

  if (error instanceof Error) {
    const message = error.message || "Something went wrong";
    console.log(message);
    toast.error(message);
    return message;
  }

  const message = "An unexpected error occurred";
  toast.error(message);
  console.error("Unknown error:", error);
  return message;
}
