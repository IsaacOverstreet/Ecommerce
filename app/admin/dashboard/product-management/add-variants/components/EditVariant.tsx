"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Edit3, Trash2, Save, Palette, Plus, Shredder } from "lucide-react";
import type { Variants } from "../hooks/useVariants";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { ZodError } from "zod";
import axios from "axios";
import { logger } from "@/lib/utils/logger";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/lib/utils/error";
import {
  EditingValue,
  EditingValueSchema,
  NewInput,
  NewInputSchema,
  TitleEdit,
  TitleEditSchema,
} from "@/lib/utils/sharedUtils/validators";
import { useConfirmation } from "@/hooks/useConfirmation";

interface EditVariantProp {
  open: boolean;
  setOpen: (open: boolean) => void;
  variant: Variants;
  setVariantState: Dispatch<SetStateAction<Variants[]>>;
  onFetchVariant: () => void;
}

////////////COMPONENT FUNCTION////////////////////////
export default function EditVariant({
  open,
  setOpen,
  variant,
  setVariantState,
  onFetchVariant,
}: EditVariantProp) {
  const [titleEdit, setTitleEdit] = useState<TitleEdit>({
    id: variant.id,
    name: variant.name,
    description: variant.description,
  });
  const [editingValue, setEditingValue] = useState<EditingValue | null>(null);
  const [error, setError] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addNewValue, setAddNewValue] = useState<NewInput>({
    optionName: "",
    hexCode: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { ConfirmationDialog, confirm } = useConfirmation();

  useEffect(() => {
    setTitleEdit(variant);
  }, [variant]);

  function parseZodError(error: ZodError): Record<string, string> {
    const errorMessages: Record<string, string> = {};
    error.errors.forEach((err) => {
      if (err.path.length) {
        const field = err.path[0] as string;
        errorMessages[field] = err.message;
      }
    });
    return errorMessages;
  }

  /////////CLOSE OVERALL EDIT VARIANT MODAL//////////////////
  function overrallSaveButton(variantTypeId: string) {
    confirm({
      message: "Are you sure you want to update this record?",
      onConfirm: async () => {
        try {
          const validate = TitleEditSchema.safeParse(titleEdit);

          if (!validate.success) {
            setError(parseZodError(validate.error));
            return;
          }

          await axios.patch(
            `/api/variant/variant-types/${variantTypeId}`,
            validate.data
          );

          toast.success("update successful!");
          setOpen(false);
          onFetchVariant();
        } catch (error) {
          toast.error(getErrorMessage(error));
        }
      },
    });
  }

  // /////////////ADD NEW VALUE//////////////////////////
  function saveAddNew(variantTypeId: string) {
    /////////Yes or NO Confirmation//////////////////
    confirm({
      message: "Confirm save: Your changes will be applied.",

      /////////Yes////////////
      onConfirm: async () => {
        if (isSaving) return; // Prevent clicks while saving
        setIsSaving(true);

        try {
          const input = NewInputSchema.safeParse(addNewValue);

          if (!input.success) {
            setError(parseZodError(input.error));
          }
          const payload = {
            ...input.data,
            variantTypeId,
          };

          const response = await axios.post("/api/variant/", payload);
          const result = response.data;

          setVariantState((prev) =>
            prev.map((v) =>
              v.id === variant.id
                ? {
                    ...v,
                    values: [...v.values, result.data],
                  }
                : v
            )
          );

          toast.success("Variant updated successfully!");
          setAddNewValue({
            optionName: "",
            hexCode: "",
          });
          setError({});
        } catch (error) {
          logger.error("failed to edit values", error);

          toast.error(getErrorMessage(error));
        } finally {
          setIsSaving(false); // Re-enable button
        }
      },
      ////////////NO/////////////////
      onCancel: () => {},
    });
  }

  ////////////SAVE PATCH EDIT TO DB///////////////
  function handleEditSave(variantId: string) {
    confirm({
      message: "Are you sure you want to update this record?",
      onConfirm: async () => {
        setError({});
        if (isSaving) return; // Prevent clicks while saving
        setIsSaving(true);
        try {
          const inputs = EditingValueSchema.safeParse(editingValue);

          if (!inputs.success) {
            setError(parseZodError(inputs.error));
            return;
          }

          await axios.patch(`/api/variant/${variantId}`, inputs);

          setVariantState((prev) =>
            prev.map((v) =>
              v.id === variant.id
                ? {
                    ...v,
                    values: v.values.map((val) =>
                      val.id === editingValue?.id
                        ? {
                            ...val,
                            ...inputs.data,
                            name: inputs.data.name ?? val.name,
                          }
                        : val
                    ),
                  }
                : v
            )
          );

          toast.success("Variant updated successfully!");
          setEditingValue(null);
        } catch (error) {
          logger.error("failed to edit values", error);

          toast.error(getErrorMessage(error));
        } finally {
          setIsSaving(false);
        }
      },
    });
  }

  /////////HANDLE EDIT ICON/////////////////
  function handleEditValue(value: EditingValue) {
    setEditingValue({ ...value });
  }

  function handleCancelEdit() {
    setEditingValue(null);
  }

  //////////HANDLE DELETE ITEM//////////
  function handleDeleteItem(value: EditingValue) {
    confirm({
      message:
        "Are you sure you want to delete this item? This action cannot be undone.",

      onConfirm: async () => {
        if (isDeleting) return;
        setIsDeleting(value.id);
        try {
          const { id, name } = value;

          if (!id) {
            throw new Error("Invalid Id");
          }

          await axios.delete(`/api/variant/${id}`, {
            data: { name },
          });

          setVariantState((prev) =>
            prev.map((v) =>
              v.id === variant.id
                ? {
                    ...v,
                    values: v.values.filter((val) => val.id !== value.id),
                  }
                : v
            )
          );

          toast.success("Delete Successful!!!");
        } catch (error) {
          logger.error("Failed to Delete value", error);
          toast.error(getErrorMessage(error));
        } finally {
          setIsDeleting(null);
        }
      },
    });
  }

  return (
    <div>
      <ConfirmationDialog />
      <Dialog
        open={open}
        onOpenChange={(setOpen) => {
          if (!setOpen) return;
        }}
      >
        <DialogContent className="border border-red-800 h-[90%]  flex justify-center items-center ">
          <DialogTitle className="sr-only">Edit Variant</DialogTitle>
          <DialogDescription className="sr-only">
            Make changes to this variant value above.
          </DialogDescription>
          <div className="p-0 max-w-full w-full md:max-w-4xl  h-[95%]">
            <div className=" flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 h-[100%] rounded-lg ">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Edit Variant: {variant.name}
                  </h1>
                </div>

                {/* Variant Details Form */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name
                    </label>
                    {error.name && (
                      <span className="text-sm text-red-600">{error.name}</span>
                    )}
                    <input
                      type="text"
                      id="name"
                      value={titleEdit.name ?? ""}
                      onChange={(e) =>
                        setTitleEdit((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter variant name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={titleEdit?.description ?? ""}
                      onChange={(e) =>
                        setTitleEdit((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter variant description"
                    />
                  </div>
                </div>
              </div>

              {/* Color Values Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Color Values
                </h2>

                {/* Colors Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
                      <div className="col-span-4">Variant value</div>
                      <div className="col-span-3" hidden={!variant.isColor}>
                        Hex Code
                      </div>
                      <div className="col-span-2">Preview</div>
                      <div className="col-span-3 text-right">Actions</div>
                    </div>
                  </div>
                </div>

                {/*  VARIANT AND HEXCODE EDITING HERE */}
                <div className="divide-y divide-gray-200">
                  {variant.values.map((stateVariant) => (
                    <div
                      key={stateVariant.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {editingValue && editingValue.id === stateVariant.id ? (
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <div className="flex gap-2">
                              {error.name && (
                                <span className="text-sm text-red-600">
                                  {error.name}
                                </span>
                              )}

                              <input
                                type="text"
                                value={editingValue.name || ""}
                                onChange={(e) =>
                                  setEditingValue({
                                    ...editingValue,
                                    name: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="col-span-3">
                            {error.hexCode && (
                              <span className="text-sm text-red-600">
                                {error.hexCode}
                              </span>
                            )}
                            <input
                              hidden={!variant.isColor}
                              type="text"
                              value={editingValue.hexCode || ""}
                              onChange={(e) =>
                                setEditingValue({
                                  ...editingValue,
                                  hexCode: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                          </div>

                          <div className="col-span-2">
                            <div
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{
                                backgroundColor:
                                  editingValue.hexCode ?? undefined,
                              }}
                            ></div>
                          </div>

                          <div className="col-span-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditSave(variant.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Save"
                              >
                                {isSaving ? (
                                  <Save className="w-4 h-4" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 text-gray-400 hover:bg-gray-50 rounded transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={stateVariant.id}
                          className="grid grid-cols-12 gap-4 items-center"
                        >
                          <div className="col-span-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {stateVariant.name}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <span className="font-mono text-sm text-gray-600">
                              {stateVariant.hexCode}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <div
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{
                                backgroundColor: stateVariant.hexCode,
                              }}
                            ></div>
                          </div>
                          <div className="col-span-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditValue(stateVariant)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(stateVariant)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                {isDeleting === stateVariant.id ? (
                                  <Shredder className="w-4 h-4" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Color Section */}

                <div className="mt-6">
                  {showAddForm ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Add New Value
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Value
                          </label>
                          <input
                            type="text"
                            value={addNewValue.optionName}
                            onChange={(e) =>
                              setAddNewValue({
                                ...addNewValue,
                                optionName: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="value"
                          />
                        </div>
                        <div>
                          <label
                            hidden={!variant.isColor}
                            className="block text-xs font-medium text-gray-700 mb-1"
                          >
                            Hex Code
                          </label>
                          {error.hexCode && (
                            <span className="text-sm text-red-600">
                              {error.hexCode}
                            </span>
                          )}
                          <input
                            hidden={!variant.isColor}
                            type="text"
                            placeholder="#ff0000"
                            value={addNewValue.hexCode}
                            onChange={(e) =>
                              setAddNewValue({
                                ...addNewValue,
                                hexCode: e.target.value,
                              })
                            }
                            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <div
                            style={{ backgroundColor: addNewValue.hexCode }}
                            className="w-8 h-8 rounded border border-gray-300"
                          ></div>
                        </div>

                        <div className="flex items-end gap-2">
                          <button
                            disabled={!addNewValue.optionName}
                            onClick={() => saveAddNew(variant.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            {isSaving ? "Saving..." : "Add"}
                          </button>
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-300 hover:border-blue-400"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-medium">Add New variant</span>
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => overrallSaveButton(variant.id)}
                    className="px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
