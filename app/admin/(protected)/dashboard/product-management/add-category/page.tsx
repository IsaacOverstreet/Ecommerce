"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { columns } from "./component/column";
import { DataTable } from "./component/data-table";
import { useEffect, useState } from "react";
import { slugify } from "@/utils/slug";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { logger } from "@/utils/logger";
import { getErrorMessage } from "@/utils/error";
import { useCategories } from "./hooks/useCategory";

export default function NewCategory() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, fetchCategories } = useCategories();

  const router = useRouter();

  //Get all the categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = slugify(name);

      const response = await axios.post("/api/admin/category", { name, slug });

      if (!response.data) {
        throw new Error("failed to create category");
      }
      toast.success("Category created successfully!");
      setName("");
      router.refresh();
    } catch (error) {
      logger.error("failed to create category", error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
      await fetchCategories();
    }
  }
  return (
    <div className="mt-10 w-full h-dvh">
      <h1 className=" text-center font-bold">Add new category</h1>
      <div className="flex   space-y-5">
        <Input
          className="w-[70%]"
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button
          className="cursor-pointer"
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
        >
          {isSubmitting ? "Adding..." : "Add Category"}
        </Button>
      </div>
      <div>
        <h1 className=" text-center">Categories</h1>
        <div className="container mx-auto py-10">
          <DataTable
            fetchCategory={fetchCategories}
            columns={columns}
            data={categories}
          />
        </div>
      </div>
    </div>
  );
}
