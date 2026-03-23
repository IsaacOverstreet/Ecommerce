import axios from "axios";
import { Category } from "../../../../../../types/categoryTypes";

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await axios.get<Category[]>("/api/admin/category");
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch categories");
  }
}
