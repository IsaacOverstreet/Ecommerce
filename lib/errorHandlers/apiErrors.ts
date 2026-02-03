// lib/withErrorHandler.ts
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
type AppErrorType = {
  isAppError: true;
  status: number;
  message: string;
};

type Handler = (req: NextRequest) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      // Zod validation errors
      if (error instanceof ZodError) {
        console.log(error);
        const firstError = error.issues[0];
        const message = firstError?.message || "Validation failed";
        console.log("🚀 ~ return ~ message:", message);
        return NextResponse.json({ error: message }, { status: 400 });
      }

      // AppError (our custom errors)
      if (typeof error === "object" && error != null && "isAppError" in error) {
        const e = error as AppErrorType;
        return NextResponse.json({ error: e.message }, { status: e.status });
      }

      //Prisma known errors (like unique constraint violation)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Duplicate value detected. Please try again." },
          { status: 400 }
        );
      }

      // Unknown errors
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
