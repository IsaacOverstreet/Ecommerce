import { logger } from "@/lib/utils/logger";
import axios from "axios";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("/api/category");

      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
      logger.error("Failed to fetch categories", error);
    }
  }, []);

  return { categories, fetchCategories };
}
