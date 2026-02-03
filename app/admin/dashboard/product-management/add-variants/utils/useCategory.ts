import { logger } from "@/utils/logger";
import axios from "axios";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { Category } from "@/app/types/categoryTypes";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("/api/admin/category");

      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
      logger.error("Failed to fetch categories", error);
    }
  }, []);

  return { categories, fetchCategories };
}
