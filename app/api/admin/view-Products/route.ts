import { withErrorHandler } from "@/lib/errorHandlers/apiErrors";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(async (req: NextRequest) => {});
