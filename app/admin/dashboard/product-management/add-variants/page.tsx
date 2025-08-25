// import { z } from "zod";
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/utils/error";
import { logger } from "@/lib/utils/logger";
import axios from "axios";
import { variantSchema } from "@/components/shared-component/variant-schema";
import { Suspense, useState } from "react";
import { toast } from "react-toastify";
import { z, ZodError } from "zod";
import { useVariants } from "./hooks/useVariants";
import dynamic from "next/dynamic";
import { PulseLoader } from "react-spinners";
const VariantPreview = dynamic(() => import("./components/variantsPreview"));

type Variant = z.infer<typeof variantSchema>;

export default function VariantType() {
  const [form, setForm] = useState<Variant>({
    name: "",
    description: "",
    values: [],
    colorName: "",
    hexCode: "",
    isColor: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setError] = useState<Record<string, string>>({});
  const [newValue, setValue] = useState<string>("");
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const { variantState, fetchVariants, loading, setVariantState } =
    useVariants();
  const [showVariants, setShowVariants] = useState(false);

  function viewVarinats() {
    setShowVariants(true);

    fetchVariants();
  }

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

  //////////////////////////// Handle submit////////////////////
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (form.isColor && Object.keys(colorMap).length > 0) {
        const colorArray = Object.entries(colorMap).map(
          ([colorName, hexCode]) => ({
            colorName,
            hexCode,
          })
        );
        const colorPayLoad = colorArray.map((color) => ({
          ...form,
          ...color,
        }));

        const colorValidData = z.array(variantSchema).safeParse(colorPayLoad);
       

        if (!colorValidData.success) {
         

          setError(parseZodError(colorValidData.error));
          setIsSubmitting(false);
          return;
        }

        const response = await axios.post("/api/variant", colorValidData.data);
        

        if (!response.data) {
          throw new Error("failed to create variant");
        }
        toast.success("variant sucessfully created");
        setForm({
          name: "",
          description: "",
          values: [],
          colorName: "",
          hexCode: "",
          isColor: false,
        });
        setColorMap({});
        setError({});
        return;
      } else {
        const validData = variantSchema.safeParse(form);
        if (!validData.success) {
         

          setError(parseZodError(validData.error));
          setIsSubmitting(false);
          return;
        }

        const response = await axios.post("/api/variant", validData.data);
        

        if (!response.data) {
          throw new Error("failed to create variant");
        }
        toast.success("variant sucessfully created");
        setForm({
          name: "",
          description: "",
          values: [],
          colorName: "",
          hexCode: "",
          isColor: false,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errorMessages[err.path[0] as string] = err.message;
          }
        });
        setError(errorMessages);
      } else {
        toast.error(getErrorMessage(error));
        logger.error("failed to create variant", error);
      }
    } finally {
      setIsSubmitting(false);
      fetchVariants();
    }
  }

  ///////////////ADD VALUE FOR PREVIEW//////////////////
  function addButton() {
    setError({ values: "" });

    if (newValue.trim() && !form.values.includes(newValue.trim())) {
      setForm({
        ...form,
        values: [...form.values, newValue.trim()],
      });
      setValue("");
    } else {
      setError({ values: "Values exists" });
    }
  }
  //  //////////REMOVE VALUE//////////////
  function removeItem(itemToRemove: number) {
    setForm({
      ...form,
      values: form.values.filter((item, index) => index !== itemToRemove),
    });
    setError({ values: "" });
  }

  ////////////ADD COLOR AND HEXCODE FOR PREVIEW/////////////////////////
  function addColor() {
    setError({});
    try {
      const validData = variantSchema.parse(form);
      const { hexCode, colorName } = validData;
      if (!hexCode || !colorName || !form.isColor) return;
      setColorMap((prev) => ({ ...prev, [colorName]: hexCode }));
      setForm({ ...form, colorName: "", hexCode: "" });
    } catch (error) {
      if (error instanceof ZodError) return setError(parseZodError(error));
    }
  }

  ////////DELETE COLOR////////
  function deleteColor(colorName: string) {
    setColorMap((prev) => {
      const current = { ...prev };
      delete current[colorName];
      return current;
    });
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 mt-9">
        <h1 className="text-2xl font-semibold text-gray-800">
          Create New Variant Type
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              placeholder="Optional description"
              className="w-full"
            />
            {errors.description && (
              <span className="text-sm text-red-600">{errors.description}</span>
            )}
          </div>

          {/* CHECKBOX */}
          <div className="flex items-center gap-2">
            <Input
              type="checkbox"
              checked={form.isColor}
              onChange={(e) => setForm({ ...form, isColor: e.target.checked })}
              id="isColor"
            />
            <Label htmlFor="isColor" className="text-sm text-gray-700">
              This is a color variant
            </Label>
          </div>

          {/* CONDITIONAL VALUES */}
          <div className="space-y-3">
            <Label
              htmlFor="color"
              className="text-sm font-medium text-gray-600"
            >
              {form.isColor
                ? "Color Name (e.g. Red)"
                : "Values (e.g. Small). Add one variant per line"}
            </Label>

            {form.isColor ? (
              <>
                {/* Color Name Input */}
                <Textarea
                  value={form.colorName}
                  onChange={(e) =>
                    setForm({ ...form, colorName: e.target.value })
                  }
                  placeholder="Red"
                  className="w-full"
                />
                {errors.colorName && (
                  <span className="text-sm text-red-600">
                    {errors.colorName}
                  </span>
                )}

                {/* Hexcode Input */}
                <Label
                  htmlFor="hex"
                  className="text-sm font-medium text-gray-600"
                >
                  Hex Code (e.g. #FF0000)
                </Label>

                <Textarea
                  value={form.hexCode}
                  onChange={(e) =>
                    setForm({ ...form, hexCode: e.target.value })
                  }
                  placeholder="#FF0000"
                  className="w-full"
                />
                {errors.hexCode && (
                  <span className="text-sm text-red-600">{errors.hexCode}</span>
                )}

                {/* Add Button */}
                <button
                  type="button"
                  onClick={addColor}
                  disabled={!form.hexCode?.trim() || !form.colorName?.trim()}
                  className="mt-2 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Color
                </button>

                {/* Color List */}
                <div className="space-y-2 mt-4">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Color List
                  </h2>
                  <ul className="space-y-2">
                    {Object.entries(colorMap).map(([colorName, hexCode]) => (
                      <li
                        key={colorName}
                        className="flex items-center gap-4 rounded border p-2"
                      >
                        <span className="font-medium">{colorName}:</span>
                        <div
                          className="w-5 h-5 rounded-full border"
                          style={{ backgroundColor: hexCode }}
                        />
                        <span className="text-sm text-gray-500">{hexCode}</span>
                        <button
                          onClick={() => deleteColor(colorName)}
                          type="button"
                          className="ml-auto text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Enter one color per line in format: <code>ColorName</code> and{" "}
                  <code>#HEXCODE</code>
                </p>
              </>
            ) : (
              <>
                {/* Values Input */}
                <Textarea
                  value={newValue}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Small"
                  className="w-full"
                />
                {errors.values && (
                  <span className="text-sm text-red-600">{errors.values}</span>
                )}

                {/* Add Button */}
                <button
                  type="button"
                  onClick={addButton}
                  disabled={!newValue}
                  className="mt-2 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Add
                </button>

                {/* Value List */}
                <ul className="flex flex-wrap gap-2 mt-4">
                  {form.values.map((list, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 border px-3 py-1 rounded text-sm"
                    >
                      <span>{list}</span>
                      <button
                        onClick={() => removeItem(i)}
                        type="button"
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Creating..." : "Create Variant"}
            </Button>
          </div>
        </form>

        <hr className="mt-6 border-t" />
      </div>

      {/* PREVIEW EXISTING VARIANTS  */}

      <div className="flex justify-center mt-5">
        <button
          disabled={loading}
          type="button"
          onClick={viewVarinats}
          className="inline-flex items-center  px-5 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          {loading ? "loading" : "view variants"}
        </button>
      </div>

      {showVariants && (
        <div>
          <Suspense
            fallback={
              <div className="flex mt-5 items-center justify-center w-full h-full">
                <PulseLoader />
              </div>
            }
          >
            {variantState.map((variant) => (
              <VariantPreview
                variant={variant}
                key={variant.id}
                setVariantState={setVariantState}
                fetchVariant={fetchVariants}
              />
            ))}
          </Suspense>
        </div>
      )}
    </div>
  );
}
