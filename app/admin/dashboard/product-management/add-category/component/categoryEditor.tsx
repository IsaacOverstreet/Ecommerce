import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getErrorMessage } from "@/lib/utils/error";
import { logger } from "@/lib/utils/logger";
import { slugify } from "@/lib/utils/slug";
import axios from "axios";

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
      const response = await axios.put(`/api/category/${categoryId}`, {
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
      const response = await axios.delete(`/api/category/${categoryId}`);
      if (response.status !== 200) {
        throw new Error("failed to delete");
      }

      await fetchCategory();
      setOpenPopUp2(false);
      toast.success("Category successfully deleted");
    } catch (error) {
      logger.error("Failed to delete", error);
      toast.error(getErrorMessage(error));
    }
  }
  return (
    <div>
      <div className="space-x-2">
        <Popover open={openPopUp} onOpenChange={setOpenPopUp}>
          <PopoverTrigger asChild>
            <button className="border border-solid h-[40px] w-[20%]">
              {" "}
              Edit
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-5">
              <Input
                className="w-[100%]"
                placeholder="Edit category"
                required
                value={editCategoryName}
                key={categoryId}
                onChange={(e) => setEditcategoryName(e.target.value)}
              />
              <div className="space-x-2 flex justify-center">
                <Button
                  className="cursor-pointer"
                  onClick={handleSave}
                  disabled={!editCategoryName || !editCategoryName.trim()}
                >
                  {isSaving ? "saving" : "save"}
                </Button>
                <Button className="cursor-pointer" onClick={handleCancel}>
                  cancel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Popover open={openPopUp2} onOpenChange={setOpenPopUp2}>
          <PopoverTrigger asChild>
            <button className="border border-solid h-[40px] w-[20%]">
              {" "}
              Delete
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-x-2 flex justify-center">
              <Button className="cursor-pointer" onClick={handleDelete}>
                yes
              </Button>
              <Button className="cursor-pointer" onClick={handleCancel}>
                cancel
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
