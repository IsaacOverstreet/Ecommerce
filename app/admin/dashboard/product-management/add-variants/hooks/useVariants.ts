import { logger } from "@/utils/logger";
import axios from "axios";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { Variants } from "@/app/types/variantTypes";

export function useVariants() {
  const [variantState, setVariantState] = useState<Variants[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/variant");
      if (!response.data) {
        throw new Error("failed to fetch variants");
      }
      const result = response.data;
      console.log("🚀 ~ fetchVariants ~ result:", result);
      setVariantState(result);
    } catch (error) {
      logger.error("failed to fetch Variants", error);
      toast.error("failed to fetch variants");
    } finally {
      setLoading(false);
    }
  }, []);
  return { variantState, fetchVariants, loading, setVariantState };
}
