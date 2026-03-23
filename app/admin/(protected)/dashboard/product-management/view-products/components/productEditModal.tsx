"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Plus,
  Tag,
  Upload,
} from "lucide-react";
// import { updateProduct, getCategories } from "../lib/products.service";
import { v4 as uuidv4 } from "uuid";
import { getCategories, updateProduct } from "../service/viewProductService";
import {
  Product,
  ProductCategory,
  ProductImage,
} from "@/app/types/productListTypes";
import {
  ProductVariantType,
  type ProductType,
} from "@/lib/validators/add-product-schema";
import Image from "next/image";
import { Category } from "@/app/types/categoryTypes";
import {
  generateProductSKU,
  generateVariantSKU,
} from "../../add-product/utils/generateSKU";
import { formatNumber } from "@/utils/formatPrice";
import { fetchVariants } from "../../add-variants/service/variantServices";
import { Variants } from "../../add-variants/utils/variantTypes";
import { nanoid } from "nanoid";
import { useConfirmation } from "@/hooks/useConfirmation";
import SuccessCard from "@/components/shared-component/sucessCard";
import { Loading } from "@/components/shared-component/loading";
import { toast } from "react-toastify";
import { handleUiError } from "@/lib/errorHandlers/uiErrors";
import { publishEditedProduct } from "../service/publishEditedProducts";
import { EditProductType } from "@/lib/validators/edit-product-schema";
import { logger } from "@/utils/logger";

interface ProductEditModalProps {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}

export type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  quantity: number;
  variantTypeId: string;
  values: string[];
};

interface EditProductImage {
  id: string; // Existing images have DB id; new images may not yet
  file: File | null; // Only new images will have a File
  previewUrl: string;
  isPrimary: boolean;
  url: string | null; // Existing image URL
  altText?: string;
  publicId: string | null; // Cloudinary public_id
  order: number;
}

