import dynamic from "next/dynamic";
import { type Variants } from "../hooks/useVariants";
import { SetStateAction, Dispatch, Suspense, useState } from "react";
import { PulseLoader } from "react-spinners";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils/error";
import { useConfirmation } from "@/hooks/useConfirmation";
import { formatDate } from "@/lib/utils/formatDate";
const EditVariant = dynamic(() => import("./EditVariant"));

export interface VariantPreviewProp {
  variant: Variants;
  setVariantState: Dispatch<SetStateAction<Variants[]>>;
  fetchVariant: () => void;
}

export default function VariantPreview({
  variant,
  setVariantState,
  fetchVariant,
}: VariantPreviewProp) {
  const [openEdit, setOpenEdit] = useState(false);
  const { confirm, ConfirmationDialog } = useConfirmation();

  function VariantTypeDelete(variantTypeId: string) {
    confirm({
      message: "Are you sure you want to delete this variant?",
      onConfirm: async () => {
        try {
          if (!variantTypeId) {
            throw new Error("Item not found.");
          }
          const response = await axios.delete(
            `/api/variant/variant-types/${variantTypeId}`
          );
          const result = response.data;

          setVariantState((prev) => prev.filter((v) => v.id !== variantTypeId));
          toast.success(result.message);
        } catch (error) {
          logger.error("Failed to Delete value", error);
          toast.error(getErrorMessage(error));
        }
      },
    });
  }

  return (
    <div className="p-4">
      <ConfirmationDialog />
      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-md ">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Variant Details
          </h2>
          <button
            onClick={() => VariantTypeDelete(variant.id)}
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-700 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Details Section */}
        <div className="space-y-2">
          <div className="bg-gray-50 rounded-md px-3 py-2 hover:bg-gray-100 transition">
            <span className="block text-gray-500 text-sm font-medium">
              Name
            </span>
            <span className="block text-gray-900 text-base font-semibold">
              {variant.name}
            </span>
          </div>

          <div className="bg-gray-50 rounded-md px-3 py-2 hover:bg-gray-100 transition">
            <span className="block text-gray-500 text-sm font-medium">
              Description
            </span>
            <span className="block text-gray-900 text-base leading-relaxed">
              {variant.description || ""}
            </span>
          </div>
        </div>

        {/* Footer with Edit Button */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 transition"
            onClick={() => setOpenEdit(true)}
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 ">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3 border-b">Variant Value</th>
                <th className="px-4 py-3 border-b">Hex Code</th>
                <th className="px-4 py-3 border-b">Created At</th>
                <th className="px-4 py-3 border-b">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variant.values.map((value) => (
                <tr key={value.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{value.name}</td>
                  <td className="px-4 py-3">
                    {value.hexCode || "—"}
                    {variant.isColor && (
                      <div
                        style={{ backgroundColor: value.hexCode }}
                        className="w-8 h-8 rounded border border-gray-300"
                      ></div>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(variant.createdAt)}</td>
                  <td className="px-4 py-3">{formatDate(variant.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*EDIT VARIANT POPUP */}

      {openEdit && (
        <div>
          <Suspense fallback={<PulseLoader />}>
            <EditVariant
              open={openEdit}
              setOpen={setOpenEdit}
              variant={variant}
              onFetchVariant={fetchVariant}
              setVariantState={setVariantState}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
