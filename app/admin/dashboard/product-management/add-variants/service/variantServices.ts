import { Variants } from "@/app/types/variantTypes";
import axios from "axios";

export async function fetchVariants(): Promise<Variants[]> {
  try {
    const response = await axios.get<Variants[]>("/api/admin/variant");
    return response.data;
  } catch (error) {
    console.log("🚀 ~ fetchVariants ~ error:", error);
    throw new Error("failed to fetch variants");
  }
}