export function ProductEditModal({
  product,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const [formData, setFormData] = useState<ProductType>({
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.description,
    tag: product.tag || [],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    quantity: product.quantity,
    trackQuantity: product.trackQuantity,
    isAvailableForPurchase: product.isAvailableForPurchase,
    active: product.active,
    weight: product.weight,
    length: product.length,
    width: product.width,
    height: product.height,
    urlHandle: product.urlHandle,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
  });

  const [newTag, setNewTag] = useState("");
  const [editVariants, setEditVariants] = useState<ProductVariant[]>(
    product.variants.map((item) => ({
      ...item,
      price: item.price ?? 0,
      variantTypeId: "",
      values: item.values.map((v) => v.variantValueId),
    }))
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<EditProductImage[]>(
    product.images.map((img) => ({
      id: img.id,
      file: null,
      previewUrl: img.url, // preview for existing image
      isPrimary: img.isPrimary,
      url: img.url,
      altText: img.altText ?? "",
      publicId: img.publicId ?? null,
      order: img.order ?? 0,
    }))
  );
  const [deletePublicId, setDeletePublicId] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product.categories.map((cat) => cat.categoryId)
  );
  const [variants, setVariant] = useState<Variants[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    basic: true,
    pricing: true,
    inventory: true,
    variants: false,
    images: false,
    categories: false,
    dimensions: false,
    seo: false,
  });

  const { ConfirmationDialog, confirm } = useConfirmation();
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  useEffect(() => {
    loadCategories();
    async function loadVariant() {
      const data = await fetchVariants();
      setVariant(data);
    }

    loadVariant();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  //ONCHANGE IMAGE
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);

    if (!e.target.files) return;
    const selectedFiles: File[] = Array.from(e.target.files);

    // max of 4 images
    if (images.length + selectedFiles.length > 8) {
      alert("You can only upload a maximum of 8 images");
      return;
    }

    const newImages: EditProductImage[] = selectedFiles.map((file, index) => ({
      id: nanoid(), // temp id for React key
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: false,
      url: null,
      publicId: null,
      altText: "",
      order: images.length + index, // assign display order
    }));

    setImages((prev) => [...prev, ...newImages]); // append to state
  };

  const handleImageChooseButton = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (image: EditProductImage) => {
    const id = image.publicId;
    console.log("🚀 ~ handleRemoveImage ~ id:", id);
    if (id !== null) {
      setDeletePublicId((prev) => [...prev, id]);
    }

    setImages((prev) => prev.filter((img) => img.id != image.id));
  };

  const handlePrimaryImageSelection = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id ? true : false,
      }))
    );
  };

  const variantMap = useMemo(() => {
    const map: Record<string, Variants> = {};
    variants.forEach((v) => (map[v.id] = v));
    return map;
  }, [variants]);

  function toggleSection(section: string) {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  const addVariantGroup = () => {
    const newGroup: ProductVariant = {
      id: uuidv4(),
      price: 0,
      quantity: 0,
      sku: "",
      variantTypeId: "",
      values: [],
    };
    setEditVariants((prev) => [...prev, newGroup]);
  };

  const handleVariantChange = (
    groupId: string,
    field: keyof ProductVariant,
    value: string
  ) => {
    setEditVariants((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        if (field === "values") {
          return {
            ...group,
            values: [...group.values, value],
          };
        } else return { ...group, [field]: value };
      })
    );
  };

  const handleGenerateVariantSku = (
    productName: string,
    variantValuesIds: string[],
    groupId: string
  ) => {
    const valueName = variantValuesIds
      .map(
        (id) =>
          variants.flatMap((v) => v.values).find((val) => val.id === id)?.name
      )
      .filter((name): name is string => Boolean(name));

    console.log("valueName", valueName);

    const sku = generateVariantSKU(productName, valueName);
    console.log("🚀 ~ exactGroup ~ sku:", sku);

    setEditVariants((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, sku: sku } : group
      )
    );
  };

  const removeVariant = (groupId: string) => {
    setEditVariants((prev) => prev.filter((val) => val.id !== groupId));
  };

  const removeSelectedVariantValue = (groupId: string, valueId: string) => {
    setEditVariants((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, values: group.values.filter((id) => id !== valueId) }
          : group
      )
    );
  };

  function handleChange(field: keyof ProductType, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    handleChange("name", name);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleChange("slug", generateSlug(name));
    }
    if (
      !formData.urlHandle ||
      formData.urlHandle === formData.name.toLowerCase().replace(/\s+/g, "-")
    ) {
      handleChange("urlHandle", generateSlug(name));
    }
    if (!formData.metaTitle || formData.metaTitle === formData.name) {
      handleChange("metaTitle", name);
    }
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const currentTags = prev.tag || [];

      if (currentTags.includes(trimmed)) return prev;

      return {
        ...prev,
        tag: [...currentTags, trimmed],
      };
    });

    setNewTag("");
  };

  const handleGenerateProductSku = (productName: string) => {
    const SKU = generateProductSKU(productName);
    console.log("🚀 ~ handleGenerateSKU ~ SKU:", SKU);
    setFormData((prev) => {
      return { ...prev, sku: SKU };
    });
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tag: prev.tag?.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    confirm({
      message: "Are you sure you want to save?",

      onConfirm: async () => {
        try {
          const productID = product.id;
          console.log("🚀 ~ onConfirm: ~ productID:", productID);
          setSaving(true);
          setError(null); // reset previous error
          console.log("🚀 ~ onConfirm: ~ payload:");

          const payload = {
            formData,
            images,
            selectedCategories,
            editVariants,
            deletePublicId,
          };
          console.log("🚀 ~ onConfirm: ~ payload:", payload);

          const res = await publishEditedProduct(payload, productID);
          setSaving(false);
          setShowSuccessCard(true);
          setSuccessMessage(res.message);
          onSave(); /////LOOK into here too
          cleanupBlobs();

          console.log("🚀 Response:", res);
        } catch (err) {
          logger.error(err);
          setSaving(false);
        }
      },
    });
  }

  const handleCancel = () => {
    confirm({
      message: "Are you sure you want to cancel? Unsaved changes will be lost.",
      onConfirm: () => {
        cleanupBlobs(); // Revoke all blob URLs
        onClose(); // Close the modal
      },
    });
  };

  const cleanupBlobs = () => {
    images.forEach(
      (img) => img.previewUrl && URL.revokeObjectURL(img.previewUrl)
    );
    setImages([]);
  };

  const closeSuccessCard = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <ConfirmationDialog />
      {showSuccessCard && (
        <SuccessCard message={successMessage} onClose={closeSuccessCard} />
      )}
      {/* ProgressBar */}
      {saving && <Loading />}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 bg-white">
          {error && (
            <div className="px-6 pt-6">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Edit Product
            </h2>

            <button
              onClick={handleCancel}
              className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            <Section
              title="Basic Information"
              expanded={expandedSections.basic}
              onToggle={() => toggleSection("basic")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* SKU */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    SKU <span className="text-red-500">*</span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />

                    <button
                      disabled={!formData.name}
                      type="button"
                      onClick={() => handleGenerateProductSku(formData.name)}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    disabled={!formData.name}
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>

                  {formData.tag !== undefined && formData.tag.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tag.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                        >
                          {tag}
                          <div
                            onClick={() => removeTag(tag)}
                            className="cursor-pointer text-blue-500 hover:text-blue-700 transition"
                          >
                            <X className="w-3 h-3" />
                          </div>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />

                    <button
                      disabled={!formData.name}
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Pricing"
              expanded={expandedSections.pricing}
              onToggle={() => toggleSection("pricing")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Price <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      #
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                {/* Compare at Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Compare at Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      #
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onWheel={(e) => e.currentTarget.blur()}
                      value={formData.compareAtPrice}
                      onChange={(e) =>
                        handleChange("compareAtPrice", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {formData.compareAtPrice &&
                  Number(formData.compareAtPrice) > Number(formData.price) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Sale Price Active
                      </h3>
                      <p className="text-green-700 text-sm mb-3">
                        Customers will see the compare at price crossed out with
                        your sale price highlighted.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="line-through text-gray-500">
                          #{formData.compareAtPrice}
                        </span>
                        <span className="font-semibold text-green-600">
                          #{formData.price}
                        </span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {Math.round(
                            ((formData.compareAtPrice - (formData.price || 0)) /
                              formData.compareAtPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </Section>

            <Section
              title="Inventory"
              expanded={expandedSections.inventory}
              onToggle={() => toggleSection("inventory")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Settings */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">
                      Track Quantity
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.trackQuantity}
                      onChange={(e) =>
                        handleChange("trackQuantity", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">
                      Available for Purchase
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.isAvailableForPurchase}
                      onChange={(e) =>
                        handleChange("isAvailableForPurchase", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">
                      Active
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => handleChange("active", e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </Section>

            <Section
              title="Variants"
              expanded={expandedSections.variants}
              onToggle={() => toggleSection("variants")}
            >
              <div>
                {editVariants.length === 0 ? (
                  <div className="text-center py-14 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No variants yet
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Add variant groups like Size, Color, or Material to create
                      product options
                    </p>
                    <button
                      onClick={addVariantGroup}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200"
                    >
                      Add First Variant Group
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={addVariantGroup}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200"
                      >
                        Add New Variant
                      </button>
                    </div>

                    {editVariants.map((group) => {
                      const selectedVariant = variantMap[group.variantTypeId];

                      return (
                        <div
                          key={group.id}
                          className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6"
                        >
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeVariant(group.id)}
                            className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Variant Type */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Variant Type *
                            </label>
                            <select
                              value={group.variantTypeId}
                              onChange={(e) =>
                                handleVariantChange(
                                  group.id,
                                  "variantTypeId",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                              <option value="">Select variant type</option>
                              {variants?.map((variant) => (
                                <option value={variant.id} key={variant.id}>
                                  {variant.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Value */}
                          {selectedVariant && (
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Value *
                              </label>
                              <select
                                onChange={(e) =>
                                  handleVariantChange(
                                    group.id,
                                    "values",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              >
                                <option value="">Select a value</option>
                                {selectedVariant?.values
                                  ?.filter((v) => !group.values.includes(v.id))
                                  .map((val) => (
                                    <option value={val.id} key={val.id}>
                                      {val.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {/* Price + Quantity Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Price *
                              </label>
                              <input
                                type="number"
                                value={group.price ? group.price : ""}
                                onChange={(e) =>
                                  handleVariantChange(
                                    group.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="0.00"
                                step="0.01"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Quantity *
                              </label>
                              <input
                                type="number"
                                value={group.quantity || ""}
                                onChange={(e) =>
                                  handleVariantChange(
                                    group.id,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Qty"
                              />
                            </div>
                          </div>

                          {/* SKU */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              SKU *
                            </label>

                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={group.sku}
                                onChange={(e) =>
                                  handleVariantChange(
                                    group.id,
                                    "sku",
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="SKU-001"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleGenerateVariantSku(
                                    formData.sku,
                                    group.values,
                                    group.id
                                  )
                                }
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200"
                              >
                                Generate
                              </button>
                            </div>

                            <p className="text-xs text-gray-500">
                              Stock Keeping Unit — must be unique
                            </p>
                          </div>

                          {/* Selected Values Preview */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {group.values.map((valueId) => {
                              const value = variants
                                .flatMap((v) => v.values)
                                .find((val) => val.id === valueId);

                              return (
                                <span
                                  key={valueId}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                                >
                                  {value?.name}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeSelectedVariantValue(
                                        group.id,
                                        valueId
                                      )
                                    }
                                    className="text-green-500 hover:text-green-700 transition"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Section>

            <Section
              title="Images"
              expanded={expandedSections.images}
              onToggle={() => toggleSection("images")}
            >
              <div className="text-sm text-gray-600">
                {images && images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Upload Card */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />

                      <Upload className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition mb-4" />

                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        Upload Images
                      </h3>

                      <p className="text-xs text-gray-500 mb-4">
                        JPG, PNG, WebP — Max 10MB
                      </p>

                      <button
                        type="button"
                        onClick={handleImageChooseButton}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200"
                      >
                        Choose Files
                      </button>
                    </div>

                    {/* Images */}
                    {images.map((image) => (
                      <div
                        key={image.id}
                        onClick={() =>
                          image.id && handlePrimaryImageSelection(image.id)
                        }
                        className={`
              relative group aspect-square rounded-2xl overflow-hidden
              bg-gray-100 cursor-pointer transition-all duration-300
              border
              ${
                image.isPrimary
                  ? "border-blue-600 ring-2 ring-blue-400"
                  : "border-gray-200 hover:border-blue-400"
              }
            `}
                      >
                        <Image
                          src={image.url || image.previewUrl}
                          alt={image.altText || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          width="1000"
                          height="1000"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => image && handleRemoveImage(image)}
                            className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 shadow-md transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Primary Badge */}
                        {image.isPrimary && (
                          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full shadow-sm">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    <Upload className="w-14 h-14 text-gray-400 group-hover:text-blue-500 transition mb-5" />

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Upload Product Images
                    </h3>

                    <p className="text-gray-500 mb-6 max-w-md">
                      Drag and drop your product images here, or click to
                      browse. High-quality images help increase sales.
                    </p>

                    <button
                      type="button"
                      onClick={handleImageChooseButton}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200"
                    >
                      Choose Files
                    </button>

                    <p className="text-xs text-gray-500 mt-4">
                      Recommended: 1200×1200px minimum
                    </p>
                  </div>
                )}
              </div>
            </Section>

            <Section
              title="Categories"
              expanded={expandedSections.categories}
              onToggle={() => toggleSection("categories")}
            >
              <div className="space-y-4">
                {/* Category Select */}
                <div className="space-y-2">
                  <select
                    value=""
                    onChange={(e) =>
                      e.target.value && addCategory(e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select category to add</option>
                    {categories
                      .filter((cat) => !selectedCategories.includes(cat.id))
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selected Categories */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedCategories.map((categoryId) => {
                      const category = categories.find(
                        (c) => c.id === categoryId
                      );

                      return (
                        <span
                          key={categoryId}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                        >
                          {category?.name}
                          <button
                            type="button"
                            onClick={() => removeCategory(categoryId)}
                            className="text-green-500 hover:text-green-700 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </Section>

            <Section
              title="Dimensions"
              expanded={expandedSections.dimensions}
              onToggle={() => toggleSection("dimensions")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Weight */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Length */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.length}
                    onChange={(e) => handleChange("length", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Width */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.width}
                    onChange={(e) => handleChange("width", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="SEO / Metadata"
              expanded={expandedSections.seo}
              onToggle={() => toggleSection("seo")}
            >
              <div className="space-y-6">
                {/* URL Handle */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URL Handle
                  </label>
                  <input
                    type="text"
                    value={formData.urlHandle}
                    onChange={(e) => handleChange("urlHandle", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="product-url-handle"
                  />
                </div>

                {/* Meta Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="SEO optimized title"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleChange("metaDescription", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Write a compelling meta description for search engines..."
                  />
                </div>
              </div>
            </Section>
          </div>
        </form>

        <div className="flex items-center justify-end gap-4 px-6 py-5 border-t border-gray-200 bg-gray-50/70 backdrop-blur-sm">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/70 hover:bg-gray-100 transition-all duration-200 group"
      >
        <h3 className="text-base font-semibold text-gray-900 tracking-tight">
          {title}
        </h3>

        <div className="flex items-center justify-center w-8 h-8 rounded-lg group-hover:bg-white transition">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-6 py-6 border-t border-gray-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
