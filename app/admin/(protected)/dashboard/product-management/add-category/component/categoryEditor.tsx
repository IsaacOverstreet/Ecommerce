import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getErrorMessage } from "@/utils/error";
import { logger } from "@/utils/logger";
import { slugify } from "@/utils/slug";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type CategoryEditorProps = {
  initialName: string;
  categoryId: string;
  fetchCategory: () => Promise<void>;
};

export default function CategoryEditor({
  initialName,
  categoryId,
  fetchCategory,
}: CategoryEditorProps) {
  const [editCategoryName, setEditcategoryName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [openPopUp2, setOpenPopUp2] = useState(false);

  useEffect(() => {
    setEditcategoryName(initialName);
  }, [initialName]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const slug = slugify(editCategoryName);
      const response = await axios.put(`/api/admin/category/${categoryId}`, {
        name: editCategoryName,
        slug,
      });
      if (!response.data) {
        throw new Error("failed to update category");
      }
      toast.success("Category successfully updated");
      setEditcategoryName("");
    } catch (error) {
      logger.error("failed to update category", error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
      setOpenPopUp(false);
      await fetchCategory();
    }
  }

  function handleCancel() {
    setEditcategoryName(initialName);
    setOpenPopUp(false);
    setOpenPopUp2(false);
  }

  async function handleDelete() {
    try {
      const response = await axios.delete(`/api/admin/category/${categoryId}`);
      if (response.status !== 200) {
        throw new Error("failed to delete");
      }

      await fetchCategory();
      setOpenPopUp2(false);
      toast.success("Category successfully deleted");
    } catch (error) {
      setOpenPopUp2(false);
      logger.error("Failed to delete", error);
      toast.error(getErrorMessage(error));
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-center w-full">
        {/* Edit Button Popover */}
        <Popover open={openPopUp} onOpenChange={setOpenPopUp}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition w-full sm:w-auto">
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[90vw] sm:w-[300px] p-4 rounded-lg shadow-lg bg-white">
            <div className="space-y-4">
              <Input
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Edit category"
                required
                value={editCategoryName}
                key={categoryId}
                onChange={(e) => setEditcategoryName(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={handleSave}
                  disabled={!editCategoryName || !editCategoryName.trim()}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Delete Button Popover */}
        <Popover open={openPopUp2} onOpenChange={setOpenPopUp2}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-700 transition w-full sm:w-auto">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[90vw] sm:w-[250px] p-4 rounded-lg shadow-lg bg-white">
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                onClick={handleDelete}
              >
                Yes
              </Button>
              <Button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
